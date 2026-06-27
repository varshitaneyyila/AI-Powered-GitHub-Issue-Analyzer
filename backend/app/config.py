from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    github_token: str = ""
    groq_api_key: str = ""
    # SQLite is the local default. To switch later, change only DATABASE_URL in .env
    # Example PostgreSQL: postgresql://postgres:postgres@localhost:5432/issue_analyzer
    database_url: str = "sqlite:///./issue_analyzer.db"
    frontend_origin: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
