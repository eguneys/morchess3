INSERT OR IGNORE INTO users (id, handle, created_at) VALUES ('seed1', 'seedhandle', datetime('now'));

INSERT OR IGNORE INTO daily_scores (
    user_id,
    difficulty,
    score
) VALUES ('seed1', 'a', 80);

INSERT OR IGNORE INTO daily_scores (
    user_id,
    difficulty,
    score,
    date_utc
) VALUES ('seed1', 'a', 70, date('now', '-7 days'));


INSERT OR IGNORE INTO daily_scores (
    user_id,
    difficulty,
    score,
    date_utc
) VALUES ('seed1', 'a', 61, date('now', '-6 days'));