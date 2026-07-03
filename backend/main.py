import os
import base64
import httpx
import json
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ReWear AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten this to your Vercel URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are ReWear AI, an expert sustainable fashion assistant with deep knowledge of
fabric types, garment construction, stain removal, tailoring, and modern styling.

Analyze the clothing item in the provided image and return ONLY valid JSON with this exact structure:
{
  "garmentType": "specific type e.g. white cotton t-shirt, blue denim jacket, floral silk dress",
  "condition": "brief description e.g. coffee stain on chest, small tear at left seam, faded color",
  "issue": "one clear sentence describing the main problem or opportunity",
  "severity": "minor | moderate | major",
  "material": "detected fabric e.g. cotton, polyester, denim, silk, wool",
  "repairOption": {
    "title": "DIY repair title in 5 words or less",
    "summary": "2-sentence summary of the repair approach and expected result",
    "steps": [
      "Step with specific materials and actions",
      "Step with specific materials and actions",
      "Step with specific materials and actions",
      "Step with specific materials and actions",
      "Step with specific materials and actions"
    ],
    "materialsNeeded": ["item1", "item2", "item3"]
  },
  "styleOption": {
    "title": "Restyle title in 5 words or less",
    "summary": "2-sentence description of the styling philosophy for this piece",
    "outfits": [
      {"look": "Look name", "description": "Specific items to pair with and the resulting vibe"},
      {"look": "Look name", "description": "Specific items to pair with and the resulting vibe"},
      {"look": "Look name", "description": "Specific items to pair with and the resulting vibe"},
      {"look": "Look name", "description": "Specific items to pair with and the resulting vibe"}
    ]
  },
  "sustainabilityTip": "One sentence on the environmental impact of repairing vs discarding this item"
}

Return ONLY the JSON object. No markdown, no backticks, no explanation text whatsoever."""


@app.get("/")
async def root():
    return {"status": "ReWear AI API is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok", "groq_configured": bool(GROQ_API_KEY)}


@app.post("/analyze")
async def analyze_garment(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted.")

    # Read and encode the image
    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="Image must be under 10MB.")

    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    media_type = file.content_type  # e.g. image/jpeg

    # Build the Groq request (llama-4-scout-17b-16e-instruct supports vision)
    payload = {
        "model": "meta-llama/llama-4-scout-17b-16e-instruct",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{media_type};base64,{image_b64}"
                        },
                    },
                    {
                        "type": "text",
                        "text": "Analyze this garment and provide your full assessment as JSON."
                    }
                ],
            }
        ],
        "temperature": 0.3,
        "max_tokens": 1500,
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            response = await client.post(GROQ_API_URL, json=payload, headers=headers)
            response.raise_for_status()
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Groq API error: {e.response.text}"
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Could not reach Groq API: {str(e)}")

    data = response.json()
    raw_text = data["choices"][0]["message"]["content"]

    # Strip markdown fences if model adds them
    clean = raw_text.strip()
    if clean.startswith("```"):
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    clean = clean.strip()

    try:
        result = json.loads(clean)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Model returned invalid JSON. Please try again."
        )

    return JSONResponse(content=result)
