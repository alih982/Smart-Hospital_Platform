<div align="center">

# 🧠 AI Service — RAG-Powered Hospital Assistant

**FastAPI microservice that exposes a custom Retrieval-Augmented Generation (RAG) pipeline for the Smart Hospital Platform — grounded medical Q&A over hospital guidelines, drug references, and patient FAQs.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)](https://python.org/)
[![LangChain](https://img.shields.io/badge/LangChain-0.2-1C3C3C)](https://python.langchain.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

</div>

---

## 📖 Overview

This is the **AI layer** of the Smart Hospital Platform. It exposes a context-aware assistant that answers questions from **patients** (symptoms, medication usage, appointment guidance) and **staff** (hospital protocols, drug interactions) using a **RAG pipeline**.

The service is intentionally decoupled from the Django core:

| Service | Owns |
|---------|------|
| **Django (core)** | Users, appointments, prescriptions, orders — transactional truth |
| **FastAPI (this service)** | LLM inference, embeddings, retrieval, evaluation |
| **PostgreSQL (shared)** | Business data |
| **PostgreSQL + pgvector (isolated)** | Embeddings + model artifacts — **separate DB** so training/indexing I/O never contends with transactional queries |

This isolation is a deliberate **workload separation**, not a full microservice split: a crash or slowdown in the AI service does not take down appointments or the pharmacy.

---

## 🏗️ Architecture

```mermaid
flowchart LR
    FE["🌐 Next.js Frontend"]
    AI["🔌 FastAPI<br/>(this service)"]
    LLM["🧠 Gemma 2<br/>(Ollama / vLLM)"]
    EMB["📐 Embedding Model<br/>(multilingual)"]
    AIDB[("📐 PostgreSQL + pgvector<br/>(AI-only DB)")]

    FE -->|POST /chat| AI
    AI -->|embed query| EMB
    AI -->|top-k similarity| AIDB
    AI -->|prompt + context| LLM
    LLM -->|answer| AI
    AI -->|JSON + sources| FE
