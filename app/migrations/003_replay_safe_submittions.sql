-- Add metadata columns for replay-safe behavior
ALTER TABLE daily_scores ADD COLUMN submission_hash TEXT;
ALTER TABLE daily_scores ADD COLUMN submitted_at INTEGER;

-- Backfill existing rows
UPDATE daily_scores
SET submitted_at = created_at
WHERE submitted_at IS NULL;
