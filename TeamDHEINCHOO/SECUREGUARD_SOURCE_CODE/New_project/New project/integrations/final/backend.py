from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI()

# Add CORS support for dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

event_queue = []

def push_event(message):
    event_queue.append(message)

async def event_stream():
    last_index = 0

    while True:
        await asyncio.sleep(1)

        while last_index < len(event_queue):
            message = event_queue[last_index]
            last_index += 1

            yield f"data: {message}\n\n"

@app.get("/events")
async def stream():
    return StreamingResponse(event_stream(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)