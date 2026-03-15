import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { medicineService, userService } from '../services/api';
import {
    LayoutDashboard,
    ShoppingBag,
    MessageSquare,
    Bell,
    User,
    Search,
    ShoppingCart,
    Clock,
    Activity,
    LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, medicineRes] = await Promise.all([
                    userService.getProfile(),
                    medicineService.getAll()
                ]);
                setUser(profileRes.data);
                setMedicines(medicineRes.data.slice(0, 6)); // Show featured
            } catch (err) {
                console.error('Error fetching dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('auth_token');
        navigate('/auth');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-slate-900 text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800/50 border-r border-white/5 backdrop-blur-xl flex flex-col fixed h-full z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-slate-900">Rx</div>
                    <div>
                        <h1 className="font-bold text-sm tracking-tight text-white">PharmaCare AI</h1>
                        <p className="text-[10px] text-slate-400 font-medium">Patient Portal</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 mt-4 space-y-1">
                    <p className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Main</p>
                    <NavItem icon={<LayoutDashboard size={18} />} label="Home" active />
                    <NavItem icon={<ShoppingBag size={18} />} label="Shop Medicines" />
                    <NavItem icon={<ShoppingCart size={18} />} label="My Cart" />
                    <NavItem icon={<MessageSquare size={18} />} label="AI Assistant" />

                    <div className="pt-6">
                        <p className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Account</p>
                        <NavItem icon={<Clock size={18} />} label="My Orders" />
                        <NavItem icon={<Bell size={18} />} label="Reminders" />
                        <NavItem icon={<User size={18} />} label="Profile" onClick={() => navigate('/profile')} />
                    </div>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button onClick={logout} className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all font-medium">
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {/* Topbar */}
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Dashboard</h2>
                        <p className="text-slate-400 text-sm">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 pl-10 text-sm focus:border-indigo-500 outline-none w-64"
                                placeholder="Search medicines..."
                            />
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-white/5 rounded-xl text-slate-400 cursor-pointer hover:bg-white/10">
                                <Bell size={20} />
                            </div>
                            <div
                                onClick={() => navigate('/profile')}
                                className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-slate-900 cursor-pointer hover:scale-105 transition-transform"
                            >
                                {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-slate-800 border border-indigo-500/20 mb-8 relative overflow-hidden"
                >
                    <div className="relative z-10 max-w-xl">
                        <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                            AI Powered &middot; HIPAA Compliant
                        </span>
                        <h3 className="text-3xl font-extrabold mb-4 leading-tight">Your Intelligent <br /><span className="text-indigo-400">Healthcare Dashboard</span></h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">Manage your medicines, consult our AI assistant for drug queries, and track your healthcare journey in one place.</p>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/25 text-sm">
                                Start Shopping
                            </button>
                            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all text-sm">
                                AI Assistant
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard label="Active Orders" value="3" icon={<ShoppingBag size={20} className="text-indigo-400" />} />
                    <StatCard label="Pending Refills" value="1" icon={<Bell size={20} className="text-amber-400" />} />
                    <StatCard label="AI Consults" value="12" icon={<MessageSquare size={20} className="text-emerald-400" />} />
                    <StatCard label="Health Score" value="98%" icon={<Activity size={20} className="text-pink-400" />} />
                </div>

                {/* Featured Medicines */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Recommended for You</h3>
                    <button className="text-indigo-400 text-sm font-semibold hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {medicines.map((med) => (
                        <div key={med.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-all group">
                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                {med.id % 2 === 0 ? '💊' : '🧪'}
                            </div>
                            <h4 className="font-bold text-slate-100 mb-1">{med.name}</h4>
                            <p className="text-xs text-slate-500 mb-4">{med.dosage || 'Standard dose'}</p>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-indigo-400">₹{med.price}</span>
                                <button className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all">
                                    <ShoppingCart size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer font-medium ${active ? 'bg-indigo-500 text-slate-900 shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
        {icon}
        <span className="text-sm">{label}</span>
    </div>
);

const StatCard = ({ label, value, icon }) => (
    <div className="p-6 bg-slate-800/40 border border-white/5 rounded-3xl backdrop-blur-xl">
        <div className="p-3 bg-slate-800 rounded-2xl w-fit mb-4 border border-white/5">
            {icon}
        </div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        <h4 className="text-2xl font-bold mt-1 tracking-tight">{value}</h4>
    </div>
);

export default UserDashboard;
