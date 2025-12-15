from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Use Environment Variable or fallback to Docker service name (for local dev)
# In production, this will be overridden by env vars
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://lingo_user:lingo_password@localhost:5432/lingodrift")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
