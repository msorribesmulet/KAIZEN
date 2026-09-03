from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.log import Log
from app.schemas.log import LogCreate

router = APIRouter()


@router.post("/logs")
def create_log(log: LogCreate, session: Session = Depends(get_session)):
    new_log = Log(
        food_id=log.food_id,
        grams=log.grams,
        date=log.date,
    )
    session.add(new_log)
    session.commit()
    session.refresh(new_log)
    return new_log


@router.get("/logs")
def get_logs(date: date_type | None = None, session: Session = Depends(get_session)):
    query = select(Log)
    if date is not None:
        query = query.where(Log.date == date)
    return session.exec(query).all()


@router.delete("/logs/{log_id}")
def delete_log(log_id: int, session: Session = Depends(get_session)):
    log = session.get(Log, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    session.delete(log)
    session.commit()
    return {"ok": True}


@router.put("/logs/{log_id}")
def update_log(log_id: int, log: LogCreate, session: Session = Depends(get_session)):
    db_log = session.get(Log, log_id)
    if not db_log:
        raise HTTPException(status_code=404, detail="Log not found")
    db_log.food_id = log.food_id
    db_log.grams = log.grams
    db_log.date = log.date
    session.add(db_log)
    session.commit()
    session.refresh(db_log)
    return db_log
