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
4. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` once to bootstrap the first admin account.
5. Run migrations from the project root with `npm run db:migrate`.
6. Start the API with `npm run dev:backend`.

Cloudinary setup:

1. Set `STORAGE_BACKEND=cloudinary`.
2. Add your Cloudinary credentials with either `CLOUDINARY_URL` or `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
