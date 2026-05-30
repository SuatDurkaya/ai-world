# Fast API

from database import reset_world, get_recent_conversations
from fastapi import FastAPI
from simulation import SimulationEngine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

sim = SimulationEngine()
sim.start()

@app.get("/")
def root():
    return {"message": "World is rotating!", "tick": sim.tick}

@app.get("/world")
def get_world():
    return {
        "tick": sim.tick,
        "total": len(sim.humans),
        "alive": len([h for h in sim.humans if h.alive]),
        "humans": [h.to_dict() for h in sim.humans]
    }

@app.post("/tick")
async def run_tick():
    await sim.run_tick()
    return {
        "tick": sim.tick,
        "total": len(sim.humans),
        "alive": len([human for human in sim.humans if human.alive]),
        "humans": [human.to_dict() for human in sim.humans]
    }

@app.post("/reset")
def reset():
    sim.humans = []
    sim.tick = 0
    reset_world()
    sim.start()
    return {"message": "World reset!"}

@app.get("/conversations")
def get_conversations():
    return get_recent_conversations(20)