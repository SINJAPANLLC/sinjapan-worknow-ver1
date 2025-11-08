from functools import lru_cache
from typing import Optional
import os

import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2.pool import SimpleConnectionPool
import redis.asyncio as aioredis
from supabase import Client, create_client

from .config import CFG


@lru_cache()
def get_supabase_client() -> Client:
    return create_client(CFG["SUPABASE_URL"], CFG["SUPABASE_KEY"])


_pg_pool: Optional[SimpleConnectionPool] = None


def get_pg_pool() -> SimpleConnectionPool:
    global _pg_pool
    if _pg_pool is None:
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL environment variable is not set")
        _pg_pool = SimpleConnectionPool(1, 10, database_url)
    return _pg_pool


def get_pg_connection():
    pool = get_pg_pool()
    return pool.getconn()


def release_pg_connection(conn):
    pool = get_pg_pool()
    pool.putconn(conn)


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
