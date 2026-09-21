from fastapi import FastAPI
from routers import analyze, meta, teams

app = FastAPI()

app.include_router(analyze.router)
app.include_router(meta.router)
app.include_router(teams.router)