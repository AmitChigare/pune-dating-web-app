from config.settings import settings

def is_within_pune(latitude: float, longitude: float) -> bool:
    """
    Check if the given coordinates are within Pune bounds.
    """
    if latitude is None or longitude is None:
        return False
        
    return (
        settings.PUNE_LAT_MIN <= latitude <= settings.PUNE_LAT_MAX and
        settings.PUNE_LONG_MIN <= longitude <= settings.PUNE_LONG_MAX
    )
