# School Database Design

This database stores students, the courses they can take, and which students are enrolled on which courses (with a grade). The SQL is in `school.sql`.

## The tables

### `students`

One row per student.

- `student_id` is the primary key.
- `name` is required (`NOT NULL`).
- `email` is required and `UNIQUE`, so two students cannot share an email address.

### `courses`

One row per course.

- `course_id` is the primary key.
- `code` (for example `WEB101`) is required and `UNIQUE`.
- `title` and `credits` are required, and `credits` must be greater than 0.

### `enrolments`

One row for each time a student is enrolled on a course. It links the other two tables and holds the grade.

- `enrolment_id` is the primary key.
- `student_id` is a foreign key to `students`, and `course_id` is a foreign key to `courses`. Both are required.
- `enrolled_on` is the date of enrolment (it defaults to today).
- `grade` is a number from 0 to 100. It can be empty (`NULL`) while the student has not been graded yet.
- `UNIQUE (student_id, course_id)` stops the same student enrolling on the same course twice.

## Relationships

- **One student has many enrolments (one-to-many).** A student can be enrolled on several courses, but each enrolment row belongs to exactly one student.
- **One course has many enrolments (one-to-many).** A course can have many students, but each enrolment row belongs to exactly one course.
- **Students and courses are many-to-many.** A student can take many courses, and a course can have many students.

### Why a join table is needed

A many-to-many relationship cannot be stored directly in either table. Putting a list of courses inside one student column, or a list of students inside one course column, would break the rule that each cell holds one value, and it would make searching, counting and updating messy. Instead, the `enrolments` table sits in the middle and turns the many-to-many relationship into two one-to-many relationships. It is also the natural home for the grade, because a grade does not belong to a student alone or a course alone. It belongs to one student on one course.

## Index I would add

```sql
CREATE INDEX idx_enrolments_course_id ON enrolments (course_id);
```

- **Reason:** the queries "all students on one course" and "number of students per course" look up enrolments by `course_id`. Without an index, the database has to read every row in `enrolments` each time. With the index it can jump straight to the matching rows, which matters as the number of enrolments grows.
- The `UNIQUE (student_id, course_id)` rule already creates an index that helps searches starting with `student_id`, so this extra index covers searches that start with `course_id`.

## SQL or NoSQL?

I would choose a SQL database (such as SQLite, PostgreSQL or MySQL) for this system. The data is structured and has clear relationships: students, courses and enrolments always have the same fields, and the many-to-many link between students and courses is exactly what relational tables and joins are built for. SQL also lets the database enforce the rules for us, such as unique emails, no duplicate enrolments, and no enrolment for a student or course that does not exist, so bad data is rejected before it is saved. Questions like "how many students are on each course?" or "which students have no enrolments?" are simple with `JOIN` and `GROUP BY`. A NoSQL database would suit data that is flexible, changes shape often or has to scale across many servers, such as social media posts or activity logs. A school's records are stable and need to be accurate, so the strict structure and consistency of SQL is the better fit.
