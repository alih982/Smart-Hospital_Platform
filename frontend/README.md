<div align="center">

# 🌐 Frontend — Next.js 14 App

**Patient, Doctor, and Admin panels for the Smart Hospital Platform — appointment booking, e-pharmacy, e-prescriptions, and an AI assistant chat.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?logo=typescript)](https://typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

</div>

---

## 📖 Overview

This is the **frontend layer** of the Smart Hospital Platform. It is a **Next.js 14 App Router** application with **TypeScript** and **TailwindCSS**, serving three distinct user roles:

- **Patients** — book appointments, view prescriptions, order from pharmacy, chat with AI
- **Doctors** — manage schedules, issue e-prescriptions, view patient records
- **Admins** — manage users, doctors, pharmacy inventory, and analytics

The frontend talks to two backends:

| Backend | What it serves |
|---------|----------------|
| **Django REST API** (`/api/*`) | Auth, appointments, prescriptions, pharmacy, user data |
| **FastAPI AI Service** (`/ai/*`) | RAG-based assistant chat |

---

## 🏗️ Architecture

```mermaid
flowchart LR
    U["👤 User<br/>(Patient / Doctor / Admin)"]
    FE["🌐 Next.js 14<br/>(this app)"]
    NG["🛡️ Nginx"]
    DJ["🔌 Django API"]
    AI["🧠 FastAPI AI"]

    U -->|HTTPS| FE
    FE -->|/api/*| NG
    FE -->|/ai/*| NG
    NG --> DJ
    NG --> AI