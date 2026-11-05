<div align="center">

# 🏥 Smart Hospital Platform

**A unified platform for hospital management — appointments, e-pharmacy, e-prescriptions, and a custom RAG-based AI assistant.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.0-092E20?logo=django)](https://djangoproject.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 Overview

**Smart Hospital** is a full-stack, integrated platform for hospital management that merges **online appointment booking**, **e-pharmacy**, **digital prescriptions**, and a **RAG-powered AI assistant** into a single ecosystem.

The goal is to digitize the entire treatment cycle — from booking an appointment to receiving medication and following up with the patient.
## 🎬 Demo

[![Watch the demo](https://youtube.com/shorts/vGGJMNxwgZs)
### 🎯 Key Features

- 📅 **Smart Appointment System** — Booking, cancellation, rescheduling, and automated reminders
- 💊 **Online Pharmacy** — Search, order, cart, and checkout
- 📄 **E-Prescription** — Direct link between doctor prescriptions and the pharmacy
- 🤖 **Custom AI Assistant** — Powered by RAG and the Gemma 2 model
- 📊 **Automated Dashboard** — Live stats on sales, appointments, and doctor performance
- 👥 **Multi-Role Access Control** — Admin / Doctor / Patient
---

## 🧩 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, TailwindCSS |
| **Backend Core** | Django 5 + Django REST Framework |
| **Backend AI** | FastAPI, LangChain, HuggingFace Transformers |
| **Database** | PostgreSQL 16 + pgvector |
| **AI Model** | Gemma 2 (via Ollama / vLLM) |
| **RAG** | pgvector + Multilingual Embeddings |
| **DevOps** | Docker, Docker Compose, Nginx |
| **Auth** | JWT + Role-Based Access Control (RBAC) |

---

## 👤 Roles & Panels

### 🩺 Doctor Panel
- Manage appointments and working calendar
- Write and issue e-prescriptions
- View patient records and history
- Performance and revenue reports

### 🧑‍💼 Admin Panel
- Manage users, doctors, and departments
- Manage pharmacy and inventory
- Full analytics dashboard
- Manage RAG knowledge base content

### 🧑‍🦱 Patient Panel
- Book and manage appointments
- View and track prescriptions
- Purchase medication from the pharmacy
- Chat with the AI assistant

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.12+
- Git LFS (optional, for AI model)

### 1. Clone the repository

```bash
git clone https://github.com/alih982/Hospital_Application.git
cd Hospital_Application

cp .env.example .env
# Edit .env with your values

pip install huggingface-hub
model link or
ollama pull gemma2:9b

docker compose up -d --build

Then access the services at:

Service	URL
🌐 Frontend	http://localhost:3000
🔌 Django API	http://localhost:8000
🧠 FastAPI AI	http://localhost:8001
⚙️ Django Admin	http://localhost:8000/admin
📚 API Docs (Swagger)	http://localhost:8000/api/docs

Manual Setup (Development)
Backend (Django):
cd backend/django_app
python -m venv .venv && source .venv/bin/activate
pip install -r requirements/dev.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

AI Service (FastAPI):
cd ai_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001

Frontend (Next.js):
cd frontend
npm install
npm run dev

🔐 Environment Variables
See .env.example for the complete list. The most important ones:
# ---------- Django ----------
DJANGO_SECRET_KEY=change-me-in-production
DEBUG=True
DATABASE_URL=postgresql://hospital:hospital_pass@db:5432/hospital

# ---------- JWT ----------
JWT_SECRET_KEY=change-me-too
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440

# ---------- AI ----------
AI_MODEL=gemma2:9b
OLLAMA_HOST=http://ollama:11434
RAG_ENABLED=false
EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2

# ---------- Frontend ----------
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AI_URL=http://localhost:8001

```markdown
## 🤖 AI Assistant (RAG)

The RAG system is implemented as a **potential feature** and can be activated by setting `RAG_ENABLED=true`.

- **LLM:** Gemma 2 (compatible with Ollama / vLLM)
- **Embeddings:** Multilingual (Persian + English)
- **Vector Store:** pgvector inside PostgreSQL
- **Sources:** Medical articles, drug references, hospital FAQ

### Activation

```env
RAG_ENABLED=true
AI_MODEL=gemma2:9b
```

Then index your documents:

```bash
python manage.py rag_index --source=medical_docs/
```

---

## 📸 Screenshots

> Coming soon

| Patient Panel | Doctor Panel | Admin Panel |
|---------------|--------------|-------------|
| ![Patient](docs/screens/patient.png) | ![Doctor](docs/screens/doctor.png) | ![Admin](docs/screens/admin.png) |

---

## 📂 Project Structure

```
Hospital_Application/
├── backend/
│   ├── django_app/           # Django REST API
│   │   ├── apps/
│   │   │   ├── accounts/     # Auth & roles
│   │   │   ├── doctors/      # Doctor management
│   │   │   ├── appointments/ # Appointment booking
│   │   │   ├── pharmacy/     # Pharmacy
│   │   │   ├── prescriptions/# E-prescriptions
│   │   │   └── patients/     # Patient records
│   │   └── manage.py
│   └── fastapi_ai/           # AI service
├── ai_service/               # Model & RAG
│   └── app/
│       ├── rag/
│       ├── embeddings/
│       └── chat/
├── frontend/                 # Next.js 14
│   └── src/
│       ├── app/
│       │   ├── (auth)/
│       │   ├── dashboard/
│       │   ├── pharmacy/
│       │   └── appointments/
│       └── components/
├── nginx/                    # Reverse Proxy
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🗺️ Roadmap

- [x] Initial architecture & Docker setup
- [x] Authentication & RBAC
- [x] Appointment booking system
- [x] Pharmacy & e-prescriptions
- [x] Admin / Doctor / Patient dashboards
- [ ] Full RAG activation in production
- [ ] Payment gateway integration (Stripe / ZarinPal)
- [ ] Mobile app (React Native)
- [ ] Complete OpenAPI / Swagger documentation
- [ ] Unit & E2E tests
- [ ] CI/CD with GitHub Actions

---

## 🧪 Testing

```bash
# Backend
cd backend/django_app
pytest

# Frontend
cd frontend
npm run test
npm run test:e2e
```

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a PR.

Commit message conventions:

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting |
| `refactor:` | Code refactoring |
| `chore:` | Maintenance tasks |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

- **GitHub:** [@alih982](https://github.com/alih982)
- **Repository:** [Hospital_Application](https://github.com/alih982/Hospital_Application)

---

<div align="center">

**Built with ❤️ to improve healthcare systems**

⭐ If you find this project useful, please give it a star!

</div>
