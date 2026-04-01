import json
import base64
import httpx
from app.core.config import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

EXTRACTION_PROMPT = """
You are a receipt data extraction assistant. Analyze this receipt image carefully.

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


VISION_MODELS = [
    "google/gemma-3-27b-it:free",
    "google/gemma-3-12b-it:free",
    "google/gemma-3-4b-it:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
]


def extract_receipt_data(file_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    base64_image = base64.b64encode(file_bytes).decode("utf-8")
    data_url = f"data:{mime_type};base64,{base64_image}"

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
    }

    for model in VISION_MODELS:
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
                timeout=30.0,
            )

            if response.status_code == 429:
                print(f"Model {model} rate limited, trying next...")
                continue

            response.raise_for_status()

            raw_text = response.json()["choices"][0]["message"]["content"].strip()
            print(f"AI RAW RESPONSE: {raw_text}")

            if raw_text.startswith("```"):
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]

            extracted = json.loads(raw_text)
            return {"success": True, "data": extracted}

        except json.JSONDecodeError as e:
            print(f"JSON PARSE ERROR from {model}: {e}")
            return {
                "success": False,
                "data": {},
                "error": "Failed to parse AI response",
            }
        except Exception as e:
            if hasattr(e, "response"):
                print(f"EXTRACTION ERROR DETAIL: {e.response.text}")
            print(f"EXTRACTION ERROR from {model}: {type(e).__name__}: {e}")
            continue

    return {"success": False, "data": {}, "error": "All models failed or rate limited"}
