# E-Learning Grade A

E-Learning Grade A is a study resource platform for students in Grades 9-12.
All learning materials in this project come from the Telegram channel `https://t.me/bacii26w`.

Students can browse and download:

- `កំណេរលំហាត់`
- `រូបមន្ត`
- `វិញ្ញាសា`
- `ឯកសារ`
- `E-book`
- audio lessons

The project includes:

- `user-frontend`: student website built with React + Vite
- `admin-frontend`: admin dashboard for managing learning resources
- `backend`: FastAPI API with SQLAlchemy, Alembic, and PostgreSQL/SQLite support

Architecture:

- User frontend: `localhost:5173`
- Admin frontend: `localhost:5174`
- Backend API: `127.0.0.1:8000`
- Database: Neon PostgreSQL in production, `e-learning.db` SQLite for local fallback
- File storage: Cloudinary for uploaded files, images, audio, and event video
- Admin auth: HTTP-only cookie session backed by FastAPI JWT and role checks

Core idea:

- Organize resources by grade level `9-12`
- Organize resources by subject
- Let students download study files easily
- Let students listen to audio for self-study and revision

Backend setup:

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `DATABASE_URL` to your Neon PostgreSQL URL, or keep `sqlite:///./e-learning.db` for local development.
3. Set `SECRET_KEY` to a long random value.
4. Set `ADMIN_BOOTSTRAP_ACCOUNTS` once to bootstrap one or more admin accounts, or use `ADMIN_EMAIL` and `ADMIN_PASSWORD` for a single admin.
5. Run migrations from the project root with `npm run db:migrate`.
6. Start the API with `npm run dev:backend`.

Security and secrets:

1. Real credentials live only in git-ignored files or platform env vars: `backend/.env` locally, Render environment variables in production. The `.env.example` files contain placeholders only.
2. The API refuses to start when `DATABASE_URL` is PostgreSQL and `SECRET_KEY` is missing or a placeholder. Generate one with `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
3. Never put secrets in frontend variables: any `VITE_*` value is compiled into the public JavaScript bundle. Only `VITE_API_BASE_URL` belongs there.
4. `render.yaml` sets `ENABLE_API_DOCS=false` so production hides `/docs`, `/redoc`, and `/openapi.json`.
5. Before pushing, double-check nothing secret is staged: `git status` (no `.env`) and `git grep -nEi "(api_secret|password|token)\s*=" -- ':!*.lock'`. Rotate any credential that was ever committed, shared in chat, or emailed.

Render deployment:

1. Push this repository to GitHub.
2. In Render, create a new Blueprint from this repository.
3. Render will read `render.yaml` and create:
   - `e-learning-grade-a-api`
   - `e-learning-grade-a`
   - `e-learning-grade-a-admin`
4. Fill the secret values Render asks for:
   - `DATABASE_URL`
   - `ADMIN_BOOTSTRAP_ACCOUNTS`
   - `TELEGRAM_BOT_TOKEN`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. After the first deploy, open `/health` on the API service and confirm it returns `{"status":"healthy"}`.

Cloudinary setup:

1. Set `STORAGE_BACKEND=cloudinary`.
2. Add your Cloudinary credentials with either `CLOUDINARY_URL` or `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

Default admin accounts are created from `ADMIN_BOOTSTRAP_ACCOUNTS` (or `ADMIN_EMAIL` + `ADMIN_PASSWORD`) at first startup. Keep these values only in environment variables — never in the repository.

npm run dev:backend
npm run dev
npm run dev
