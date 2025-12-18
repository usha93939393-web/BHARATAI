# ================== Bharat AI - backend/app.py ==================
# FastAPI + Bharat AI Brain v2 + Auto Image Detect + Llama 3 + Flux Schnell

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import replicate
import uvicorn

# ------------------- FASTAPI APP -------------------
app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- REPLICATE API KEY -------------------
REPLICATE_API_TOKEN = "YOUR_REPLICATE_API_KEY"
replicate.Client(api_token=REPLICATE_API_TOKEN)

# =========================================================
#                   BHARAT AI BRAIN v2  
# =========================================================
# Auto Image Detect + Rules + Safety Filter + Llama-3 Model

@app.post("/generate-text")
async def generate_text(data: dict):
    prompt = data.get("prompt", "").lower().strip()

    # ----------- AUTO IMAGE COMMAND DETECTION -----------
    image_words = ["image", "photo", "pic", "picture", "banao", "banado", "generate"]
    if any(w in prompt for w in image_words):
        try:
            output = replicate.run(
                "black-forest-labs/flux-schnell",
                input={"prompt": prompt}
            )
            return {"image": output}
        except Exception as e:
            return {"reply": f"Image generation error: {str(e)}"}

    # ----------- RULE-BASED SMART RESPONSES -----------
    if "hello" in prompt or "hi" in prompt:
        return {"reply": "Namaste! Main Bharat AI hoon. Aap kaise ho?"}

    if "who created you" in prompt:
        return {"reply": "Mujhe ek Indian developer ne banaya hai jo Bharat ka apna AI banana chahta tha."}

    if "your name" in prompt:
        return {"reply": "Mera naam Bharat AI hai — India ka apna AI."}

    # ----------- SAFETY FILTER -----------
    unsafe = ["hack", "illegal", "virus", "kill", "bomb"]
    if any(u in prompt for u in unsafe):
        return {"reply": "Maaf kijiye, main is request me madad nahi kar sakta."}

    # ----------- REAL LLAMA 3 GENERATION -----------
    try:
        response = replicate.run(
            "meta/meta-llama-3-8b-instruct",
            input={"prompt": prompt}
        )
        final = "".join(response)
        return {"reply": final}

    except Exception as e:
        return {"reply": f"AI backend error: {str(e)}"}

# ------------------- START SERVER -------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)