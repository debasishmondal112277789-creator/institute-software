
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, UserRole, Student, Teacher, Batch, Payment, Attendance, PaymentMode, Institute, UserPermissions } from './types';
import { getDB, saveDB, generateStudentId, generateReceiptNo, backupDB, defaultAdminPermissions } from './services/db';
import { formatCurrency } from './utils/formatters';
import Receipt from './components/Receipt';
import AdmissionModal from './components/AdmissionModal';
import TeacherModal from './components/TeacherModal';
import BatchModal from './components/BatchModal';

// --- Sub-Components ---

const SidebarItem = ({ icon, label, active, onClick, hidden }: { icon: string, label: string, active: boolean, onClick: () => void, hidden?: boolean }) => {
  if (hidden) return null;
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-4 transition-all ${active ? 'bg-[#2d5a8e] text-white shadow-lg z-10' : 'text-blue-100 hover:bg-[#1e3c5f]'}`}
    >
      <i className={`fas ${icon} w-6`}></i>
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
};

const Card = ({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: string }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between transition-transform hover:scale-[1.02]">
    <div>
      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-gray-800 mt-1">{value}</h3>
    </div>
    <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg`}>
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
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'users' | 'templates'>('profile');
  const [db, setDb] = useState(getDB());
  
  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [batchSearch, setBatchSearch] = useState('');

  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [printingPayment, setPrintingPayment] = useState<{payment: Payment, student: Student} | null>(null);
  
  // Modals & Editing
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [viewingBatchId, setViewingBatchId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const userFormRef = useRef<HTMLFormElement>(null);

  // Persistence
  useEffect(() => {
    saveDB(db);
  }, [db]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
    setTimeout(() => {
      const foundUser = db.users.find(u => u.username === loginForm.username && u.password === loginForm.password);
      if (foundUser) {
        setUser(foundUser);
        if (!foundUser.permissions.dashboard) {
          const firstAllowed = (Object.keys(foundUser.permissions) as (keyof UserPermissions)[])
            .find(k => foundUser.permissions[k]);
          if (firstAllowed) setActiveTab(firstAllowed);
        }
      } else {
        alert('Access Denied: Invalid Security Credentials.');
      }
      setIsLoginLoading(false);
    }, 800);
  };

  const logout = () => {
    setUser(null);
    setLoginForm({ username: '', password: '' });
    setActiveTab('dashboard');
  };

  // --- CRUD Operations ---
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size too large. Please upload an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDb(prev => ({
          ...prev,
          institute: { ...prev.institute, logoUrl: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInstituteUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedInstitute: Institute = {
      ...db.institute,
      name: formData.get('name') as string,
      tagline: formData.get('tagline') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
    };
    setDb(prev => ({ ...prev, institute: updatedInstitute }));
    alert('Branding & Profile Updated Successfully!');
  };

  // Student methods
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
        status: formData.status || 'Active',
        admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0]
      };
      setDb(prev => ({ ...prev, students: [...prev.students, newStudent] }));
    }
    setIsAdmissionModalOpen(false);
  };

  // Teacher methods
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

  // Batch methods
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

  // User/RBAC methods
  const handleRoleDefaultUpdate = (role: UserRole, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPerms: UserPermissions = {
      dashboard: formData.get('perm-dashboard') === 'on',
      students: formData.get('perm-students') === 'on',
      teachers: formData.get('perm-teachers') === 'on',
      batches: formData.get('perm-batches') === 'on',
      attendance: formData.get('perm-attendance') === 'on',
      fees: formData.get('perm-fees') === 'on',
      reports: formData.get('perm-reports') === 'on',
      settings: formData.get('perm-settings') === 'on',
    };
    setDb(prev => ({
      ...prev,
      roleDefaults: { ...prev.roleDefaults, [role]: newPerms }
    }));
    alert(`Global Template for ${role} updated!`);
  };

  const handleUserSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as UserRole;
    
    const newUser: User = {
      id: editingUser?.id || Math.random().toString(36).substr(2, 9),
      username: formData.get('username') as string,
      password: (formData.get('password') as string) || editingUser?.password || '123456',
      name: formData.get('name') as string,
      role: role,
      permissions: {
        dashboard: formData.get('perm-dashboard') === 'on',
        students: formData.get('perm-students') === 'on',
        teachers: formData.get('perm-teachers') === 'on',
        batches: formData.get('perm-batches') === 'on',
        attendance: formData.get('perm-attendance') === 'on',
        fees: formData.get('perm-fees') === 'on',
        reports: formData.get('perm-reports') === 'on',
        settings: formData.get('perm-settings') === 'on',
      }
    };

    if (editingUser) {
      setDb(prev => ({ ...prev, users: prev.users.map(u => u.id === editingUser.id ? newUser : u) }));
      setEditingUser(null);
    } else {
      setDb(prev => ({ ...prev, users: [...prev.users, newUser] }));
    }
    e.currentTarget.reset();
  };

  const applyRoleDefaultsToForm = (role: UserRole) => {
    if (!userFormRef.current) return;
    const defaults = db.roleDefaults[role] || (role === UserRole.ADMIN ? defaultAdminPermissions : db.roleDefaults[UserRole.TEACHER]);
    Object.keys(defaults).forEach(key => {
      const checkbox = userFormRef.current?.querySelector(`input[name="perm-${key}"]`) as HTMLInputElement;
      if (checkbox) checkbox.checked = (defaults as any)[key];
    });
  };

  // --- Filtered Data ---

  const stats = useMemo(() => {
    const totalStudents = db.students.length;
    const activeStudents = db.students.filter(s => s.status === 'Active').length;
    const totalFeesCollected = db.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalBatches = db.batches.length;
    return { totalStudents, activeStudents, totalFeesCollected, totalBatches };
  }, [db]);

  const filteredStudents = useMemo(() => db.students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.id.toLowerCase().includes(studentSearch.toLowerCase())
  ), [db.students, studentSearch]);

  const p = user?.permissions;

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
          <Receipt 
            payment={printingPayment.payment} 
            student={printingPayment.student} 
            instituteName={db.institute.name}
            instituteAddress={db.institute.address}
            logoUrl={db.institute.logoUrl}
          />
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
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl overflow-hidden p-2">
               {db.institute.logoUrl ? <img src={db.institute.logoUrl} className="w-full h-full object-contain" /> : <i className="fas fa-user-graduate text-4xl text-[#2d5a8e]"></i>}
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">{db.institute.name}</h1>
            <p className="text-blue-100 mt-1 uppercase text-[10px] font-black tracking-widest">{db.institute.tagline}</p>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Security Key / Username</label>
              <div className="relative">
                <i className="fas fa-id-card absolute left-4 top-4 text-gray-400"></i>
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Username" required
                  value={loginForm.username}
                  onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Access Password</label>
              <div className="relative">
                <i className="fas fa-key absolute left-4 top-4 text-gray-400"></i>
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••" required
                  value={loginForm.password}
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>
            </div>
            <button 
              disabled={isLoginLoading}
              type="submit"
              className="w-full py-4 bg-[#2d5a8e] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#1e3c5f] transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isLoginLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-shield-alt"></i>}
              {isLoginLoading ? 'Verifying...' : 'Login Securely'}
            </button>
            <p className="text-[9px] text-gray-400 text-center font-bold uppercase tracking-widest">Authorized Access Only &copy; {new Date().getFullYear()}</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      <AdmissionModal isOpen={isAdmissionModalOpen} onClose={() => setIsAdmissionModalOpen(false)} onSubmit={handleAdmissionSubmit} batches={db.batches} initialData={editingStudent} />
      <TeacherModal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} onSubmit={handleTeacherSubmit} initialData={editingTeacher} />
      <BatchModal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} onSubmit={handleBatchSubmit} teachers={db.teachers} initialData={editingBatch} />

      {/* Main Sidebar */}
      <aside className="w-full md:w-64 bg-[#1a365d] flex-shrink-0 shadow-2xl z-20 overflow-hidden flex flex-col">
        <div className="p-6 flex items-center gap-4 border-b border-blue-900/40">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden p-1 bg-white">
            {db.institute.logoUrl ? <img src={db.institute.logoUrl} className="w-full h-full object-contain" /> : <i className="fas fa-graduation-cap text-[#2d5a8e] text-xl"></i>}
          </div>
          <div>
            <h2 className="text-white font-black text-sm tracking-tight leading-none uppercase truncate w-28">{db.institute.name}</h2>
            <span className="text-blue-300 text-[8px] font-black uppercase tracking-widest opacity-60">Institute ERP</span>
          </div>
        </div>
        
        <nav className="mt-4 flex-1 overflow-y-auto">
          <SidebarItem icon="fa-chart-pie" label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} hidden={!p?.dashboard} />
          <SidebarItem icon="fa-user-graduate" label="Students" active={activeTab === 'students'} onClick={() => setActiveTab('students')} hidden={!p?.students} />
          <SidebarItem icon="fa-chalkboard-teacher" label="Teachers" active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} hidden={!p?.teachers} />
          <SidebarItem icon="fa-layer-group" label="Batches" active={activeTab === 'batches'} onClick={() => setActiveTab('batches')} hidden={!p?.batches} />
          <SidebarItem icon="fa-calendar-check" label="Attendance" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} hidden={!p?.attendance} />
          <SidebarItem icon="fa-file-invoice-dollar" label="Fees Management" active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} hidden={!p?.fees} />
          <SidebarItem icon="fa-file-alt" label="Reports Center" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} hidden={!p?.reports} />
          <SidebarItem icon="fa-sliders-h" label="More Options" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} hidden={!p?.settings} />
        </nav>

        <div className="p-4 mt-auto border-t border-blue-900/40 space-y-2">
           <button onClick={logout} className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all">
             Logout Session
           </button>
        </div>
      </aside>

      {/* Workspace Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b bg-white border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">
              {activeTab === 'settings' ? 'Global System Settings' : activeTab}
            </h1>
            <p className="text-xs text-gray-400 font-medium">Authorized Workspace: <span className="text-[#2d5a8e] font-black">{user.name}</span></p>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right hidden md:block">
               <p className="text-[10px] font-black text-[#2d5a8e] uppercase tracking-widest">{db.institute.phone}</p>
               <p className="text-[9px] text-gray-400 font-bold">{db.institute.email}</p>
             </div>
             <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2d5a8e] to-[#4299e1] flex items-center justify-center text-white font-black text-lg shadow-lg">
                {user.name.charAt(0)}
             </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-700">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card title="Students Active" value={stats.activeStudents} icon="fa-user-graduate" color="bg-[#2d5a8e]" />
                 <Card title="Faculty Count" value={db.teachers.length} icon="fa-user-tie" color="bg-purple-600" />
                 <Card title="Live Batches" value={stats.totalBatches} icon="fa-layer-group" color="bg-[#9dc84a]" />
                 <Card title="Total Revenue" value={formatCurrency(stats.totalFeesCollected)} icon="fa-coins" color="bg-[#f9a01b]" />
               </div>
               <div className="bg-white p-20 rounded-3xl border border-gray-100 shadow-sm text-center">
                  <div className="w-48 h-48 mx-auto mb-6 bg-white rounded-3xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-100 shadow-inner">
                    {db.institute.logoUrl ? <img src={db.institute.logoUrl} className="w-full h-full object-contain p-4" /> : <i className="fas fa-university text-7xl text-gray-100"></i>}
                  </div>
                  <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-2">{db.institute.name}</h2>
                  <p className="text-gray-400 uppercase text-xs font-black tracking-[0.4em] mb-8">{db.institute.tagline}</p>
                  <button onClick={() => setActiveTab('settings')} className="bg-[#2d5a8e] text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-blue-200 transition-all">
                     Update Branding & Options
                  </button>
               </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-8">
                <SearchBar value={studentSearch} onChange={setStudentSearch} placeholder="Search Name, ID..." />
                <button onClick={() => setIsAdmissionModalOpen(true)} className="bg-[#2d5a8e] text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-blue-100">
                  New Enrollment
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                 <table className="w-full">
                   <thead className="bg-gray-50 border-b">
                     <tr>
                       <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Enroll ID</th>
                       <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                       <th className="p-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Course</th>
                       <th className="p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {filteredStudents.map(s => (
                       <tr key={s.id} className="hover:bg-blue-50/20">
                         <td className="p-4 font-mono font-black text-xs text-[#2d5a8e]">{s.id}</td>
                         <td className="p-4 font-black text-gray-700">{s.name}</td>
                         <td className="p-4 text-xs font-bold text-gray-500">{s.course}</td>
                         <td className="p-4 text-center">
                           <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {s.status}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* --- SETTINGS: THE "MORE OPTIONS" PAGE --- */}
          {activeTab === 'settings' && (
            <div className="animate-in slide-in-from-bottom-6 duration-700 max-w-6xl mx-auto space-y-12 pb-12">
               
               {/* Internal Navigation for Settings */}
               <div className="flex bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit mx-auto">
                 <button onClick={() => setSettingsSubTab('profile')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${settingsSubTab === 'profile' ? 'bg-[#2d5a8e] text-white shadow-lg' : 'text-gray-400 hover:text-gray-700'}`}>
                   Institute Branding
                 </button>
                 <button onClick={() => setSettingsSubTab('users')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${settingsSubTab === 'users' ? 'bg-[#2d5a8e] text-white shadow-lg' : 'text-gray-400 hover:text-gray-700'}`}>
                   Staff & Access
                 </button>
                 <button onClick={() => setSettingsSubTab('templates')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${settingsSubTab === 'templates' ? 'bg-[#2d5a8e] text-white shadow-lg' : 'text-gray-400 hover:text-gray-700'}`}>
                   Role Templates
                 </button>
               </div>

               {/* Branding & Profile Sub-Tab */}
               {settingsSubTab === 'profile' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-500">
                    <div className="lg:col-span-1 space-y-8">
                       <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Master Brand Identity</h4>
                          <div className="w-48 h-48 mx-auto relative group">
                            <div className="w-full h-full bg-white rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden p-4 shadow-inner">
                               {db.institute.logoUrl ? <img src={db.institute.logoUrl} className="w-full h-full object-contain" /> : <i className="fas fa-university text-5xl text-gray-200 mt-8"></i>}
                            </div>
                            <label className="absolute inset-0 bg-black/40 text-white rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                               <i className="fas fa-camera text-2xl mb-1"></i>
                               <span className="text-[9px] font-black uppercase">Change Logo</span>
                               <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                          </div>
                          <div className="mt-6">
                            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">{db.institute.name}</h3>
                            <p className="text-[10px] text-[#2d5a8e] font-black uppercase tracking-widest mt-1">Official Brand Partner</p>
                          </div>
                          <div className="mt-8 pt-6 border-t border-gray-50 flex gap-2">
                             <button onClick={() => backupDB()} className="flex-1 py-3 bg-gray-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-200 transition-all">Download Backup</button>
                          </div>
                       </div>
                    </div>

                    <div className="lg:col-span-2">
                       <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-10 pb-4 border-b border-gray-50">Institute Details Management</h4>
                          <form onSubmit={handleInstituteUpdate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-[#2d5a8e] uppercase tracking-widest ml-1">Official Institute Name *</label>
                                  <input name="name" required defaultValue={db.institute.name} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#2d5a8e] outline-none font-bold text-gray-800" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-[#2d5a8e] uppercase tracking-widest ml-1">Brand Tagline / Mission</label>
                                  <input name="tagline" defaultValue={db.institute.tagline} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#2d5a8e] outline-none font-bold text-gray-500" />
                               </div>
                               <div className="space-y-2 md:col-span-2">
                                  <label className="text-[9px] font-black text-[#2d5a8e] uppercase tracking-widest ml-1">Registered Address *</label>
                                  <textarea name="address" required rows={3} defaultValue={db.institute.address} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#2d5a8e] outline-none font-bold text-gray-600" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-[#2d5a8e] uppercase tracking-widest ml-1">Primary Contact *</label>
                                  <input name="phone" required defaultValue={db.institute.phone} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#2d5a8e] outline-none font-bold" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[9px] font-black text-[#2d5a8e] uppercase tracking-widest ml-1">Official Email *</label>
                                  <input name="email" type="email" required defaultValue={db.institute.email} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#2d5a8e] outline-none font-bold" />
                               </div>
                            </div>
                            <div className="pt-6">
                               <button type="submit" className="w-full py-5 bg-[#2d5a8e] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-100 hover:bg-[#1e3c5f] transition-all flex items-center justify-center gap-3">
                                  <i className="fas fa-check-circle text-lg"></i> Confirm branding updates
                               </button>
                            </div>
                          </form>
                       </div>
                    </div>
                 </div>
               )}

               {/* Rest of the sub-tabs... */}
               {settingsSubTab === 'users' && <div className="p-8 bg-white rounded-3xl border border-gray-100">User Management Section Placeholder</div>}
               {settingsSubTab === 'templates' && <div className="p-8 bg-white rounded-3xl border border-gray-100">Role Templates Section Placeholder</div>}

            </div>
          )}
        </div>
      </main>

      {/* Floating Status Bar */}
      <footer className="fixed bottom-0 right-0 p-3 no-print pointer-events-none z-50">
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-200 shadow-2xl flex items-center gap-4">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[8px] font-black text-[#2d5a8e] uppercase tracking-widest">{db.institute.name} ACTIVE</span>
           </div>
           <span className="text-gray-300 text-[10px]">|</span>
           <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">v1.0.4 PRODUCTION</span>
        </div>
      </footer>
    </div>
  );
}
