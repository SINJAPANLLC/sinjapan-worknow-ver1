from functools import lru_cache
from typing import Optional
import os

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import ThreadedConnectionPool
import redis.asyncio as aioredis
from supabase import Client, create_client

from .config import CFG


@lru_cache()
def get_supabase_client() -> Client:
    return create_client(CFG["SUPABASE_URL"], CFG["SUPABASE_KEY"])


_pg_pool: Optional[ThreadedConnectionPool] = None


def get_pg_pool() -> ThreadedConnectionPool:
    global _pg_pool
    if _pg_pool is None:
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is not set")
        _pg_pool = ThreadedConnectionPool(
            minconn=2,
            maxconn=10,
            dsn=database_url,
            connect_timeout=30,
            options="-c statement_timeout=30000"
        )
    return _pg_pool


def get_pg_connection():
    pool = get_pg_pool()
    max_retries = 3
    
    for attempt in range(max_retries):
        try:
            conn = pool.getconn()
            # Test the connection health
            try:
                with conn.cursor() as test_cursor:
                    test_cursor.execute("SELECT 1")
                # Always rollback the health check transaction
                conn.rollback()
                return conn
            except (psycopg2.OperationalError, psycopg2.InterfaceError):
                # Connection is bad, close it
                try:
                    pool.putconn(conn, close=True)
                except:
                    pass
                # Try again on next iteration
                if attempt < max_retries - 1:
                    continue
                else:
                    raise
        except (psycopg2.OperationalError, psycopg2.InterfaceError):
            # Pool or connection issues persist, recreate pool on last attempt
            if attempt == max_retries - 1:
                try:
                    pool.closeall()
                except:
                    pass
                global _pg_pool
                _pg_pool = None
                pool = get_pg_pool()
                conn = pool.getconn()
                try:
                    with conn.cursor() as test_cursor:
                        test_cursor.execute("SELECT 1")
                    conn.rollback()
                except:
                    # If even the fresh pool fails, give up
                    try:
                        pool.putconn(conn, close=True)
                    except:
                        pass
                    raise
                return conn
    
    # Should never reach here, but just in case
    raise psycopg2.OperationalError("Failed to get valid connection after retries")


def release_pg_connection(conn):
    if not conn:
        return
    pool = get_pg_pool()
    try:
        if conn.closed:
            pool.putconn(conn, close=True)
        else:
            # Defensive rollback to clean up any leftover transaction
            try:
                conn.rollback()
            except (psycopg2.InterfaceError, psycopg2.OperationalError):
                # Connection is bad, close it
                pool.putconn(conn, close=True)
                return
            pool.putconn(conn)
    except Exception:
        # If all else fails, try to close the connection
        try:
            conn.close()
        except:
            pass


_redis_pool: Optional[aioredis.Redis] = None


async def get_redis() -> aioredis.Redis:
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = aioredis.from_url(
            CFG["REDIS_URL"], encoding="utf-8", decode_responses=True
        )
    return _redis_pool


async def close_redis() -> None:
    global _redis_pool
    if _redis_pool is not None:
        await _redis_pool.close()
        _redis_pool = None
