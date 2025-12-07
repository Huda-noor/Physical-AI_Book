"""
Script to download and cache the sentence-transformers embedding model.
Run this before starting the backend to avoid startup delays.
"""
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

MODEL_NAME = os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
CACHE_DIR = os.getenv("TRANSFORMERS_CACHE", "./models_cache")


def main():
    """Download and cache the embedding model."""
    print(f"📥 Downloading model: {MODEL_NAME}")
    print(f"📁 Cache directory: {CACHE_DIR}")
    print()

    # Create cache directory
    os.makedirs(CACHE_DIR, exist_ok=True)

    try:
        # Download model
        print("⏳ Downloading... (this may take 1-2 minutes for first run)")
        model = SentenceTransformer(
            MODEL_NAME,
            cache_folder=CACHE_DIR,
            device="cpu"
        )

        # Test encoding
        print("\n🧪 Testing model...")
        test_embedding = model.encode("test", convert_to_numpy=True)

        print(f"✅ Model downloaded and cached successfully!")
        print(f"   Embedding dimension: {len(test_embedding)}")
        print(f"   Model size: ~80MB")
        print(f"\n📌 Model ready for use in backend/app/services/embedding_service.py")

    except Exception as e:
        print(f"\n❌ Failed to download model: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
