from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.favorite_repo import FavoriteRepo
from app.schemas.favorite_schema import FavoriteCreate, FavoriteItem

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.get("", response_model=list[FavoriteItem])
def list_favorites(db: Session = Depends(get_db)):
    favorites = db.query(FavoriteRepo).order_by(FavoriteRepo.created_at.desc()).all()
    return [FavoriteItem.model_validate(f) for f in favorites]


@router.post("", response_model=FavoriteItem)
def add_favorite(payload: FavoriteCreate, db: Session = Depends(get_db)):
    favorite = FavoriteRepo(repo_owner=payload.repo_owner, repo_name=payload.repo_name)
    db.add(favorite)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="This repo is already in your favorites.")
    db.refresh(favorite)
    return FavoriteItem.model_validate(favorite)


@router.delete("/{owner}/{name}")
def remove_favorite(owner: str, name: str, db: Session = Depends(get_db)):
    favorite = (
        db.query(FavoriteRepo)
        .filter(FavoriteRepo.repo_owner == owner, FavoriteRepo.repo_name == name)
        .first()
    )
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found.")
    db.delete(favorite)
    db.commit()
    return {"status": "removed"}
