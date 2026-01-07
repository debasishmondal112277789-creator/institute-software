
import { Student, Teacher, Batch, Payment, Attendance, User, UserRole } from '../types';

const DB_KEY = 'EDUNEXUS_ERP_DB';

interface DBStructure {
  students: Student[];
  teachers: Teacher[];
  batches: Batch[];
  payments: Payment[];
  attendance: Attendance[];
  users: User[];
  meta: {
    lastReceiptNo: number;
    lastStudentId: number;
  };
}

const initialDB: DBStructure = {
  students: [],
  teachers: [
    { id: 'T1', name: 'John Doe', email: 'john@edu.com', mobile: '9876543210', subjects: ['Maths', 'Physics'] }
  ],
  batches: [
    { id: 'B1', name: 'Morning Batch A', course: 'IIT Foundation', teacherId: 'T1', timing: '08:00 AM - 10:00 AM' }
  ],
  payments: [],
  attendance: [],
  users: [
    { id: 'U1', username: 'admin', role: UserRole.ADMIN, name: 'Main Admin' },
    { id: 'U2', username: 'teacher', role: UserRole.TEACHER, name: 'Prof. John' }
  ],
  meta: {
    lastReceiptNo: 1000,
    lastStudentId: 100
  }
};

export const getDB = (): DBStructure => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : initialDB;
};

export const saveDB = (db: DBStructure) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const generateReceiptNo = (): string => {
  const db = getDB();
  db.meta.lastReceiptNo += 1;
  saveDB(db);
  return `REC-${db.meta.lastReceiptNo}`;
};

export const generateStudentId = (): string => {
  const db = getDB();
  db.meta.lastStudentId += 1;
  saveDB(db);
  return `STU-${db.meta.lastStudentId}`;
};

export const backupDB = () => {
  const dataStr = localStorage.getItem(DB_KEY);
  const blob = new Blob([dataStr || ''], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};
