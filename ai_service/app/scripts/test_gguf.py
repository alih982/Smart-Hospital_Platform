#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for GGUF model with llama-cpp-python.
Tests: loading, Persian prompt, English prompt, health check.
"""
import json
import os
import sys
import time
import requests

AI_SERVICE_URL = os.environ.get("AI_SERVICE_URL", "http://127.0.0.1:5007")

def test_health():
    print("\n=== Testing /health ...")
    r = requests.get(f"{AI_SERVICE_URL}/health", timeout=10)
    data = r.json()
    print(f"  Status: {r.status_code}")
    print(f"  model_loaded: {data.get('model_loaded')}")
    print(f"  load_error: {data.get('load_error')}")
    assert r.status_code == 200
    return data

def test_chat(prompt: str, label: str = ""):
    print(f"\n=== Testing /api/v1/chat {label}...")
    print(f"  Prompt: {prompt}")
    payload = {"message": prompt}
    start = time.time()
    r = requests.post(
        f"{AI_SERVICE_URL}/api/v1/chat",
        json=payload,
        timeout=600  # 10 minutes for first load
    )
    elapsed = time.time() - start
    data = r.json()
    print(f"  Status: {r.status_code}")
    print(f"  Success: {data.get('success')}")
    print(f"  Response: {data.get('response', '')[:200]}")
    print(f"  Time: {elapsed:.1f}s")
    assert r.status_code == 200
    assert data.get("success") is True
    return data

def main():
    print("=" * 60)
    print("GGUF Model Test Suite")
    print("=" * 60)

    # 1. Health check
    health = test_health()
    
    # If model not loaded, do a quick chat to trigger lazy load
    if not health.get("model_loaded"):
        print("\n  Model not loaded yet — will trigger lazy load with first request.")
    
    # 2. Test Persian
    persian_response = test_chat(
        "سلام! لطفاً یک جمله ساده به فارسی بنویس.",
        label="[PERSIAN]"
    )
    
    # 3. Test English  
    english_response = test_chat(
        "Hello! Please write a short sentence in English.",
        label="[ENGLISH]"
    )
    
    # 4. Verify response is non-empty
    persian_text = persian_response.get("response", "")
    english_text = english_response.get("response", "")
    
    print("\n" + "=" * 60)
    print("RESULTS:")
    print(f"  Persian response length: {len(persian_text)} chars")
    print(f"  English response length: {len(english_text)} chars")
    
    if len(persian_text) > 0:
        print("  ✓ Persian support: WORKING")
    else:
        print("  ✗ Persian support: EMPTY RESPONSE")
    
    if len(english_text) > 0:
        print("  ✓ English support: WORKING")
    else:
        print("  ✗ English support: EMPTY RESPONSE")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
