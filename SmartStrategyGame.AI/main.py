from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class MatchData(BaseModel):
    gameId: str
    gameState: dict

@app.get("/")
def read_root():
    return {"status": "AI Service Running"}

@app.post("/analyze-match")
def analyze_match(data: MatchData):
    # Mock analysis logic
    return {
        "gameId": data.gameId,
        "recommendation": "Build more resource collectors.",
        "winProbability": 0.45
    }

@app.get("/recommendations/{game_id}")
def get_recommendations(game_id: str):
    return {
        "gameId": game_id,
        "nextMove": "Attack player 2 base"
    }
