-- Migration: Restructure Schema for Routine Tracker
-- Date: 2026-01-10
-- Description:
--   - Rename habits table to routine_tasks with new fields
--   - Add time tracking to daily_logs
--   - Create interviews table
--   - Create user_goals table

-- =============================================================================
-- STEP 1: Drop existing tables (if you want a fresh start)
-- =============================================================================
-- WARNING: This will delete all existing data!
-- Comment out these lines if you want to keep existing data

-- DROP TABLE IF EXISTS daily_logs CASCADE;
-- DROP TABLE IF EXISTS habits CASCADE;

-- =============================================================================
-- STEP 2: Rename habits to routine_tasks (if keeping existing data)
-- =============================================================================
-- If you commented out the DROP statements above, uncomment this:
-- ALTER TABLE habits RENAME TO routine_tasks;

-- =============================================================================
-- STEP 3: Create/Update routine_tasks table
-- =============================================================================
DROP TABLE IF EXISTS daily_logs CASCADE;
DROP TABLE IF EXISTS routine_tasks CASCADE;

CREATE TABLE routine_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Learning', 'Fitness', 'Rest', 'Other')),
  planned_minutes INTEGER DEFAULT 0,
  active_days TEXT[] DEFAULT '{}',  -- e.g., ARRAY['Monday', 'Tuesday', 'Friday']
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_routine_tasks_user_id ON routine_tasks(user_id);

-- =============================================================================
-- STEP 4: Create/Update daily_logs table
-- =============================================================================
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  routine_task_id UUID REFERENCES routine_tasks(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('done', 'missed', 'partial', 'skipped', 'pending')) DEFAULT 'pending',
  actual_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, routine_task_id, date)  -- Prevent duplicate logs for same task/day
);

-- Add indexes for faster queries
CREATE INDEX idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(date);
CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, date);

-- =============================================================================
-- STEP 5: Create interviews table
-- =============================================================================
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL,
  date_applied DATE,
  status TEXT CHECK (status IN ('applied', 'replied', 'interview_scheduled', 'interview_done', 'offer', 'rejected')) DEFAULT 'applied',
  interview_rounds TEXT,  -- e.g., 'Round 2/3'
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add index
CREATE INDEX idx_interviews_user_id ON interviews(user_id);

-- =============================================================================
-- STEP 6: Create user_goals table
-- =============================================================================
CREATE TABLE user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_type TEXT CHECK (goal_type IN ('weekly', 'monthly')) DEFAULT 'weekly',
  target_percentage INTEGER DEFAULT 80 CHECK (target_percentage >= 0 AND target_percentage <= 100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, goal_type)  -- One goal per type per user
);

-- Add index
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);

-- =============================================================================
-- STEP 7: Create trigger for updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_routine_tasks_updated_at
BEFORE UPDATE ON routine_tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at
BEFORE UPDATE ON interviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STEP 8: Insert default user goals for existing users
-- =============================================================================
INSERT INTO user_goals (user_id, goal_type, target_percentage)
SELECT id, 'weekly', 80 FROM users
ON CONFLICT (user_id, goal_type) DO NOTHING;

INSERT INTO user_goals (user_id, goal_type, target_percentage)
SELECT id, 'monthly', 80 FROM users
ON CONFLICT (user_id, goal_type) DO NOTHING;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- Run this SQL in your Supabase SQL Editor
