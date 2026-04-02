import httpx


def get_location_from_ip(ip: str) -> dict:
    try:
        # Free, no API key needed, 45 requests/minute
        response = httpx.get(f"http://ip-api.com/json/{ip}", timeout=5.0)
        data = response.json()
        if data.get("status") == "success":
            return {
                "country": data.get("country"),
                "region": data.get("regionName"),
                "city": data.get("city"),
                "ip": ip,
            }
    except Exception:
        pass
    return {"country": None, "region": None, "city": None, "ip": ip}
