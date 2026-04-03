-- User Feedback Table
-- Stores 5-star ratings + optional notes from students

CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES platform_students(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One feedback per student
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_feedback_student ON user_feedback(student_id);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_created ON user_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_user_feedback_rating ON user_feedback(rating);
