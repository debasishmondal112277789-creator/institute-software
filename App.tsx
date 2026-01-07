
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Student, Teacher, Batch, Payment, Attendance, PaymentMode } from './types';
import { getDB, saveDB, generateStudentId, generateReceiptNo, backupDB } from './services/db';
import { formatCurrency } from './utils/formatters';
import Receipt from './components/Receipt';
import AdmissionModal from './components/AdmissionModal';
import TeacherModal from './components/TeacherModal';
import BatchModal from './components/BatchModal';

// --- Sub-Components ---

const SidebarItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 transition-all ${active ? 'bg-[#2d5a8e] text-white shadow-lg z-10' : 'text-blue-100 hover:bg-[#1e3c5f]'}`}
  >
    <i className={`fas ${icon} w-6`}></i>
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: string }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
    <div className={`${color} w-14 h-14 rounded-full flex items-center justify-center text-white text-xl shadow-inner`}>
      <i className={`fas ${icon}`}></i>
    </div>
  </div>
);

const SearchBar = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => (
  <div className="relative flex-1 max-w-md">
    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
    <input 
      type="text" 
      placeholder={placeholder} 
      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2d5a8e] shadow-sm outline-none transition-all"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [db, setDb] = useState(getDB());
  
  // Search States
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [batchSearch, setBatchSearch] = useState('');

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [printingPayment, setPrintingPayment] = useState<{payment: Payment, student: Student} | null>(null);
  
  // Modals States
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  // Persistence
  useEffect(() => {
    saveDB(db);
  }, [db]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setTimeout(() => {
      const foundUser = db.users.find(u => u.username === loginForm.username);
      if (foundUser && (loginForm.password === 'admin123' || loginForm.password === 'teacher123')) {
        setUser(foundUser);
      } else {
        alert('Invalid credentials. Hint: admin / admin123 or teacher / teacher123');
      }
      setIsLoginLoading(false);
    }, 800);
  };

  const logout = () => {
    setUser(null);
    setLoginForm({ username: '', password: '' });
  };

  // Student Methods
  const handleAdmissionSubmit = (formData: any) => {
    if (editingStudent) {
      setDb(prev => ({
        ...prev,
        students: prev.students.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s)
      }));
      setEditingStudent(null);
    } else {
      const newStudent: Student = {
        ...formData,
        id: generateStudentId(),
        status: 'Active',
        admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0]
      };
      setDb(prev => ({ ...prev, students: [...prev.students, newStudent] }));
    }
    setIsAdmissionModalOpen(false);
  };

  const openEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsAdmissionModalOpen(true);
  };

  const openNewAdmission = () => {
    setEditingStudent(null);
    setIsAdmissionModalOpen(true);
  };

  // Teacher Methods
  const handleTeacherSubmit = (formData: any) => {
    if (editingTeacher) {
      setDb(prev => ({
        ...prev,
        teachers: prev.teachers.map(t => t.id === editingTeacher.id ? { ...t, ...formData } : t)
      }));
      setEditingTeacher(null);
    } else {
      const newTeacher: Teacher = {
        ...formData,
        id: `TCH-${Math.floor(Math.random() * 900) + 100}`,
      };
      setDb(prev => ({ ...prev, teachers: [...prev.teachers, newTeacher] }));
    }
    setIsTeacherModalOpen(false);
  };

  const openEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setIsTeacherModalOpen(true);
  };

  const openNewTeacher = () => {
    setEditingTeacher(null);
    setIsTeacherModalOpen(true);
  };

  // Batch Methods
  const handleBatchSubmit = (formData: any) => {
    if (editingBatch) {
      setDb(prev => ({
        ...prev,
        batches: prev.batches.map(b => b.id === editingBatch.id ? { ...b, ...formData } : b)
      }));
      setEditingBatch(null);
    } else {
      const newBatch: Batch = {
        ...formData,
        id: `BCH-${Math.floor(Math.random() * 900) + 100}`,
      };
      setDb(prev => ({ ...prev, batches: [...prev.batches, newBatch] }));
    }
    setIsBatchModalOpen(false);
  };

  const openEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    setIsBatchModalOpen(true);
  };

  const openNewBatch = () => {
    setEditingBatch(null);
    setIsBatchModalOpen(true);
  };

  const addPayment = (formData: any) => {
    const newPayment: Payment = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      receiptNo: generateReceiptNo(),
      date: new Date().toISOString().split('T')[0]
    };
    setDb(prev => ({ ...prev, payments: [...prev.payments, newPayment] }));
    const student = db.students.find(s => s.id === formData.studentId);
    if (student) setPrintingPayment({ payment: newPayment, student });
  };

  const markAttendance = (date: string, batchId: string, records: { studentId: string, status: 'Present' | 'Absent' }[]) => {
    const newAttendance: Attendance[] = records.map(r => ({
      id: Math.random().toString(36).substr(2, 9),
      date,
      batchId,
      studentId: r.studentId,
      status: r.status
    }));
    setDb(prev => ({ ...prev, attendance: [...prev.attendance, ...newAttendance] }));
    alert('Attendance saved successfully!');
  };

  // Filtered Data
  const stats = useMemo(() => {
    const totalStudents = db.students.length;
    const activeStudents = db.students.filter(s => s.status === 'Active').length;
    const totalFeesCollected = db.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalBatches = db.batches.length;
    return { totalStudents, activeStudents, totalFeesCollected, totalBatches };
  }, [db]);

  const filteredStudents = useMemo(() => db.students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.id.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.mobile.includes(studentSearch)
  ), [db.students, studentSearch]);

  const filteredTeachers = useMemo(() => db.teachers.filter(t => 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
    t.subjects.some(sub => sub.toLowerCase().includes(teacherSearch.toLowerCase())) ||
    t.id.toLowerCase().includes(teacherSearch.toLowerCase())
  ), [db.teachers, teacherSearch]);

  const filteredBatches = useMemo(() => db.batches.filter(b => {
    const teacherName = db.teachers.find(t => t.id === b.teacherId)?.name || '';
    return b.name.toLowerCase().includes(batchSearch.toLowerCase()) ||
      b.course.toLowerCase().includes(batchSearch.toLowerCase()) ||
      teacherName.toLowerCase().includes(batchSearch.toLowerCase());
  }), [db.batches, db.teachers, batchSearch]);

  if (printingPayment) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 no-print">
            <button 
              onClick={() => setPrintingPayment(null)}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all shadow-sm"
            >
              <i className="fas fa-arrow-left mr-2"></i> Dashboard
            </button>
            <button 
              onClick={() => window.print()}
              className="px-6 py-2 bg-[#2d5a8e] text-white rounded-lg hover:bg-[#1e3c5f] transition-all shadow-lg font-bold"
            >
              <i className="fas fa-print mr-2"></i> Print Official Receipt
            </button>
          </div>
          <Receipt payment={printingPayment.payment} student={printingPayment.student} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a365d] via-[#2d5a8e] to-[#4299e1] p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="bg-[#2d5a8e] p-8 text-center text-white relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-green-400 to-blue-400"></div>
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
               <i className="fas fa-user-graduate text-4xl text-[#2d5a8e]"></i>
            </div>
            <h1 className="text-3xl font-black tracking-tighter">SKILLOPEDIA</h1>
            <p className="text-blue-100 mt-1 uppercase text-[10px] font-black tracking-widest">Personality Development Institute</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Access Key (Username)</label>
              <div className="relative">
                <i className="fas fa-id-card absolute left-4 top-4 text-gray-400"></i>
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="admin"
                  required
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Security Password</label>
              <div className="relative">
                <i className="fas fa-key absolute left-4 top-4 text-gray-400"></i>
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>
            </div>
            <button 
              disabled={isLoginLoading}
              type="submit"
              className="w-full py-4 bg-[#2d5a8e] text-white rounded-xl font-bold hover:bg-[#1e3c5f] active:transform active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isLoginLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-shield-alt"></i>}
              {isLoginLoading ? 'Authorizing...' : 'Enter System'}
            </button>
            <div className="text-center space-y-1">
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                 Contact: +91 8509642898
               </p>
               <p className="text-[9px] text-gray-300">
                 Authorized Access Only &copy; 2024 Skillopedia Institute
               </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <AdmissionModal 
        isOpen={isAdmissionModalOpen} 
        onClose={() => { setIsAdmissionModalOpen(false); setEditingStudent(null); }} 
        onSubmit={handleAdmissionSubmit} 
        batches={db.batches}
        initialData={editingStudent}
      />
      
      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => { setIsTeacherModalOpen(false); setEditingTeacher(null); }}
        onSubmit={handleTeacherSubmit}
        initialData={editingTeacher}
      />

      <BatchModal
        isOpen={isBatchModalOpen}
        onClose={() => { setIsBatchModalOpen(false); setEditingBatch(null); }}
        onSubmit={handleBatchSubmit}
        teachers={db.teachers}
        initialData={editingBatch}
      />

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#1a365d] flex-shrink-0 shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-blue-900/50">
          <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center text-[#2d5a8e] shadow-lg">
            <i className="fas fa-user-graduate text-xl"></i>
          </div>
          <div>
            <h2 className="text-white font-black tracking-tighter leading-none">SKILLOPEDIA</h2>
            <span className="text-blue-300 text-[9px] uppercase font-black tracking-[0.2em]">INSTITUTE ERP</span>
          </div>
        </div>
        
        <nav className="mt-4 flex flex-col h-[calc(100vh-100px)] overflow-y-auto">
          <SidebarItem icon="fa-chart-pie" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon="fa-user-graduate" label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
          {user.role === UserRole.ADMIN && <SidebarItem icon="fa-chalkboard-teacher" label="Teachers" active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} />}
          <SidebarItem icon="fa-layer-group" label="Batches" active={activeTab === 'batches'} onClick={() => setActiveTab('batches')} />
          <SidebarItem icon="fa-calendar-check" label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} />
          <SidebarItem icon="fa-file-invoice-dollar" label="Fees & Payments" active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} />
          <SidebarItem icon="fa-file-alt" label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          
          <div className="mt-auto border-t border-blue-900/50 pt-4 mb-4">
            <SidebarItem icon="fa-database" label="System Backup" active={false} onClick={() => { if(confirm('Secure local backup will be downloaded. Proceed?')) backupDB(); }} />
            <SidebarItem icon="fa-power-off" label="Exit System" active={false} onClick={logout} />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 capitalize tracking-tight">{activeTab} Overview</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
               <span className="font-medium">Welcome, {user.name}</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span className="bg-[#2d5a8e]/10 text-[#2d5a8e] px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">{user.role} ACCESS</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 ml-2 border-l pl-6 border-gray-200">
               <div className="text-right">
                  <p className="text-xs font-black text-[#2d5a8e] uppercase">+91 8509642898</p>
                  <p className="text-[10px] text-gray-400 font-medium">skillopedia.institute@gmail.com</p>
               </div>
               <div className="w-11 h-11 rounded-full bg-[#2d5a8e] flex items-center justify-center text-white font-bold border-4 border-white shadow-md">
                 {user.name.charAt(0)}
               </div>
            </div>
          </div>
        </header>

        {/* Screens */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card title="Total Students" value={stats.totalStudents} icon="fa-users" color="bg-[#2d5a8e]" />
              <Card title="Active Batches" value={stats.totalBatches} icon="fa-book" color="bg-[#9dc84a]" />
              <Card title="Total Revenue" value={formatCurrency(stats.totalFeesCollected)} icon="fa-coins" color="bg-[#f9a01b]" />
              <Card title="Expert Faculty" value={db.teachers.length} icon="fa-user-tie" color="bg-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <i className="fas fa-user-clock text-blue-500"></i> Latest Admissions
                  </h4>
                  <button onClick={() => setActiveTab('students')} className="text-[#2d5a8e] text-xs font-black uppercase tracking-wider hover:underline">Manage All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-left bg-gray-50/50">
                      <tr>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrollment ID</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Module</th>
                        <th className="py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Admission Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {db.students.slice(-5).reverse().map(s => (
                        <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-4 px-4 font-mono text-sm font-bold text-[#2d5a8e]">{s.id}</td>
                          <td className="py-4 px-4 font-bold text-gray-700">{s.name}</td>
                          <td className="py-4 px-4 text-gray-500 text-sm font-medium">{s.course}</td>
                          <td className="py-4 px-4 text-gray-400 text-xs">{s.admissionDate}</td>
                        </tr>
                      ))}
                      {db.students.length === 0 && (
                        <tr><td colSpan={4} className="py-12 text-center text-gray-300 italic font-medium">No student records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <i className="fas fa-hand-holding-usd text-green-500"></i> Recent Revenue
                </h4>
                <div className="space-y-4">
                  {db.payments.slice(-5).reverse().map(p => {
                    const student = db.students.find(s => s.id === p.studentId);
                    return (
                      <div key={p.id} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl hover:bg-white hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-blue-100" onClick={() => student && setPrintingPayment({payment: p, student})}>
                        <div className="w-10 h-10 bg-green-100 text-green-600 flex items-center justify-center rounded-lg shadow-sm">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold truncate text-gray-800">{student?.name || 'Deleted Record'}</p>
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">{p.receiptNo} • {p.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#2d5a8e]">{formatCurrency(p.amount)}</p>
                        </div>
                      </div>
                    );
                  })}
                   {db.payments.length === 0 && (
                    <div className="text-center py-12 text-gray-300 italic font-medium">No payments received yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <SearchBar 
                value={studentSearch} 
                onChange={setStudentSearch} 
                placeholder="Search Student by Name, ID, or Phone..." 
              />
              <button 
                onClick={openNewAdmission}
                className="bg-[#2d5a8e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1e3c5f] shadow-lg shadow-blue-100 flex items-center gap-3 transition-all"
              >
                <i className="fas fa-user-plus"></i> New Enrollment Form
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b">
                  <tr>
                    <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Student ID</th>
                    <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Personal Info</th>
                    <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Module</th>
                    <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Admission Date</th>
                    <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="p-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 font-mono text-sm font-black text-[#2d5a8e]">{s.id}</td>
                      <td className="p-5">
                        <div className="font-bold text-gray-800 tracking-tight">{s.name}</div>
                        <div className="text-xs font-bold text-gray-400"><i className="fas fa-phone-alt mr-1 text-[10px]"></i> {s.mobile}</div>
                      </td>
                      <td className="p-5">
                        <span className="font-bold text-gray-600 text-sm">{s.course}</span>
                      </td>
                      <td className="p-5 text-gray-500 text-sm font-medium">{s.admissionDate}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => openEditStudent(s)}
                            className="w-9 h-9 flex items-center justify-center text-[#2d5a8e] bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                            title="Edit Student Profile"
                          >
                            <i className="fas fa-user-edit"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan={6} className="p-16 text-center text-gray-400 font-medium italic">No students match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <SearchBar 
                value={teacherSearch} 
                onChange={setTeacherSearch} 
                placeholder="Search Teacher by Name or Subject..." 
              />
              <button 
                onClick={openNewTeacher}
                className="bg-[#2d5a8e] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#1e3c5f] shadow-lg flex items-center gap-2 transition-all"
              >
                <i className="fas fa-plus"></i> Recruit New Faculty
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group hover:shadow-xl transition-all duration-300">
                   <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={() => openEditTeacher(t)} className="w-9 h-9 bg-blue-50 text-[#2d5a8e] rounded-xl flex items-center justify-center hover:bg-blue-100">
                       <i className="fas fa-edit"></i>
                     </button>
                   </div>
                   <div className="flex items-center gap-4 mb-5 border-b pb-4 border-gray-50">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2d5a8e] to-[#4299e1] flex items-center justify-center text-white font-black text-2xl shadow-lg">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg tracking-tight">{t.name}</h4>
                        <p className="text-[10px] text-[#2d5a8e] font-black uppercase tracking-widest">Faculty ID: {t.id}</p>
                      </div>
                   </div>
                   <div className="space-y-3 mb-5">
                     <p className="text-sm text-gray-600 flex items-center gap-3"><i className="fas fa-envelope text-gray-300"></i> {t.email}</p>
                     <p className="text-sm text-gray-600 flex items-center gap-3"><i className="fas fa-phone-alt text-gray-300"></i> {t.mobile}</p>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {t.subjects.map(s => (
                       <span key={s} className="px-3 py-1 bg-blue-50 text-[#2d5a8e] text-[10px] font-black rounded-lg uppercase tracking-wider border border-blue-100">{s}</span>
                     ))}
                   </div>
                </div>
              ))}
              {filteredTeachers.length === 0 && (
                <div className="col-span-full py-16 text-center text-gray-400 font-medium italic">No teachers match your search.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'batches' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <SearchBar 
                value={batchSearch} 
                onChange={setBatchSearch} 
                placeholder="Search Batch by Name, Course or Teacher..." 
              />
              <button 
                onClick={openNewBatch}
                className="bg-[#2d5a8e] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#1e3c5f] shadow-lg flex items-center gap-2 transition-all"
              >
                <i className="fas fa-layer-group"></i> Create Learning Group
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Batch Name</th>
                    <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Course Module</th>
                    <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Faculty Mentor</th>
                    <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Schedule (Timing)</th>
                    <th className="p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Count</th>
                    <th className="p-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBatches.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50/50">
                      <td className="p-5 font-black text-gray-800">{b.name}</td>
                      <td className="p-5 text-gray-600 font-medium">{b.course}</td>
                      <td className="p-5 font-bold text-[#2d5a8e]">{db.teachers.find(t => t.id === b.teacherId)?.name || 'Unassigned'}</td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-[#9dc84a] font-black text-sm">
                          <i className="fas fa-clock"></i>
                          {b.timing}
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className="bg-blue-50 text-[#2d5a8e] font-black px-3 py-1 rounded-lg text-sm">{db.students.filter(s => s.batchId === b.id).length}</span>
                      </td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => openEditBatch(b)} 
                          className="text-[#2d5a8e] hover:bg-blue-50 p-2.5 rounded-xl transition-all flex items-center gap-2 ml-auto"
                          title="Reschedule / Edit Batch"
                        >
                          <i className="fas fa-calendar-alt"></i>
                          <span className="text-xs font-black uppercase">Reschedule</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredBatches.length === 0 && (
                    <tr><td colSpan={6} className="p-16 text-center text-gray-400 font-medium italic">No batches match your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- Fees, Attendance, Reports tabs stay as refined in last turn --- */}
        {activeTab === 'fees' && (
          <div className="animate-in fade-in duration-500">
             <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-[#f9a01b]"></div>
               <h4 className="font-black text-gray-800 mb-8 uppercase tracking-[0.2em] text-xs">Authorize New Fee Payment</h4>
               <form className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end" onSubmit={(e) => {
                 e.preventDefault();
                 const fd = new FormData(e.currentTarget);
                 const data = {
                   studentId: fd.get('studentId'),
                   amount: Number(fd.get('amount')),
                   mode: fd.get('mode') as PaymentMode,
                   periodFrom: fd.get('periodFrom'),
                   periodTo: fd.get('periodTo'),
                   remarks: fd.get('remarks')
                 };
                 addPayment(data);
                 (e.target as HTMLFormElement).reset();
               }}>
                 <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Select Enrolled Student</label>
                   <select name="studentId" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d5a8e] font-bold text-gray-700">
                     <option value="">Choose Student...</option>
                     {db.students.filter(s => s.status === 'Active').map(s => (
                       <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Amount to Pay (INR)</label>
                   <input name="amount" type="number" required placeholder="0.00" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d5a8e] font-black" />
                 </div>
                 <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Transaction Mode</label>
                   <select name="mode" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d5a8e] font-bold">
                     {Object.values(PaymentMode).map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                 </div>
                 <button type="submit" className="bg-[#2d5a8e] text-white py-4 rounded-xl font-bold hover:bg-[#1e3c5f] shadow-lg flex items-center justify-center gap-3 transition-all">
                   <i className="fas fa-file-invoice-dollar text-xl"></i> Authorize & Print
                 </button>
               </form>
             </div>

             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50/80 border-b">
                    <tr>
                      <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt Serial</th>
                      <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Information</th>
                      <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                      <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Authorized Amount</th>
                      <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Channel</th>
                      <th className="p-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Management</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {db.payments.slice().reverse().map(p => {
                      const st = db.students.find(s => s.id === p.studentId);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-5 font-black text-gray-700 tracking-tighter">{p.receiptNo}</td>
                          <td className="p-5 font-bold text-gray-800">{st?.name || 'Archived Student'}</td>
                          <td className="p-5 text-gray-500 font-medium text-sm">{p.date}</td>
                          <td className="p-5 font-black text-[#2d5a8e] text-lg">{formatCurrency(p.amount)}</td>
                          <td className="p-5">
                            <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 uppercase tracking-wider text-gray-600">{p.mode}</span>
                          </td>
                          <td className="p-5 text-right">
                            <button 
                              onClick={() => st && setPrintingPayment({payment: p, student: st})}
                              className="text-[#2d5a8e] bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 font-bold text-xs transition-all shadow-sm"
                            >
                              <i className="fas fa-print mr-2"></i> Reprint
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'attendance' && (
           <div className="animate-in fade-in duration-500">
             <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-[#9dc84a]"></div>
               <h4 className="font-black text-gray-800 mb-8 uppercase tracking-[0.2em] text-xs">Verify Daily Class Attendance</h4>
               <div className="flex flex-col md:flex-row gap-8 mb-8">
                 <div className="flex-1">
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Active Batch</label>
                   <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d5a8e] font-bold" id="batchSelect">
                     {db.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </select>
                 </div>
                 <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Current Session Date</label>
                    <input type="date" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2d5a8e] font-bold" defaultValue={new Date().toISOString().split('T')[0]} id="attDate" />
                 </div>
               </div>
               
               <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8 shadow-sm">
                 <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Information</th>
                        <th className="p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Mark Present</th>
                        <th className="p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Mark Absent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50" id="attTable">
                      {db.students.filter(s => s.status === 'Active').map(s => (
                        <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                          <td className="p-4 text-sm font-bold text-gray-700 tracking-tight">{s.name}</td>
                          <td className="p-4 text-center">
                            <input type="radio" name={`att-${s.id}`} value="Present" defaultChecked className="w-5 h-5 accent-green-600" />
                          </td>
                          <td className="p-4 text-center">
                            <input type="radio" name={`att-${s.id}`} value="Absent" className="w-5 h-5 accent-red-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
               
               <button 
                onClick={() => {
                  const batchId = (document.getElementById('batchSelect') as HTMLSelectElement).value;
                  const date = (document.getElementById('attDate') as HTMLInputElement).value;
                  const records: any[] = [];
                  db.students.filter(s => s.status === 'Active').forEach(s => {
                    const radios = document.getElementsByName(`att-${s.id}`) as NodeListOf<HTMLInputElement>;
                    let status = 'Present';
                    radios.forEach(r => { if(r.checked) status = r.value; });
                    records.push({ studentId: s.id, status });
                  });
                  markAttendance(date, batchId, records);
                }}
                className="w-full bg-[#9dc84a] text-white py-4 rounded-xl font-bold hover:opacity-90 shadow-lg shadow-green-100 flex items-center justify-center gap-3 transition-all"
               >
                 <i className="fas fa-check-double text-xl"></i> Commit Attendance Log
               </button>
             </div>
           </div>
        )}

        {activeTab === 'reports' && (
          <div className="animate-in fade-in duration-500 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center group hover:shadow-2xl transition-all duration-500">
                 <div className="w-16 h-16 bg-blue-50 text-[#2d5a8e] rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner group-hover:scale-110 transition-transform">
                   <i className="fas fa-file-csv"></i>
                 </div>
                 <h5 className="font-bold text-gray-800 mb-2 text-lg">Student Directory</h5>
                 <p className="text-xs text-gray-500 mb-6 font-medium">Export master student database for external analysis.</p>
                 <button 
                    onClick={() => {
                      const csv = "ID,Name,Mobile,Course,Status\n" + db.students.map(s => `${s.id},${s.name},${s.mobile},${s.course},${s.status}`).join("\n");
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = 'skillopedia_students.csv'; a.click();
                    }}
                    className="w-full py-3 bg-[#2d5a8e] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#1e3c5f] transition-all shadow-lg shadow-blue-50"
                 >
                   Download Secure CSV
                 </button>
               </div>

               <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center group hover:shadow-2xl transition-all duration-500">
                 <div className="w-16 h-16 bg-green-50 text-[#9dc84a] rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner group-hover:scale-110 transition-transform">
                   <i className="fas fa-coins"></i>
                 </div>
                 <h5 className="font-bold text-gray-800 mb-2 text-lg">Revenue Ledger</h5>
                 <p className="text-xs text-gray-500 mb-6 font-medium">Official financial audit of all verified transactions.</p>
                 <button 
                    onClick={() => {
                      const csv = "ReceiptNo,Student,Date,Amount,Mode\n" + db.payments.map(p => `${p.receiptNo},${db.students.find(s => s.id === p.studentId)?.name},${p.date},${p.amount},${p.mode}`).join("\n");
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = 'skillopedia_revenue.csv'; a.click();
                    }}
                    className="w-full py-3 bg-[#9dc84a] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg shadow-green-50"
                 >
                   Download Audit Data
                 </button>
               </div>

               <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center group hover:shadow-2xl transition-all duration-500">
                 <div className="w-16 h-16 bg-orange-50 text-[#f9a01b] rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner group-hover:scale-110 transition-transform">
                   <i className="fas fa-calendar-check"></i>
                 </div>
                 <h5 className="font-bold text-gray-800 mb-2 text-lg">Attendance Records</h5>
                 <p className="text-xs text-gray-500 mb-6 font-medium">Comprehensive student attendance historical log.</p>
                 <button 
                    onClick={() => {
                      const csv = "Date,Batch,StudentID,Status\n" + db.attendance.map(a => `${a.date},${a.batchId},${a.studentId},${a.status}`).join("\n");
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = 'skillopedia_attendance.csv'; a.click();
                    }}
                    className="w-full py-3 bg-[#f9a01b] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:opacity-90 transition-all shadow-lg shadow-orange-50"
                 >
                   Download Log History
                 </button>
               </div>
             </div>
          </div>
        )}
      </main>
      
      {/* Floating Status Bar */}
      <footer className="fixed bottom-0 right-0 p-3 text-[9px] text-gray-400 no-print flex items-center gap-3 pointer-events-none backdrop-blur-md bg-white/50 rounded-tl-xl border-l border-t border-gray-200 shadow-xl">
        <span className="flex items-center gap-2 font-bold tracking-widest">
           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> 
           SKILLOPEDIA LOCAL SERVER ACTIVE
        </span>
        <span className="text-gray-300">|</span>
        <span className="font-black uppercase tracking-tighter">v1.0.4 PRODUCTION BUILD</span>
      </footer>
    </div>
  );
}
