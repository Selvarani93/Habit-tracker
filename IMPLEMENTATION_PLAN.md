# Habit Tracker - Complete Implementation Plan

## 🎯 Project Vision
A comprehensive habit and interview tracking system with 4 main modules:
1. Weekly Routine Template (Blueprint)
2. Daily Tracker (Daily Logs)
3. Analytics Dashboard (Progress & Insights)
4. Interview Tracker (Job Applications)

---

## 📊 Current State Analysis

### Backend (FastAPI + Supabase PostgreSQL)
**Current Tables:**
- `users` - User accounts (id, email)
- `habits` - Habit definitions (needs restructuring)
- `daily_logs` - Daily habit logs (needs enhancement)

**What Works:**
- ✅ User authentication with Supabase Auth
- ✅ CRUD operations for habits
- ✅ Daily logging with status (done/missed/partial)
- ✅ API endpoints for users, habits, logs

**What Needs Change:**
- ❌ Rename `habits` → `routine_tasks`
- ❌ Add time tracking (planned_minutes, actual_minutes)
- ❌ Add category field (Learning/Fitness/Rest)
- ❌ Add day-of-week field (which days this task appears)
- ❌ No weekly template system
- ❌ No interview tracking
- ❌ No analytics calculations

### Frontend (React + Vite + Tailwind + shadcn/ui)
**Current Pages:**
- ✅ Home - Landing page
- ✅ Login/Signup - Authentication
- ✅ Dashboard - Basic habit list (needs major overhaul)

**What Needs:**
- ❌ Weekly Template Editor
- ❌ Daily Tracker View (auto-generated from template)
- ❌ Analytics Dashboard with charts
- ❌ Interview Tracker CRUD
- ❌ Navigation between modules

---

## 🗄️ Database Schema Design

### 1. Users Table (Existing - No Changes)
```sql
users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE
)
```

### 2. Routine Tasks Table (Rename from habits)
```sql
routine_tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,  -- 'Learning', 'Fitness', 'Rest', 'Other'
  planned_minutes INTEGER,  -- Expected time to complete
  active_days TEXT[],  -- ['Monday', 'Tuesday', 'Friday']
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 3. Daily Logs Table (Enhanced)
```sql
daily_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  routine_task_id UUID REFERENCES routine_tasks(id),
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('done', 'missed', 'partial', 'skipped')),
  actual_minutes INTEGER,  -- Actual time spent
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### 4. Interview Tracker Table (New)
```sql
interviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  date_applied DATE,
  status TEXT CHECK (status IN ('applied', 'replied', 'interview_scheduled', 'interview_done', 'offer', 'rejected')),
  interview_rounds TEXT,  -- 'Round 2/3'
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 5. User Goals Table (New - For Analytics)
```sql
user_goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  goal_type TEXT,  -- 'weekly', 'monthly'
  target_percentage INTEGER DEFAULT 80,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 🏗️ Implementation Phases

## Phase 1: Database Migration & Backend Updates
**Goal**: Update database schema and backend to support new features

### Tasks:
1. **Create Migration SQL**
   - Rename `habits` → `routine_tasks`
   - Add new columns (category, planned_minutes, active_days, updated_at)
   - Add `actual_minutes` to daily_logs
   - Create `interviews` table
   - Create `user_goals` table

2. **Update Backend Models** (`backend/models.py`)
   - Update Habit → RoutineTask model
   - Update DailyLog model
   - Create Interview model
   - Create UserGoal model

3. **Update Backend Schemas** (`backend/schemas.py`)
   - Update all Pydantic schemas to match new models

4. **Update Backend Routes**
   - `routers/routine_tasks.py` (renamed from habits.py)
   - Update `routers/logs.py` with time tracking
   - Create `routers/interviews.py`
   - Create `routers/analytics.py` (for calculations)

5. **Create Daily Auto-Generation Logic**
   - New endpoint: `POST /logs/generate-today` - Auto-creates today's tasks from template
   - Checks which routine_tasks have today's day in active_days[]
   - Creates daily_log entries with status='pending'

---

## Phase 2: Frontend - Core Pages Restructure

### Tasks:
1. **Update API Service** (`frontend/src/services/api.js`)
   - Update habits → routineTasks endpoints
   - Add interviews endpoints
   - Add analytics endpoints

2. **Create Navigation Layout**
   - New: `components/Layout.jsx` with sidebar/nav
   - 4 main nav items:
     - 📋 Routine Template
     - 📅 Daily Tracker
     - 📊 Analytics
     - 💼 Interviews

