from functools import lru_cache
from typing import Optional

import redis.asyncio as aioredis
from supabase import Client, create_client

from .config import CFG


@lru_cache()
def get_supabase_client() -> Client:
    return create_client(CFG["SUPABASE_URL"], CFG["SUPABASE_KEY"])


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
