
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole, Student, Teacher, Batch, Payment, Attendance, PaymentMode } from './types';
import { getDB, saveDB, generateStudentId, generateReceiptNo, backupDB } from './services/db';
import { formatCurrency } from './utils/formatters';
import Receipt from './components/Receipt';

// --- Sub-Components ---

const SidebarItem = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 transition-all ${active ? 'bg-blue-700 text-white shadow-lg z-10' : 'text-blue-100 hover:bg-blue-800'}`}
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

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [db, setDb] = useState(getDB());
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [printingPayment, setPrintingPayment] = useState<{payment: Payment, student: Student} | null>(null);

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
  const addStudent = (formData: any) => {
    const newStudent: Student = {
      ...formData,
      id: generateStudentId(),
      status: 'Active',
      admissionDate: new Date().toISOString().split('T')[0]
    };
    setDb(prev => ({ ...prev, students: [...prev.students, newStudent] }));
  };

  // Teacher Methods
  const addTeacher = (formData: any) => {
    const newTeacher: Teacher = {
      ...formData,
      id: `TCH-${Math.floor(Math.random() * 900) + 100}`,
    };
    setDb(prev => ({ ...prev, teachers: [...prev.teachers, newTeacher] }));
  };

  // Batch Methods
  const addBatch = (formData: any) => {
    const newBatch: Batch = {
      ...formData,
      id: `BCH-${Math.floor(Math.random() * 900) + 100}`,
    };
    setDb(prev => ({ ...prev, batches: [...prev.batches, newBatch] }));
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

  // Calculations
  const stats = useMemo(() => {
    const totalStudents = db.students.length;
    const activeStudents = db.students.filter(s => s.status === 'Active').length;
    const totalFeesCollected = db.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalBatches = db.batches.length;
    return { totalStudents, activeStudents, totalFeesCollected, totalBatches };
  }, [db]);

  const filteredStudents = db.students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mobile.includes(searchQuery)
  );

  if (printingPayment) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 no-print">
            <button 
              onClick={() => setPrintingPayment(null)}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              <i className="fas fa-arrow-left mr-2"></i> Back to ERP
            </button>
            <button 
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <i className="fas fa-print mr-2"></i> Print / Save as PDF
            </button>
          </div>
          <Receipt payment={printingPayment.payment} student={printingPayment.student} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="bg-blue-600 p-8 text-center text-white">
            <i className="fas fa-university text-5xl mb-4"></i>
            <h1 className="text-3xl font-black">EduNexus ERP</h1>
            <p className="text-blue-100 mt-2">Professional Institute Management</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-4 text-gray-400"></i>
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
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-4 text-gray-400"></i>
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
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:transform active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isLoginLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sign-in-alt"></i>}
              {isLoginLoading ? 'Logging in...' : 'Access Dashboard'}
            </button>
            <p className="text-xs text-center text-gray-400 mt-4">
              v1.0.4 Commercial Release &copy; 2024 EduNexus Tech
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-blue-900 flex-shrink-0 shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-blue-800">
          <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center text-blue-900 shadow-lg">
            <i className="fas fa-bolt text-xl"></i>
          </div>
          <div>
            <h2 className="text-white font-bold leading-none">EduNexus</h2>
            <span className="text-blue-300 text-[10px] uppercase font-black tracking-widest">ERP PRO</span>
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
          
          <div className="mt-auto border-t border-blue-800 pt-4 mb-4">
            <SidebarItem icon="fa-database" label="Backup Database" active={false} onClick={() => { if(confirm('Download local backup?')) backupDB(); }} />
            <SidebarItem icon="fa-sign-out-alt" label="Logout" active={false} onClick={logout} />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h1>
            <p className="text-gray-500 text-sm">Welcome back, {user.name} ({user.role})</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Quick search student..." 
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 w-64 bg-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 ml-2 border-l pl-6 border-gray-200">
               <div className="text-right">
                  <p className="text-xs font-bold text-gray-800">{user.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase">{user.role}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-blue-200 shadow-sm">
                 {user.name.charAt(0)}
               </div>
            </div>
          </div>
        </header>

        {/* Screens */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card title="Total Students" value={stats.totalStudents} icon="fa-users" color="bg-blue-600" />
              <Card title="Active Batches" value={stats.totalBatches} icon="fa-book" color="bg-emerald-600" />
              <Card title="Fees Collected" value={formatCurrency(stats.totalFeesCollected)} icon="fa-hand-holding-usd" color="bg-amber-600" />
              <Card title="Teachers" value={db.teachers.length} icon="fa-chalkboard-teacher" color="bg-purple-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <i className="fas fa-history text-blue-500"></i> Recent Admissions
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="text-left bg-gray-50">
                      <tr>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">ID</th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Student</th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Course</th>
                        <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {db.students.slice(-5).reverse().map(s => (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-mono text-sm text-blue-600">{s.id}</td>
                          <td className="py-3 px-4 font-medium">{s.name}</td>
                          <td className="py-3 px-4 text-gray-600">{s.course}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {s.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {db.students.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-gray-400 italic">No students admitted yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <i className="fas fa-receipt text-blue-500"></i> Recent Payments
                </h4>
                <div className="space-y-4">
                  {db.payments.slice(-4).reverse().map(p => {
                    const student = db.students.find(s => s.id === p.studentId);
                    return (
                      <div key={p.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => student && setPrintingPayment({payment: p, student})}>
                        <div className="w-10 h-10 bg-green-100 text-green-600 flex items-center justify-center rounded-lg shadow-sm">
                          <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold truncate">{student?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{p.receiptNo} • {p.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-800">{formatCurrency(p.amount)}</p>
                        </div>
                      </div>
                    );
                  })}
                   {db.payments.length === 0 && (
                    <div className="text-center py-8 text-gray-400 italic">No payments recorded.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="flex-1 max-w-md relative">
                 <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                 <input 
                    type="text" 
                    placeholder="Search by name, ID or mobile..." 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
              <button 
                onClick={() => {
                  const name = prompt('Student Name:');
                  const mobile = prompt('Mobile Number:');
                  const course = prompt('Course Name:');
                  const totalFees = Number(prompt('Total Fees Amount:', '10000'));
                  if(name && mobile && course) {
                    addStudent({ name, mobile, course, totalFees, batchId: db.batches[0]?.id || '' });
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 shadow-md flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> New Admission
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Admission Date</th>
                    <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm font-bold text-blue-600">{s.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.mobile}</div>
                      </td>
                      <td className="p-4 text-gray-600 font-medium">{s.course}</td>
                      <td className="p-4 text-gray-500">{s.admissionDate}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><i className="fas fa-edit"></i></button>
                          <button 
                            onClick={() => {
                              setDb(prev => ({
                                ...prev,
                                students: prev.students.map(st => st.id === s.id ? { ...st, status: st.status === 'Active' ? 'Inactive' : 'Active' } : st)
                              }));
                            }}
                            className={`p-2 rounded-lg ${s.status === 'Active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          >
                            <i className={s.status === 'Active' ? 'fas fa-user-slash' : 'fas fa-user-check'}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan={6} className="p-12 text-center text-gray-400 italic">No matching students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Faculty Management</h3>
              <button 
                onClick={() => {
                  const name = prompt('Teacher Name:');
                  const email = prompt('Email:');
                  const subjects = prompt('Subjects (comma separated):')?.split(',') || [];
                  if(name) addTeacher({ name, email, mobile: '0000000000', subjects });
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Add Teacher
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {db.teachers.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl uppercase">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{t.name}</h4>
                        <p className="text-xs text-gray-500 font-mono">{t.id}</p>
                      </div>
                   </div>
                   <div className="space-y-2 mb-4">
                     <p className="text-sm text-gray-600 flex items-center gap-2"><i className="fas fa-envelope text-gray-400"></i> {t.email}</p>
                     <p className="text-sm text-gray-600 flex items-center gap-2"><i className="fas fa-phone text-gray-400"></i> {t.mobile}</p>
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {t.subjects.map(s => (
                       <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">{s}</span>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'batches' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Active Batches</h3>
              <button 
                onClick={() => {
                  const name = prompt('Batch Name:');
                  const course = prompt('Course:');
                  const teacherId = prompt('Teacher ID (e.g., T1):');
                  const timing = prompt('Timing (e.g., 10 AM - 12 PM):');
                  if(name && course) addBatch({ name, course, teacherId, timing });
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <i className="fas fa-plus"></i> Create Batch
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Batch Name</th>
                    <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Course</th>
                    <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Teacher</th>
                    <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Timing</th>
                    <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase">Students</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {db.batches.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">{b.name}</td>
                      <td className="p-4 text-gray-600">{b.course}</td>
                      <td className="p-4 text-blue-600 font-medium">{db.teachers.find(t => t.id === b.teacherId)?.name || 'Unassigned'}</td>
                      <td className="p-4 text-gray-500">{b.timing}</td>
                      <td className="p-4 text-right font-bold text-gray-800">{db.students.filter(s => s.batchId === b.id).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="animate-in fade-in duration-500">
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
               <h4 className="font-black text-gray-800 mb-6 uppercase tracking-wider text-sm">New Fee Payment</h4>
               <form className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end" onSubmit={(e) => {
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
                   <label className="block text-xs font-bold text-gray-500 mb-2">STUDENT</label>
                   <select name="studentId" required className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500">
                     <option value="">Select Student</option>
                     {db.students.filter(s => s.status === 'Active').map(s => (
                       <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                     ))}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-2">AMOUNT (INR)</label>
                   <input name="amount" type="number" required placeholder="0.00" className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-2">PAYMENT MODE</label>
                   <select name="mode" className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500">
                     {Object.values(PaymentMode).map(m => <option key={m} value={m}>{m}</option>)}
                   </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">FROM PERIOD</label>
                    <input name="periodFrom" type="month" required className="w-full p-2.5 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-lg font-bold hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2">
                   <i className="fas fa-receipt"></i> Pay & Print Receipt
                 </button>
               </form>
             </div>

             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Receipt #</th>
                      <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Student</th>
                      <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                      <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                      <th className="p-4 text-left text-xs font-bold text-gray-500 uppercase">Mode</th>
                      <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {db.payments.slice().reverse().map(p => {
                      const st = db.students.find(s => s.id === p.studentId);
                      return (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-4 font-bold text-gray-700">{p.receiptNo}</td>
                          <td className="p-4 font-medium">{st?.name || 'N/A'}</td>
                          <td className="p-4 text-gray-500">{p.date}</td>
                          <td className="p-4 font-black text-blue-700">{formatCurrency(p.amount)}</td>
                          <td className="p-4">
                            <span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{p.mode}</span>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => st && setPrintingPayment({payment: p, student: st})}
                              className="text-blue-600 hover:underline font-bold text-sm"
                            >
                              <i className="fas fa-print mr-1"></i> Reprint
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
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
               <h4 className="font-black text-gray-800 mb-6 uppercase tracking-wider text-sm">Mark Daily Attendance</h4>
               <div className="flex flex-col md:flex-row gap-6 mb-6">
                 <div className="flex-1">
                   <label className="block text-xs font-bold text-gray-500 mb-2">SELECT BATCH</label>
                   <select className="w-full p-2.5 bg-gray-50 border rounded-lg" id="batchSelect">
                     {db.batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                   </select>
                 </div>
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-2">DATE</label>
                    <input type="date" className="w-full p-2.5 bg-gray-50 border rounded-lg" defaultValue={new Date().toISOString().split('T')[0]} id="attDate" />
                 </div>
               </div>
               
               <div className="border rounded-lg overflow-hidden mb-6">
                 <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left text-xs font-bold">Student Name</th>
                        <th className="p-3 text-center text-xs font-bold">Present</th>
                        <th className="p-3 text-center text-xs font-bold">Absent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" id="attTable">
                      {db.students.filter(s => s.status === 'Active').map(s => (
                        <tr key={s.id}>
                          <td className="p-3 text-sm font-medium">{s.name}</td>
                          <td className="p-3 text-center">
                            <input type="radio" name={`att-${s.id}`} value="Present" defaultChecked className="w-4 h-4 text-blue-600" />
                          </td>
                          <td className="p-3 text-center">
                            <input type="radio" name={`att-${s.id}`} value="Absent" className="w-4 h-4 text-red-600" />
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
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 shadow-lg flex items-center justify-center gap-2"
               >
                 <i className="fas fa-check-double"></i> Save Attendance Records
               </button>
             </div>
           </div>
        )}

        {activeTab === 'reports' && (
          <div className="animate-in fade-in duration-500 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                   <i className="fas fa-file-csv"></i>
                 </div>
                 <h5 className="font-bold text-gray-800 mb-2">Student Directory</h5>
                 <p className="text-xs text-gray-500 mb-4">Export all active student profiles and details.</p>
                 <button 
                    onClick={() => {
                      const csv = "ID,Name,Mobile,Course,Status\n" + db.students.map(s => `${s.id},${s.name},${s.mobile},${s.course},${s.status}`).join("\n");
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = 'students.csv'; a.click();
                    }}
                    className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                 >
                   Download CSV
                 </button>
               </div>

               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                 <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                   <i className="fas fa-file-invoice"></i>
                 </div>
                 <h5 className="font-bold text-gray-800 mb-2">Revenue Report</h5>
                 <p className="text-xs text-gray-500 mb-4">Export full payment ledger for accounts.</p>
                 <button 
                    onClick={() => {
                      const csv = "ReceiptNo,Student,Date,Amount,Mode\n" + db.payments.map(p => `${p.receiptNo},${db.students.find(s => s.id === p.studentId)?.name},${p.date},${p.amount},${p.mode}`).join("\n");
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = 'revenue.csv'; a.click();
                    }}
                    className="w-full py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700"
                 >
                   Download CSV
                 </button>
               </div>

               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                 <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                   <i className="fas fa-calendar-alt"></i>
                 </div>
                 <h5 className="font-bold text-gray-800 mb-2">Attendance Summary</h5>
                 <p className="text-xs text-gray-500 mb-4">Monthly present/absent counts per student.</p>
                 <button 
                    onClick={() => {
                      const csv = "Date,Batch,StudentID,Status\n" + db.attendance.map(a => `${a.date},${a.batchId},${a.studentId},${a.status}`).join("\n");
                      const blob = new Blob([csv], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = 'attendance_history.csv'; a.click();
                    }}
                    className="w-full py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700"
                 >
                   Download CSV
                 </button>
               </div>
             </div>
          </div>
        )}
      </main>
      
      {/* Floating Status Bar */}
      <footer className="fixed bottom-0 right-0 p-2 text-[10px] text-gray-400 no-print flex items-center gap-2 pointer-events-none">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> DB LOCAL (v1.0.4)</span>
        <span>•</span>
        <span>LICENSED ERP VERSION</span>
      </footer>
    </div>
  );
}
