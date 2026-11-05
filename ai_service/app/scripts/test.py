#!/usr/bin/env python3
"""Smoke test for Gemma 2 + LoRA (local files).

This script is designed to answer: "Are my local model files correct?"

What it does:
1) Validates your local folders contain expected files (presence + readability).
2) Optionally loads the base model weights to confirm that serialization/loading works.

Why we keep generation optional:
- On CPU-only machines, Gemma model loading can be heavy; OS may kill the process.
- Generation can be even heavier.

Default behavior:
- Performs file presence checks.
- Attempts model+tokenizer load.
- SKIPS text generation.

Run:
  cd ai_service
  source .venv/bin/activate

Load-only (recommended for your situation):
  python app/scripts/test.py --load-only

If you really want generation:
  python app/scripts/test.py --generate
"""

from __future__ import annotations

import argparse
import os
import traceback
from typing import List, Tuple

import torch


BASE_MODEL_PATH = os.path.join("app", "ai_model")
LORA_MODEL_PATH = os.path.join("app", "lora_model")

TESTS: List[Tuple[str, str]] = [
    ("What are common symptoms of high blood pressure?", "Answer briefly in Persian."),
    ("Give a short explanation of diabetes type 2.", "Answer briefly in Persian."),
]

EXPECTED_BASE_FILES = [
    "config.json",
    "generation_config.json",
    "model.safetensors",
    "tokenizer.json",
    "tokenizer.model",
    "tokenizer_config.json",
]

# NOTE: We only validate presence/readability for LoRA folder.
EXPECTED_LORA_FILES = [
    "adapter_config.json",
    "tokenizer.json",
    "tokenizer.model",
    "tokenizer_config.json",
]


def _print_folder_state(folder: str, expected_files: List[str]) -> None:
    print(f"\n[CHECK] folder={folder}")
    if not os.path.isdir(folder):
        print("  [MISSING] folder does not exist")
        return

    try:
        all_files = sorted(os.listdir(folder))
        print(f"  [OK] folder exists | files({len(all_files)})={all_files}")
    except Exception as e:
        print(f"  [OK] folder exists | but cannot list files: {e}")

    for name in expected_files:
        p = os.path.join(folder, name)
        if not os.path.exists(p):
            print(f"  [MISSING] {name}")
            continue
        size_mb = os.path.getsize(p) / (1024 * 1024)
        readable = os.access(p, os.R_OK)
        print(f"  [OK] {name} | size_mb={size_mb:.4f} | readable={readable}")


def _gemma_prompt(user_message: str, system_prompt: str) -> str:
    return (
        f"<start_of_turn>system\n{system_prompt}<end_of_turn>\n"
        f"<start_of_turn>user\n{user_message}<end_of_turn>\n"
        f"<start_of_turn>model\n"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--load-only", action="store_true", help="Load tokenizer+model, do NOT generate")
    parser.add_argument("--generate", action="store_true", help="Run generation (may be heavy on CPU)")
    parser.add_argument("--max-new-tokens", type=int, default=16)
    args = parser.parse_args()

    # Default to load-only unless user explicitly requests generation.
    do_generate = bool(args.generate)
    do_load_only = bool(args.load_only) or (not do_generate)

    print("[SMOKE] Gemma-2 local file validation")

    # 1) Filesystem checks
    _print_folder_state(BASE_MODEL_PATH, EXPECTED_BASE_FILES)
    _print_folder_state(LORA_MODEL_PATH, EXPECTED_LORA_FILES)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"\n[INFO] device={device}")

    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer

        # 2) Tokenizer load
        tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL_PATH, local_files_only=True)
        if getattr(tokenizer, "pad_token", None) is None:
            tokenizer.pad_token = tokenizer.eos_token

        # 3) Model load (this is the most expensive step)
        model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL_PATH,
            local_files_only=True,
            torch_dtype=torch.float32,
        ).to(device)
        model.eval()

        print("\n[LOAD] Tokenizer+model loaded successfully.")

        if do_load_only:
            print("[SKIP] --load-only: generation skipped.")
            return

        # 4) Optional generation
        system_prompt = "شما یک دستیار پزشکی حاذق هستید. پاسخ مختصر و مفید به فارسی بدهید."

        for user_q, style in TESTS:
            prompt = _gemma_prompt(user_q + "\n" + style, system_prompt)
            inputs = tokenizer(prompt, return_tensors="pt").to(device)

            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_new_tokens=int(args.max_new_tokens),
                    do_sample=True,
                    temperature=0.7,
                    top_p=0.9,
                    pad_token_id=getattr(tokenizer, "eos_token_id", None),
                    eos_token_id=getattr(tokenizer, "eos_token_id", None),
                    use_cache=True,
                )

            decoded = tokenizer.decode(outputs[0], skip_special_tokens=True)
            print(f"\n[GEN] Q: {user_q}")
            if "### Response:" in decoded:
                decoded = decoded.split("### Response:", 1)[-1].strip()
            print("[GEN] A tail:")
            print(decoded[-250:])

        print("\n[SMOKE] Generation completed.")

    except Exception as e:
        print("\n[ERROR] Smoke test failed:")
        print(f"  {type(e).__name__}: {e}")
        print(traceback.format_exc())


if __name__ == "__main__":
    main()

