# import json
# import base64
# import httpx
# from app.core.config import settings

# OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# EXTRACTION_PROMPT = """
# You are a receipt data extraction assistant. Analyze this receipt image carefully.

# Return ONLY a valid JSON object with exactly these fields:
# {
#   "merchant_name": "store or restaurant name",
#   "total_amount": 0.00,
#   "currency": "NGN",
#   "receipt_date": "YYYY-MM-DD",
#   "category": "one of: Food & Dining, Groceries, Transportation, Shopping, Entertainment, Healthcare, Utilities, Other",
#   "line_items": [
#     {
#       "name": "item name",
#       "quantity": 1,
#       "unit_price": 0.00,
#       "total": 0.00
#     }
#   ]
# }

# Rules:
# - Read all numbers very carefully — do not drop or add digits
# - total_amount must be a number, not a string
# - If you cannot find a field, use null
# - Return ONLY the JSON, no markdown, no explanation
# """


# VISION_MODELS = [
#     "google/gemma-3-27b-it:free",
#     "google/gemma-3-12b-it:free",
#     "google/gemma-3-4b-it:free",
#     "nvidia/nemotron-nano-12b-v2-vl:free",
# ]


# def extract_receipt_data(file_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
#     base64_image = base64.b64encode(file_bytes).decode("utf-8")
#     data_url = f"data:{mime_type};base64,{base64_image}"

#     headers = {
#         "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
#         "Content-Type": "application/json",
#         "HTTP-Referer": "http://localhost:8000",
#     }

#     for model in VISION_MODELS:
#         try:
#             print(f"Trying model: {model}")
#             payload = {
#                 "model": model,
#                 "messages": [
#                     {
#                         "role": "user",
#                         "content": [
#                             {"type": "image_url", "image_url": {"url": data_url}},
#                             {"type": "text", "text": EXTRACTION_PROMPT},
#                         ],
#                     }
#                 ],
#             }

#             response = httpx.post(
#                 OPENROUTER_URL,
#                 json=payload,
#                 headers=headers,
#                 timeout=30.0,
#             )

#             if response.status_code == 429:
#                 print(f"Model {model} rate limited, trying next...")
#                 continue

#             response.raise_for_status()

#             raw_text = response.json()["choices"][0]["message"]["content"].strip()
#             print(f"AI RAW RESPONSE: {raw_text}")

#             if raw_text.startswith("```"):
#                 raw_text = raw_text.split("```")[1]
#                 if raw_text.startswith("json"):
#                     raw_text = raw_text[4:]

#             extracted = json.loads(raw_text)
#             return {"success": True, "data": extracted, "model": model}

#         except json.JSONDecodeError as e:
#             print(f"JSON PARSE ERROR from {model}: {e}")
#             return {
#                 "success": False,
#                 "data": {},
#                 "error": "Failed to parse AI response",
#             }
#         except Exception as e:
#             if hasattr(e, "response"):
#                 print(f"EXTRACTION ERROR DETAIL: {e.response.text}")
#             print(f"EXTRACTION ERROR from {model}: {type(e).__name__}: {e}")
#             continue

#     return {
#         "success": False,
#         "data": {},
#         "error": "All models failed or rate limited",
#         "model": None,
#     }


import json
import base64
import time
import httpx
from app.core.config import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

VISION_MODELS = [
    "google/gemma-3-27b-it:free",
    "google/gemma-3-12b-it:free",
    "google/gemma-3-4b-it:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
]

EXTRACTION_PROMPT = """
You are a receipt data extraction assistant. Analyze this receipt and extract information.

Return ONLY a valid JSON object with exactly these fields:
{
  "merchant_name": "store or restaurant name",
  "total_amount": 0.00,
  "currency": "NGN",
  "receipt_date": "YYYY-MM-DD",
  "category": "one of: Food & Dining, Groceries, Transportation, Shopping, Entertainment, Healthcare, Utilities, Other",
  "line_items": [
    {
      "name": "item name",
      "quantity": 1,
      "unit_price": 0.00,
      "total": 0.00
    }
  ]
}

Rules:
- Read all numbers very carefully — do not drop or add digits
- total_amount must be a number, not a string
- If you cannot find a field, use null
- Return ONLY the JSON, no markdown, no explanation
"""


def _parse_retry_after(response_text: str) -> float:
    """Extract retry delay seconds from OpenRouter 429 response."""
    try:
        data = json.loads(response_text)
        details = data.get("error", {}).get("details", [])
        for detail in details:
            if detail.get("@type", "").endswith("RetryInfo"):
                delay_str = detail.get("retryDelay", "10s")
                return float(delay_str.replace("s", "")) + 2
    except Exception:
        pass
    return 10.0


def extract_receipt_data(file_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    base64_image = base64.b64encode(file_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{base64_image}"

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
    }

    # Track rate limit state per model
    model_retry_after = {}

    attempts = 0
    max_attempts = 2  # max full passes through model list

    while attempts < max_attempts:
        all_rate_limited = True

        for model in VISION_MODELS:
            # Check if this model is still in cooldown
            cooldown_until = model_retry_after.get(model, 0)
            if time.time() < cooldown_until:
                wait_remaining = cooldown_until - time.time()
                print(
                    f"Model {model} in cooldown for {wait_remaining:.0f}s more — skipping"
                )
                continue

            all_rate_limited = False

            try:
                print(f"Trying model: {model}")
                payload = {
                    "model": model,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {"type": "image_url", "image_url": {"url": data_url}},
                                {"type": "text", "text": EXTRACTION_PROMPT},
                            ],
                        }
                    ],
                }

                response = httpx.post(
                    OPENROUTER_URL,
                    json=payload,
                    headers=headers,
                    timeout=60.0,
                )

                if response.status_code == 429:
                    retry_after = _parse_retry_after(response.text)
                    model_retry_after[model] = time.time() + retry_after
                    print(f"Model {model} rate limited — cooldown {retry_after:.0f}s")
                    continue

                response.raise_for_status()

                raw_text = response.json()["choices"][0]["message"]["content"].strip()
                print(f"AI RAW RESPONSE from {model}: {raw_text[:200]}")

                if raw_text.startswith("```"):
                    raw_text = raw_text.split("```")[1]
                    if raw_text.startswith("json"):
                        raw_text = raw_text[4:]

                extracted = json.loads(raw_text.strip())
                return {"success": True, "data": extracted, "model": model}

            except json.JSONDecodeError as e:
                print(f"JSON PARSE ERROR from {model}: {e}")
                return {
                    "success": False,
                    "data": {},
                    "error": "Failed to parse AI response",
                    "model": model,
                }

            except Exception as e:
                if hasattr(e, "response"):
                    print(f"ERROR DETAIL from {model}: {e.response.text}")
                print(f"EXTRACTION ERROR from {model}: {type(e).__name__}: {e}")
                continue

        if all_rate_limited:
            # All models in cooldown — find minimum wait and sleep
            min_cooldown = min(model_retry_after.values())
            wait_time = max(min_cooldown - time.time(), 0) + 1
            print(f"All models rate limited — waiting {wait_time:.0f}s before retry")
            time.sleep(wait_time)

        attempts += 1

    return {
        "success": False,
        "data": {},
        "error": "All models rate limited — please try again later",
        "model": None,
    }
