# SQLite local setup

This version uses SQLite by default, so you do not need to install PostgreSQL locally.

## Backend setup

```bash
cd backend
pip install -r requirements.txt
copy .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

On PowerShell, if `copy` does not work, use:

```powershell
Copy-Item .env.example .env
```

After `alembic upgrade head`, a file named `issue_analyzer.db` will be created in the backend folder.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

## Switch to PostgreSQL later

No code changes are needed. Change only `DATABASE_URL` in `backend/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
```

Then run migrations again:

```bash
alembic upgrade head
```
