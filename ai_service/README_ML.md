# AI Service: Model Validation & MLOps / Power BI Integration Notes

This repo contains a small **AI service** (`ai_service/`) that serves a **Gemma 2** base model with optional **LoRA** adapters.

## 1) Local model-file correctness test

### Script
- `ai_service/app/scripts/test.py`

### What it checks
- Ensures these folders exist and the expected files are readable:
  - `ai_service/app/ai_model/`
    - `config.json`, `generation_config.json`, `model.safetensors`
    - tokenizer files
  - `ai_service/app/lora_model/`
    - `adapter_config.json` and tokenizer files

### What it does next ("talk to it")
- If the Python environment has `torch` (and the HF stack), it tries to load:
  - Unsloth (`FastLanguageModel`) if installed
  - otherwise falls back to `transformers` + `peft` and attempts merge+generate

### Running
From repo root:
```bash
python ai_service/app/scripts/test.py
```

### Common result
- If `torch` is missing:
  - The script prints:
    - `torch is not installed in this Python environment -> skipping inference.`
  - In that case, the **files are likely correct**, but you cannot run generation until you install `torch` in the same environment.


## 2) Tokenizer-only smoke test

### Script
- `ai_service/app/scripts/test_m.py`

### Purpose
- Validates that the base model tokenizer/config files exist.
- Does **not** require model weights to be loaded.

### Running
```bash
python ai_service/app/scripts/test_m.py
```


## 3) Power BI integration + MLOps (future)

You mentioned:
- MLOps in `ai_service/`
- An API for sending data to Power BI (and/or receiving filters/parameters from Power BI)

At the moment, this repo has the model and inference stack, but **no dedicated MLOps pipeline and no Power BI ingestion/export endpoints** are implemented.

A typical approach for Power BI:
- Create an API endpoint like:
  - `POST /api/v1/telemetry/powerbi` (send metrics/logs)
  - `GET /api/v1/powerbi/query` (optional query config)
- Store telemetry in a DB (or write Parquet/JSON files)
- Expose an aggregation endpoint consumed by Power BI’s scheduled refresh

When you’re ready, we can implement:
- `ai_service/app/telemetry/` (schemas, storage, aggregation)
- `ai_service/app/api/v1/telemetry` endpoints
- optional background jobs for metrics packaging/export


