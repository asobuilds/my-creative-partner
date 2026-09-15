import os
from dotenv import load_dotenv

load_dotenv()

keys = [
    "GROQ_API_KEY",
    "GEMINI_API_KEY",
    "OPENROUTER_API_KEY",
    "PEXELS_KEY",
    "PIXABAY_API_KEY",
    "ELEVENLABS_API_KEY",
    "SHOTSTACK_API_KEY"
]

print("--- Environment Keys Verification ---")
for key in keys:
    val = os.getenv(key)
    if val and not val.startswith("your_"):
        print(f"[SUCCESS] {key}: Configured ({val[:4]}...)")
    else:
        print(f"[MISSING/DEFAULT] {key}: Not configured properly")
