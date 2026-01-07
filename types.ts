
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export enum PaymentMode {
  CASH = 'CASH',
  UPI = 'UPI/ONLINE',
  CHEQUE = 'CHEQUE'
}

export interface UserPermissions {
  dashboard: boolean;
  students: boolean;
  teachers: boolean;
  batches: boolean;
  attendance: boolean;
  fees: boolean;
  reports: boolean;
  settings: boolean;
}

export interface Institute {
  name: string;
  address: string;
  phone: string;
  email: string;
  tagline: string;
  logoUrl?: string;
}

export interface Student {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  guardianName?: string;
  course: string;
  batchId: string;
  admissionDate: string;
  status: 'Active' | 'Inactive';
  totalFees: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  mobile: string;
  subjects: string[];
}

export interface Batch {
  id: string;
  name: string;
  course: string;
  teacherId: string;
  timing: string;
}

export interface Payment {
  id: string;
  receiptNo: string;
  studentId: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  periodFrom: string;
  periodTo: string;
  remarks?: string;
}

export interface Attendance {
  id: string;
  date: string;
  batchId: string;
  studentId: string;
  status: 'Present' | 'Absent';
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
  permissions: UserPermissions;
  linkedEntityId?: string; // Student ID or Teacher ID
}
