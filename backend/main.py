import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
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
    files,
    phone_verification,
    bank_accounts,
    withdrawals,
    activities,
    messages,
    favorites,
    job_notifications,
    qr,
    penalties,
    workers,
)

app = FastAPI(title="WORK NOW API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CFG["CORS_ORIGINS"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


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
app.include_router(files.router, prefix="/files", tags=["Files"])
app.include_router(phone_verification.router, prefix="/phone", tags=["Phone Verification"])
app.include_router(bank_accounts.router)
app.include_router(withdrawals.router)
app.include_router(activities.router)
app.include_router(messages.router)
app.include_router(favorites.router, prefix="/favorites", tags=["Favorites"])
app.include_router(job_notifications.router, prefix="/job-notifications", tags=["Job Notifications"])
app.include_router(qr.router)
app.include_router(penalties.router)
app.include_router(workers.router, prefix="/workers", tags=["Workers"])


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(CFG["PORT"]), reload=True)
