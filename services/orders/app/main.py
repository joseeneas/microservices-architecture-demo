from fastapi import FastAPI

app = FastAPI(title="orders-service")

@app.get("/")
def root():
    return {"service": "orders", "status": "ok", "data": [{"id": "A100", "user_id": 1}, {"id": "B200", "user_id": 2}]}

@app.get("/healthz")
def health():
    return {"status": "healthy"}
