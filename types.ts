
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER'
}

export enum PaymentMode {
  CASH = 'CASH',
  UPI = 'UPI/ONLINE',
  CHEQUE = 'CHEQUE'
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
  role: UserRole;
  name: string;
}
