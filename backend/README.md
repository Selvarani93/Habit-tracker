# Habit Tracker Backend

FastAPI backend for the Habit Tracker application with Supabase PostgreSQL database.

## Setup Instructions

### 1. Create Environment File

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
- Get `SUPABASE_DB_PASSWORD` from Supabase Dashboard > Project Settings > Database > Password
- Get `SUPABASE_PROJECT_REF` from your Supabase project URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`

### 2. Install Dependencies

Make sure you're in the virtual environment, then install required packages:

```bash
pip install -r requirements.txt
```

### 3. Run the Server

Start the FastAPI development server:

```bash
uvicorn main:app --reload
```

The API will be available at: `http://localhost:8000`

### 4. Access API Documentation

FastAPI automatically generates interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── database.py          # Database connection setup
├── models.py            # SQLAlchemy database models
├── schemas.py           # Pydantic validation schemas
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (not in git)
├── .env.example         # Example environment variables
└── routers/
    ├── users.py         # User endpoints
    ├── habits.py        # Habit endpoints
    └── logs.py          # Daily log endpoints
```

## API Endpoints

### Users
- `POST /users/` - Create a new user
- `GET /users/` - Get all users
- `GET /users/{user_id}` - Get user by ID
- `GET /users/email/{email}` - Get user by email
- `DELETE /users/{user_id}` - Delete a user

### Habits
- `POST /habits/` - Create a new habit
- `GET /habits/` - Get all habits
- `GET /habits/user/{user_id}` - Get habits for a specific user
- `GET /habits/{habit_id}` - Get habit by ID
- `PUT /habits/{habit_id}` - Update a habit
- `DELETE /habits/{habit_id}` - Delete a habit

### Daily Logs
- `POST /logs/` - Create a new daily log
- `GET /logs/` - Get all logs
- `GET /logs/user/{user_id}` - Get logs for a specific user
- `GET /logs/habit/{habit_id}` - Get logs for a specific habit
- `GET /logs/{log_id}` - Get log by ID
- `DELETE /logs/{log_id}` - Delete a log

## Database Tables

Your Supabase database has three tables that match these SQLAlchemy models:

1. **users** - User accounts
2. **habits** - User habits to track
3. **daily_logs** - Daily habit completion logs

The models in `models.py` mirror your existing Supabase tables and won't recreate them.

## Notes

- CORS is currently set to allow all origins (`*`) - update this in `main.py` for production
- The `.env` file is gitignored to keep your credentials secure
- Database tables are created automatically if they don't exist (but won't duplicate your existing Supabase tables)
