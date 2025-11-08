import aiohttp
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class GeocodingService:
    NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
    
    @staticmethod
    async def geocode_address(address: str) -> Optional[Tuple[float, float]]:
        try:
            async with aiohttp.ClientSession() as session:
                params = {
                    'q': address,
                    'format': 'json',
                    'limit': 1,
                    'countrycodes': 'jp',
                }
                headers = {
                    'User-Agent': 'WorkNow/1.0 (Job Matching Platform)'
                }
                
                async with session.get(
                    GeocodingService.NOMINATIM_URL,
                    params=params,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data and len(data) > 0:
                            lat = float(data[0]['lat'])
                            lon = float(data[0]['lon'])
                            logger.info(f"Geocoded '{address}' to ({lat}, {lon})")
                            return (lat, lon)
                    else:
                        logger.warning(f"Geocoding failed for '{address}': HTTP {response.status}")
                        return None
        except Exception as e:
            logger.error(f"Geocoding error for '{address}': {e}")
            return None
