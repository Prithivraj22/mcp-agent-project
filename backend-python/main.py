from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import run_agent
import uvicorn

app = FastAPI(title="MCP AI Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class PromptRequest(BaseModel):
    prompt: str

# Health check
@app.get("/health")
def health():
    return {"status": "ok", "service": "fastapi-agent"}

# Main agent route
@app.post("/agent/run")
async def agent_run(req: PromptRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt is required")
    reply = await run_agent(req.prompt)
    return {"reply": reply}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)