from fastapi import FastAPI

app = FastAPI(title="users-service")

@app.get("/")
def root():
    return {"service": "users", "status": "ok", "data": [{"id": 1, "name": "Ada"}, {"id": 2, "name": "Linus"}]}

@app.get("/healthz")
def health():
    return {"status": "healthy"}
