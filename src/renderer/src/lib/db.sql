-- CREATE TABLE departments (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL,
--   code TEXT UNIQUE NOT NULL,
--   faculty_id INTEGER,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- departments table
CREATE TABLE departments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- add trigger to auto-update updated_at
CREATE TRIGGER update_departments_updated_at
AFTER UPDATE ON departments
BEGIN
  UPDATE departments
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- students table
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matric_no TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  level INTEGER NOT NULL,
  department_id INTEGER NOT NULL,
  is_suspended BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- trigger to auto-update updated_at
CREATE TRIGGER update_students_updated_at
AFTER UPDATE ON students
BEGIN
  UPDATE students
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

-- courses table
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  unit INTEGER NOT NULL CHECK(unit > 0),
  department_id INTEGER NOT NULL,
  lecturer_id INTEGER, -- optional, assign later
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- trigger to update timestamp
CREATE TRIGGER update_courses_updated_at
AFTER UPDATE ON courses
BEGIN
  UPDATE courses
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;


-- results table
CREATE TABLE results (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES students(id),
  course_id INT REFERENCES courses(id),
  score INT CHECK (score >= 0 AND score <= 100),
  grade VARCHAR(2),
  created_by INT REFERENCES users(id),
  updated_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- audit logs
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(255),
  table_name VARCHAR(50),
  record_id INT,
  timestamp TIMESTAMP DEFAULT NOW()
);
