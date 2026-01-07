
import { Student, Teacher, Batch, Payment, Attendance, User, UserRole, Institute, UserPermissions } from '../types';

const DB_KEY = 'EDUNEXUS_ERP_DB';

export const defaultAdminPermissions: UserPermissions = {
  dashboard: true,
  students: true,
  teachers: true,
  batches: true,
  attendance: true,
  fees: true,
  reports: true,
  settings: true
};

export const initialTeacherPermissions: UserPermissions = {
  dashboard: true,
  students: true,
  teachers: false,
  batches: true,
  attendance: true,
  fees: false,
  reports: false,
  settings: false
};

export const initialStudentPermissions: UserPermissions = {
  dashboard: true,
  students: false,
  teachers: false,
  batches: false,
  attendance: false,
  fees: true,
  reports: false,
  settings: false
};

interface DBStructure {
  students: Student[];
  teachers: Teacher[];
  batches: Batch[];
  payments: Payment[];
  attendance: Attendance[];
  users: User[];
  institute: Institute;
  roleDefaults: {
    [UserRole.TEACHER]: UserPermissions;
    [UserRole.STUDENT]: UserPermissions;
  };
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
    { 
      id: 'U1', 
      username: 'admin', 
      password: 'admin123', 
      role: UserRole.ADMIN, 
      name: 'Main Admin',
      permissions: defaultAdminPermissions
    },
    { 
      id: 'U2', 
      username: 'teacher', 
      password: 'teacher123', 
      role: UserRole.TEACHER, 
      name: 'Prof. John',
      permissions: initialTeacherPermissions
    }
  ],
  institute: {
    name: 'SKILLOPEDIA',
    tagline: 'Personality Development Institute',
    address: 'Premium Campus, Skillopedia Heights, City Center',
    phone: '+91 8509642898',
    email: 'skillopedia.institute@gmail.com',
    logoUrl: 'https://i.ibb.co/VYv0HhMh/skillopedia-logo.png'
  },
  roleDefaults: {
    [UserRole.TEACHER]: initialTeacherPermissions,
    [UserRole.STUDENT]: initialStudentPermissions
  },
  meta: {
    lastReceiptNo: 1000,
    lastStudentId: 100
  }
};

export const getDB = (): DBStructure => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) return initialDB;
  const parsed = JSON.parse(data);
  if (!parsed.institute) parsed.institute = initialDB.institute;
  if (!parsed.users) parsed.users = initialDB.users;
  if (!parsed.roleDefaults) {
    parsed.roleDefaults = initialDB.roleDefaults;
  }
  // Ensure all users have permissions structure
  parsed.users = parsed.users.map((u: any) => ({
    ...u,
    permissions: u.permissions || (u.role === UserRole.ADMIN ? defaultAdminPermissions : initialTeacherPermissions)
  }));
  return parsed;
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
