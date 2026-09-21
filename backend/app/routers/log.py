from datetime import date as date_type

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.dependencies import get_current_user
from app.models.food import Food
from app.models.log import Log
from app.models.user import User
from app.schemas.log import LogCreate, LogRead
from app.services.catalog import visible_food

router = APIRouter()


def _own_log(log_id: int, user: User, session: Session) -> Log:
    log = session.get(Log, log_id)
    if not log or log.user_id != user.id:
        raise HTTPException(status_code=404, detail="Log not found")

    return log


@router.post("/logs", response_model=Log)
def create_log(
    log: LogCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    visible_food(log.food_id, user, session)
    new_log = Log(**log.model_dump(), user_id=user.id)
    session.add(new_log)
    session.commit()
    session.refresh(new_log)

    return new_log


@router.get("/logs", response_model=list[LogRead])
def get_logs(
    date: date_type | None = None,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    query = (
        select(Log, Food)
        .join(Food, Log.food_id == Food.id, isouter=True)
        .where(Log.user_id == user.id)
    )
    if date is not None:
        query = query.where(Log.date == date)

    return [
        LogRead(
            id=log.id,
            food_id=log.food_id,
            grams=log.grams,
            date=log.date,
            food=food,
        )
        for log, food in session.exec(query).all()
    ]


@router.delete("/logs/{log_id}")
def delete_log(
    log_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    log = _own_log(log_id, user, session)
    session.delete(log)
    session.commit()

    return {"ok": True}


@router.put("/logs/{log_id}", response_model=Log)
def update_log(
    log_id: int,
    log: LogCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    db_log = _own_log(log_id, user, session)
    visible_food(
        log.food_id,
        user,
        session,
        allow_deleted=log.food_id == db_log.food_id,
    )
    db_log.food_id = log.food_id
    db_log.grams = log.grams
    db_log.date = log.date
    session.add(db_log)
    session.commit()
    session.refresh(db_log)

    return db_log
