from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from dotenv import load_dotenv
from groq import Groq
from rag import add_document_to_knowledge_base, query_knowledge_base, get_all_documents, clear_all_documents

load_dotenv()

app = FastAPI(title="IndustrialMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
os.makedirs("uploads", exist_ok=True)

class QuestionRequest(BaseModel):
    question: str

@app.get("/")
def home():
    return {"message": "IndustrialMind API is running!"}

@app.get("/documents")
def list_documents():
    try:
        docs = get_all_documents()
        return {"status": "success", "documents": docs}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/clear-documents")
def clear_documents():
    try:
        clear_all_documents()
        return {"status": "success", "message": "Knowledge base cleared"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    try:
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        result = add_document_to_knowledge_base(file_path, file.filename)
        return result
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/ask")
def ask_question(request: QuestionRequest):
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are IndustrialMind, an expert AI assistant for industrial knowledge management."
                },
                {
                    "role": "user",
                    "content": request.question
                }
            ]
        )
        return {
            "status": "success",
            "question": request.question,
            "answer": response.choices[0].message.content
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/ask-document")
def ask_document(request: QuestionRequest):
    try:
        result = query_knowledge_base(request.question)
        return {
            "status": "success",
            "question": request.question,
            "answer": result["answer"],
            "sources": result.get("sources", [])
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}