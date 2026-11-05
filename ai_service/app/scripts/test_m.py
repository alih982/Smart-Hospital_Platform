#!/usr/bin/env python3
"""Minimal tokenizer-only smoke test (no torch required).

What it checks:
- Base model folder exists
- Expected tokenizer/config files exist and are readable

Optional:
- If transformers is available, it will attempt to load the tokenizer from
  the *absolute* local path (avoids repo_id parsing errors).

Run:
  python ai_service/app/scripts/test_m.py
"""

from __future__ import annotations

import os
from typing import List


# Use absolute paths so transformers never interprets them as a HF repo id.
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(THIS_DIR, "..", ".."))

# BASE model is located at: ai_service/app/ai_model/
BASE_MODEL_PATH = os.path.join(REPO_ROOT, "app", "ai_model")


EXPECTED_FILES: List[str] = [
    "tokenizer.json",
    "tokenizer.model",
    "tokenizer_config.json",
    "config.json",
    "generation_config.json",
]


def _print_state() -> None:
    print(f"[TEST_M] base_model_path={BASE_MODEL_PATH}")
    ok = True
    for name in EXPECTED_FILES:
        p = os.path.join(BASE_MODEL_PATH, name)
        if not os.path.exists(p):
            ok = False
            print(f"  [MISSING] {name}")
            continue
        size_mb = os.path.getsize(p) / (1024 * 1024)
        readable = os.access(p, os.R_OK)
        print(f"  [OK] {name} | size_mb={size_mb:.4f} | readable={readable}")
    print(f"[TEST_M] file_check={'OK' if ok else 'FAIL'}")


def main() -> None:
    _print_state()

    # Optional: tokenizer construction via transformers
    try:
        from transformers import AutoTokenizer  # type: ignore
    except Exception as e:
        print(f"\n[TEST_M] transformers not available: {e}")
        return

    try:
        tokenizer = AutoTokenizer.from_pretrained(
            BASE_MODEL_PATH,
            local_files_only=True,
            # Reduce the known Transformers warning for some Mistral-derived tokenizers.
            fix_mistral_regex=True,
        )

        print(f"\n[TEST_M] AutoTokenizer loaded: type={type(tokenizer).__name__}")

        if getattr(tokenizer, "pad_token", None) is None and getattr(tokenizer, "eos_token", None) is not None:
            print("[TEST_M] pad_token is None; setting pad_token=eos_token (non-fatal)")
            tokenizer.pad_token = tokenizer.eos_token

    except Exception as e:
        print(f"\n[TEST_M] AutoTokenizer.from_pretrained failed: {e}")


if __name__ == "__main__":
    main()

