from fastapi import FastAPI

app = FastAPI(title="inventory-service")

@app.get("/")
def root():
    return {"service": "inventory", "status": "ok", "data": [{"sku": "X-1", "qty": 42}, {"sku": "Y-2", "qty": 7}]}

@app.get("/healthz")
def health():
    return {"status": "healthy"}
