-- Step w Sue — Optional Seed Data
-- Run AFTER schema.sql if you want test data to make the leaderboard look populated.
-- DELETE these participants from /admin before going live!
-- All test accounts use PIN: 1234

-- PIN 1234 bcrypt hash (cost 10)
-- You can generate your own at: bcrypt-generator.com
DO $$
DECLARE
  p1 UUID := gen_random_uuid();
  p2 UUID := gen_random_uuid();
  p3 UUID := gen_random_uuid();
  p4 UUID := gen_random_uuid();
  test_hash TEXT := '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
BEGIN
  -- Insert test participants
  INSERT INTO participants (id, first_name, last_name, nickname, pin_hash)
  VALUES
    (p1, 'Sue',   'Test', 'The Original', test_hash),
    (p2, 'Dave',  'Test', 'The Challenger', test_hash),
    (p3, 'Karen', 'Test', 'Quiet Threat', test_hash),
    (p4, 'Mike',  'Test', null, test_hash);

  -- Week 1 submissions
  INSERT INTO weekly_submissions (participant_id, week_number, total_steps, submitted_at)
  VALUES
    (p1, 1, 52000, '2026-05-25 08:00:00+00'),
    (p2, 1, 48500, '2026-05-25 10:30:00+00'),
    (p3, 1, 71200, '2026-05-25 09:15:00+00'),
    (p4, 1, 39000, '2026-05-26 22:45:00+00');

  -- Week 2 submissions
  INSERT INTO weekly_submissions (participant_id, week_number, total_steps, submitted_at)
  VALUES
    (p1, 2, 61000, '2026-06-01 07:30:00+00'),
    (p2, 2, 55000, '2026-06-01 11:00:00+00'),
    (p3, 2, 44000, '2026-06-01 09:00:00+00'),
    (p4, 2, 67500, '2026-06-02 23:00:00+00');
END $$;
