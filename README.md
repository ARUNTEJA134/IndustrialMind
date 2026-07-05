# 🏭 IndustrialMind
## AI-Powered Industrial Knowledge Intelligence

IndustrialMind is a RAG-based industrial knowledge management 
system that lets engineers and technicians query their technical 
documents using natural language.

## Features
- 📄 Upload industrial PDF documents
- 💬 Ask questions in plain English
- 📌 Get answers with source citations
- 🌐 General AI mode for open questions
- 🗂️ Document knowledge base management

## Tech Stack
- Frontend: React.js
- Backend: FastAPI (Python)
- AI: Groq API (llama-3.3-70b-versatile)
- RAG: Custom keyword-based retrieval
- Storage: File-based JSON persistence

## Setup Instructions

### Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload

### Frontend
cd frontend
npm install
npm start

## Architecture
- React frontend communicates with FastAPI backend
- Documents are uploaded and text extracted via PyPDF
- Text chunks stored in JSON for persistence
- Groq LLM answers questions based on retrieved context

## Hackathon
ET AI Hackathon 2.0 — Problem Statement 8
Industrial Knowledge Intelligence