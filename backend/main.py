from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Virtual Interview API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GROQ_API_KEY", "")
client = OpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1",
)

class PromptRequest(BaseModel):
    analysis_report: str
    subject: str

@app.post("/api/generate-interview")
async def generate_interview(request: PromptRequest):
    """
    Generates the dynamic targeted interrogation prompt based on the CAT report using Groq.
    """
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
        
    system_prompt = (
        "You are a strict, highly technical interviewer. The user has failed a section of an exam. "
        "Based on the provided exam report, identify the main failure point, and ask them a highly targeted, "
        "process-oriented question to evaluate their practical knowledge. Do NOT ask for definitions. "
        "Ask them to walk through the exact steps to solve the issue or implement the feature. "
        "Keep your question under 3 sentences."
    )
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Subject: {request.subject}\nReport:\n{request.analysis_report}"}
            ]
        )
        ai_text = response.choices[0].message.content
        
        # Groq does not have a native TTS API yet, so we return the text and let the frontend use native browser TTS.
        return {
            "prompt_text": ai_text,
            "audio_base64": None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/evaluate-interview")
async def evaluate_interview(
    audio: UploadFile = File(...),
    subject: str = Form(...),
    original_prompt: str = Form(...)
):
    """
    Accepts the audio blob, transcribes it via Whisper on Groq, evaluates it, and decides whether to drop a sandbox.
    """
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
        
    # Transcribe Audio
    try:
        # Save temporary file since Groq Whisper API needs a file with extension
        # Using .webm because frontend sends webm
        temp_file_path = f"temp_{audio.filename}"
        with open(temp_file_path, "wb") as buffer:
            buffer.write(await audio.read())
            
        with open(temp_file_path, "rb") as f:
            transcript = client.audio.transcriptions.create(
                model="whisper-large-v3", 
                file=(temp_file_path, f.read())
            )
            
        os.remove(temp_file_path)
        transcribed_text = transcript.text
        
    except Exception as e:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    # Evaluate Transcription
    system_prompt = (
        "You are evaluating a candidate's verbal response to a technical question. "
        "Evaluate the transcript strictly based on these criteria: "
        "1. Did they outline concrete, correct technical steps? "
        "2. Did they sound hesitant or use excessive filler words (um, uh, like)? "
        "Output ONLY a valid JSON object with these exact keys: "
        "\"score\" (integer 0-100), "
        "\"deploy_sandbox\" (boolean, true if score < 70), "
        "\"ai_voice_response\" (string, strict feedback to the user)."
    )
    
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            response_format={ "type": "json_object" },
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Prompt asked: {original_prompt}\nSubject: {subject}\nCandidate's response: {transcribed_text}"}
            ]
        )
        
        result_json = json.loads(response.choices[0].message.content)
        result_json["transcription"] = transcribed_text
        result_json["audio_base64"] = None
        
        return result_json
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
