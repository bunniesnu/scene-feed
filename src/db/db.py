from typing import Annotated
from fastapi import Depends
from sqlmodel import create_engine, Session
from os import getenv
from src.db import tables

DATABASE_URL = f"postgresql://{getenv("POSTGRES_USER")}:{getenv("POSTGRES_PASSWORD")}@db:5432/{getenv("POSTGRES_DB")}"

engine = create_engine(DATABASE_URL)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]