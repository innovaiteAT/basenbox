import os

import uvicorn
from fastapi import FastAPI

app = FastAPI()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/hello")
def hello():
    return {"message": "Hallo vom Backend!"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print(f"Backend läuft auf Port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