3. **Page 1: Routine Template Editor** (`pages/RoutineTemplate.jsx`)
   - Display 7 day cards (Mon-Sun)
   - Each day shows its routine tasks
   - Add task button per day
   - Edit/delete tasks
   - Form fields:
     - Task name
     - Category dropdown
     - Planned time (minutes)
     - Active days (multi-select checkboxes)

4. **Page 2: Daily Tracker** (`pages/DailyTracker.jsx`)
   - Auto-fetch/generate today's tasks on load
   - List of today's tasks with:
     - Task name
     - Category badge
     - Planned time display
     - Status buttons (Done/Partial/Missed/Skipped)
     - Actual time input (minutes)
     - Notes textarea
   - Save button per task
   - Date selector to view past days

5. **Page 3: Analytics Dashboard** (`pages/Analytics.jsx`)
   - Weekly Summary Card:
     - Completion rate (%)
     - Tasks completed vs total
     - Time spent vs planned
   - Monthly Summary Card:
     - Monthly completion rate
     - Category breakdown (pie chart?)
     - Streak display
   - Goals Section:
     - Current target (80%)
     - Progress bars per category
     - "X more tasks needed to reach goal"
   - Charts (using recharts or similar):
     - Weekly completion trend
     - Category distribution

6. **Page 4: Interview Tracker** (`pages/InterviewTracker.jsx`)
   - Table view of all interviews
   - Add interview button → Modal form
   - Columns:
     - Company
     - Role
     - Status (with colored badges)
     - Date Applied
     - Priority
     - Actions (Edit/Delete)
   - Filters: By status, by priority
   - Search: By company name

---

## Phase 3: Advanced Features

### Tasks:
1. **Auto-Generate Daily Logs**
   - Background job or login trigger
   - Runs once per day per user
   - Creates logs for today based on template

2. **Analytics Calculations Backend**
   - New endpoint: `GET /analytics/weekly?user_id=X`
   - New endpoint: `GET /analytics/monthly?user_id=X`
   - Returns:
     - Completion rates
     - Time analysis
     - Streak data
     - Goal progress

3. **Reflections Feature**
   - New table: `reflections` (weekly/monthly notes)
   - Add to analytics page

4. **Export Feature**
   - Export to CSV/PDF
   - Weekly/monthly reports

---

## 🎨 UI/UX Enhancements

### Components to Build:
1. `components/RoutineTaskCard.jsx` - Display task in template
2. `components/DailyTaskCard.jsx` - Display task in daily tracker
3. `components/StatusBadge.jsx` - Colored status indicators
4. `components/CategoryBadge.jsx` - Category pills
5. `components/StatCard.jsx` - Analytics stat display
6. `components/ProgressBar.jsx` - Custom progress bar
7. `components/InterviewModal.jsx` - Add/edit interview form
8. `components/TaskModal.jsx` - Add/edit routine task form

---

## 📅 Timeline Estimation

### Phase 1: Backend (2-3 days)
- Database migration: 4 hours
- Model updates: 2 hours
- Route updates: 4 hours
- Testing: 2 hours

### Phase 2: Frontend Core (4-5 days)
- Navigation setup: 2 hours
- Routine Template page: 6 hours
- Daily Tracker page: 6 hours
- Analytics page: 8 hours
- Interview Tracker page: 6 hours

### Phase 3: Polish (2-3 days)
- Auto-generation logic: 3 hours
- Analytics backend: 4 hours
- Testing & bug fixes: 8 hours
- UI refinements: 3 hours

**Total Estimated Time: 8-11 days of focused development**

---

## 🚀 Deployment Considerations

1. **Environment Variables**
   - Supabase credentials
   - Backend API URL
   - Target completion percentage (configurable)

2. **Database Migrations**
   - Backup existing data
   - Run migration scripts
   - Verify data integrity

3. **Testing Strategy**
   - Test auto-generation logic thoroughly
   - Test analytics calculations
   - Cross-browser testing

---

## 📝 Next Steps

1. **Review & Approve Plan** ✓
2. **Start Phase 1: Database Migration**
3. **Update Backend Models & Routes**
4. **Build Frontend Pages One by One**
5. **Test End-to-End Flow**
6. **Deploy & Use!**

---

## 🔄 Future Enhancements (Post-MVP)

- Mobile app (React Native)
- Push notifications for daily tasks
- Team/shared routines
- AI suggestions for routine optimization
- Integration with calendar apps
- Habit streak gamification
- Social features (share progress)
- Dark mode toggle
- Custom themes

---

**Last Updated**: January 10, 2026
**Status**: Planning Complete - Ready for Implementation
