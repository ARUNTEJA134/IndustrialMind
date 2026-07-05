import os
from dotenv import load_dotenv
from google import genai

# Load your API key from .env file
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

# Connect to Gemini using new client
client = genai.Client(api_key=api_key)

# Test question
question = "What is industrial knowledge management and why is it important?"

print("Sending question to Gemini AI...")
print("Question:", question)
print("-" * 50)

# Get answer from Gemini
response = client.models.generate_content(
    model="gemini-2.0-flash-lite",
    contents=question
)

print("Answer from Gemini:")
print(response.text)