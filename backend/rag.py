import os
import json
from pypdf import PdfReader
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# File paths for persistent storage
DOCS_STORE_FILE = "docs_store.json"
UPLOADED_DOCS_FILE = "uploaded_docs.json"

def load_documents_store():
    if os.path.exists(DOCS_STORE_FILE):
        with open(DOCS_STORE_FILE, "r") as f:
            return json.load(f)
    return []

def save_documents_store(store):
    with open(DOCS_STORE_FILE, "w") as f:
        json.dump(store, f)

def load_uploaded_docs():
    if os.path.exists(UPLOADED_DOCS_FILE):
        with open(UPLOADED_DOCS_FILE, "r") as f:
            return json.load(f)
    return []

def save_uploaded_docs(docs):
    with open(UPLOADED_DOCS_FILE, "w") as f:
        json.dump(docs, f)

def extract_text_from_pdf(file_path):
    reader = PdfReader(file_path)
    text_chunks = []
    for page_num, page in enumerate(reader.pages):
        text = page.extract_text()
        if text and text.strip():
            text_chunks.append({
                "text": text,
                "page": page_num + 1
            })
    return text_chunks

def add_document_to_knowledge_base(file_path, filename):
    try:
        chunks = extract_text_from_pdf(file_path)
        if not chunks:
            return {"status": "error", "message": "Could not extract text from PDF"}

        # Load existing store
        documents_store = load_documents_store()
        uploaded_docs = load_uploaded_docs()

        # Add new chunks
        for chunk in chunks:
            documents_store.append({
                "text": chunk["text"],
                "filename": filename,
                "page": chunk["page"]
            })

        # Track document
        file_size = os.path.getsize(file_path)
        size_str = f"{round(file_size/1024, 1)} KB"

        if not any(d["filename"] == filename for d in uploaded_docs):
            uploaded_docs.append({
                "filename": filename,
                "pages": len(chunks),
                "size": size_str
            })

        # Save to files
        save_documents_store(documents_store)
        save_uploaded_docs(uploaded_docs)

        print(f"✅ Added {len(chunks)} pages. Total chunks: {len(documents_store)}")

        return {
            "status": "success",
            "message": f"Successfully processed {len(chunks)} pages from {filename}"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def query_knowledge_base(question):
    documents_store = load_documents_store()

    print(f"📚 Total chunks in store: {len(documents_store)}")

    if len(documents_store) == 0:
        return {
            "answer": "No documents uploaded yet. Please upload a PDF document first.",
            "sources": []
        }

    # Simple keyword search
    question_words = question.lower().split()
    scored_chunks = []

    for doc in documents_store:
        text_lower = doc["text"].lower()
        score = sum(1 for word in question_words if word in text_lower)
        if score > 0:
            scored_chunks.append((score, doc))

    scored_chunks.sort(key=lambda x: x[0], reverse=True)
    top_chunks = scored_chunks[:3] if scored_chunks else \
                 [(0, doc) for doc in documents_store[:3]]

    context = ""
    sources = []
    for score, doc in top_chunks:
        context += f"\n[From {doc['filename']}, Page {doc['page']}]:\n{doc['text']}\n"
        if not any(s["filename"] == doc["filename"] and
                   s["page"] == doc["page"] for s in sources):
            sources.append({
                "filename": doc["filename"],
                "page": doc["page"]
            })

    prompt = f"""You are IndustrialMind, an expert industrial knowledge assistant.

Answer the following question using ONLY the information from the documents below.
Always mention which document and page number the answer came from.
If the answer is not in the documents, say "This information is not found in the uploaded documents."

DOCUMENTS:
{context}

QUESTION: {question}

ANSWER:"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return {
        "answer": response.choices[0].message.content,
        "sources": sources
    }

def get_all_documents():
    uploaded_docs = load_uploaded_docs()
    # Add status field for frontend
    for doc in uploaded_docs:
        doc["status"] = "Indexed"
    return uploaded_docs

def clear_all_documents():
    save_documents_store([])
    save_uploaded_docs([])
    # Clean up uploads folder
    if os.path.exists("uploads"):
        for f in os.listdir("uploads"):
            os.remove(os.path.join("uploads", f))