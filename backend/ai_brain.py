import httpx

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "gemma2:2b"

async def get_thought(human, other=None):
    if other:
        prompt = (
            f"You are {human.name}, a {human.personality} {human.job}. "
            f"Your genes: {', '.join(human.genes)}. Age: {human.age}. "
            f"You just met {other.name}, a {other.personality} {other.job}. "
            f"What do you say or think? 1-2 sentences, first person, natural."
        )
    else:
        prompt = (
            f"You are {human.name}, a {human.personality} {human.job}. "
            f"Your genes: {', '.join(human.genes)}. Age: {human.age}. "
            f"What are you doing or thinking right now? 1-2 sentences, first person."
        )

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(OLLAMA_URL, json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.8, "num_predict": 100}
            })
            data = response.json()
            thought = data.get("response", "").strip()
            if len(thought) < 5:
                return "I need a moment to think..."
            return thought
    except Exception as e:
        return f"..."