-- Add a lock flag to daily scores
ALTER TABLE daily_scores ADD COLUMN locked INTEGER DEFAULT 0;

-- Lock all scores strictly before today (UTC)
UPDATE daily_scores
SET locked = 1
WHERE date_utc < date('now');
