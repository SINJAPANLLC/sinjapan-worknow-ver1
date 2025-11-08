import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from utils.config import CFG
from routers import (
    auth,
    jobs,
    applications,
    assignments,
    payments,
    reviews,
    notifications,
    admin,
)

app = FastAPI(title="WORK NOW API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CFG["CORS_ORIGINS"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "env": CFG["ENVIRONMENT"]}


app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/applications", tags=["Applications"])
app.include_router(assignments.router, prefix="/assignments", tags=["Assignments"])
app.include_router(payments.router, prefix="/payments", tags=["Payments"])
app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(CFG["PORT"]), reload=True)
