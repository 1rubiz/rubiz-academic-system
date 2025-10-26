// utils/db.ts
import { db } from "../main";

// Departments CRUD
export const DepartmentRepo = {
  add: (name: string, code: string) => {
    const stmt = db.prepare(
      "INSERT INTO departments (name, code) VALUES (?, ?)"
    );
    return stmt.run(name, code);
  },

  update: (id: number, name: string, code: string) => {
    const stmt = db.prepare(
      "UPDATE departments SET name = ?, code = ? WHERE id = ?"
    );
    return stmt.run(name, code, id);
  },

  remove: (id: number) => {
    const stmt = db.prepare("DELETE FROM departments WHERE id = ?");
    return stmt.run(id);
  },

  all: () => {
    const stmt = db.prepare("SELECT * FROM departments ORDER BY name ASC");
    return stmt.all();
  },
};

// utils/db.ts (append after DepartmentRepo)
export const CourseRepo = {
  add: (
    name: string,
    code: string,
    unit: number,
    department_id: number,
    lecturer_id?: number,
    description?: string
  ) => {
    const stmt = db.prepare(
      "INSERT INTO courses (name, code, unit, department_id, lecturer_id) VALUES (?, ?, ?, ?, ?)"
    );
    return stmt.run(name, code, unit, department_id, lecturer_id || null, description);
  },

  update: (
    id: number,
    name: string,
    code: string,
    unit: number,
    department_id: number,
    lecturer_id?: number,
    description?: string
  ) => {
    const stmt = db.prepare(
      `UPDATE courses 
       SET name = ?, code = ?, unit = ?, department_id = ?, lecturer_id = ? 
       WHERE id = ?`
    );
    return stmt.run(name, code, unit, department_id, lecturer_id || null, id, description);
  },

  remove: (id: number) => {
    const stmt = db.prepare("DELETE FROM courses WHERE id = ?");
    return stmt.run(id);
  },

  all: () => {
    const stmt = db.prepare(
      `SELECT c.*, d.name as department_name 
       FROM courses c 
       JOIN departments d ON c.department_id = d.id
       ORDER BY c.code ASC`
    );
    return stmt.all();
  },

  byDepartment: (department_id: number) => {
    const stmt = db.prepare(
      "SELECT * FROM courses WHERE department_id = ? ORDER BY code ASC"
    );
    return stmt.all(department_id);
  },
};

// utils/db.ts (append after CourseRepo)
export const StudentRepo = {
  add: (
    matric_no: string,
    first_name: string,
    last_name: string,
    level: number,
    department_id: number
  ) => {
    const stmt = db.prepare(
      `INSERT INTO students (matric_no, first_name, last_name, level, department_id) 
       VALUES (?, ?, ?, ?, ?)`
    );
    return stmt.run(matric_no, first_name, last_name, level, department_id);
  },

  update: (
    id: number,
    first_name: string,
    last_name: string,
    level: number,
    department_id: number
  ) => {
    const stmt = db.prepare(
      `UPDATE students 
       SET first_name = ?, last_name = ?, level = ?, department_id = ? 
       WHERE id = ?`
    );
    return stmt.run(first_name, last_name, level, department_id, id);
  },

  suspend: (id: number) => {
    const stmt = db.prepare("UPDATE students SET is_suspended = 1 WHERE id = ?");
    return stmt.run(id);
  },

  unsuspend: (id: number) => {
    const stmt = db.prepare("UPDATE students SET is_suspended = 0 WHERE id = ?");
    return stmt.run(id);
  },

  remove: (id: number) => {
    const stmt = db.prepare("DELETE FROM students WHERE id = ?");
    return stmt.run(id);
  },

  all: () => {
    const stmt = db.prepare(
      `SELECT s.*, d.name as department_name 
       FROM students s 
       JOIN departments d ON s.department_id = d.id
       ORDER BY s.matric_no ASC`
    );
    return stmt.all();
  },
};

