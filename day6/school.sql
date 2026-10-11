-- School database: students, courses and enrolments (SQLite)
-- Run the whole script in an SQLite playground such as sqliteonline.com.
-- The script can be run again and again: it drops the old tables first.
-- Some playgrounds only show the result of the LAST SELECT in a run, so to
-- see each query's result, run the queries in Part 4 one at a time.

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- ---------------------------------------------------------------------------
-- Part 1: Tables
-- ---------------------------------------------------------------------------

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY AUTOINCREMENT,
    code      TEXT NOT NULL UNIQUE,
    title     TEXT NOT NULL,
    credits   INTEGER NOT NULL CHECK (credits > 0)
);

-- Join table: one row = one student enrolled on one course (with a grade).
-- UNIQUE (student_id, course_id) stops the same student enrolling on the
-- same course twice. A NULL grade means "not graded yet".
CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id   INTEGER NOT NULL,
    course_id    INTEGER NOT NULL,
    enrolled_on  TEXT NOT NULL DEFAULT CURRENT_DATE,
    grade        INTEGER CHECK (grade BETWEEN 0 AND 100),
    FOREIGN KEY (student_id) REFERENCES students (student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id)  REFERENCES courses (course_id)   ON DELETE CASCADE,
    UNIQUE (student_id, course_id)
);

-- Index: speeds up "all students on a course" and "students per course".
-- (The UNIQUE rule above already indexes lookups that start with student_id.)
CREATE INDEX idx_enrolments_course_id ON enrolments (course_id);

-- ---------------------------------------------------------------------------
-- Part 2: Sample data
-- ---------------------------------------------------------------------------

INSERT INTO students (name, email) VALUES
    ('Amina Hassan',  'amina.hassan@example.com'),
    ('Brian Otieno',  'brian.otieno@example.com'),
    ('Grace Wanjiku', 'grace.wanjiku@example.com'),
    ('David Kimani',  'david.kimani@example.com'),
    ('Fatuma Ali',    'fatuma.ali@example.com');

INSERT INTO courses (code, title, credits) VALUES
    ('WEB101', 'Web Foundations',        4),
    ('JS201',  'JavaScript Essentials',  3),
    ('DB101',  'Databases',              3),
    ('UX110',  'User Experience Design', 2);

INSERT INTO enrolments (student_id, course_id, enrolled_on, grade) VALUES
    (1, 1, '2026-09-01', 88),
    (1, 2, '2026-09-01', 92),
    (2, 1, '2026-09-02', 75),
    (2, 3, '2026-09-02', NULL),
    (3, 1, '2026-09-03', 81),
    (3, 2, '2026-09-03', 69),
    (3, 3, '2026-09-03', 90),
    (4, 3, '2026-09-04', NULL);

-- ---------------------------------------------------------------------------
-- Part 3: Quick check that the data loaded
-- ---------------------------------------------------------------------------

SELECT
    (SELECT COUNT(*) FROM students)   AS students,
    (SELECT COUNT(*) FROM courses)    AS courses,
    (SELECT COUNT(*) FROM enrolments) AS enrolments;
-- Expected: 5 | 4 | 8

-- ---------------------------------------------------------------------------
-- Part 4: Queries
-- ---------------------------------------------------------------------------

-- Query 1: all courses for one student (by name)
SELECT c.code, c.title, e.grade
FROM students AS s
JOIN enrolments AS e ON e.student_id = s.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE s.name = 'Amina Hassan'
ORDER BY c.code;
-- Expected: JS201 JavaScript Essentials 92, WEB101 Web Foundations 88

-- Query 2: all students on one course
SELECT s.name, s.email, e.grade
FROM courses AS c
JOIN enrolments AS e ON e.course_id = c.course_id
JOIN students AS s ON s.student_id = e.student_id
WHERE c.title = 'Web Foundations'
ORDER BY s.name;
-- Expected: Amina Hassan 88, Brian Otieno 75, Grace Wanjiku 81

-- Query 3: the number of students per course
-- (LEFT JOIN keeps courses with no students, which show a count of 0)
SELECT c.code, c.title, COUNT(e.enrolment_id) AS student_count
FROM courses AS c
LEFT JOIN enrolments AS e ON e.course_id = c.course_id
GROUP BY c.course_id, c.code, c.title
ORDER BY student_count DESC, c.code;
-- Expected: DB101 3, WEB101 3, JS201 2, UX110 0

-- Query 4: students who have no enrolments
SELECT s.student_id, s.name, s.email
FROM students AS s
LEFT JOIN enrolments AS e ON e.student_id = s.student_id
WHERE e.enrolment_id IS NULL;
-- Expected: Fatuma Ali

-- Query 5: update one enrolment's grade
-- (Brian Otieno's grade for Databases was not set yet)
UPDATE enrolments
SET grade = 85
WHERE student_id = (SELECT student_id FROM students WHERE name = 'Brian Otieno')
  AND course_id  = (SELECT course_id FROM courses WHERE code = 'DB101');

-- Check the update worked
SELECT s.name, c.title, e.grade
FROM enrolments AS e
JOIN students AS s ON s.student_id = e.student_id
JOIN courses AS c ON c.course_id = e.course_id
WHERE s.name = 'Brian Otieno';
-- Expected: Brian Otieno Web Foundations 75, Brian Otieno Databases 85
