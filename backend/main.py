import logging
import os

import uvicorn
from fastapi import FastAPI

from app.api import config, health, runs

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

app = FastAPI(title="Basenbox Tagesablauf")
for module in (health, runs, config):
    app.include_router(module.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", "3000")))
