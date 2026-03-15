import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineService, userService } from '../services/api';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Clock, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ inventory: 0, lowStock: 0, pendingRX: 0 });
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('auth_token');
        navigate('/auth');
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const medRes = await medicineService.getAll();
                const lowStockRes = await medicineService.getLowStock();

                setMedicines(medRes.data);
                setStats({
                    inventory: medRes.data.length,
                    lowStock: lowStockRes.data.length,
                    pendingRX: 0 // Will integrate RX pending count later
                });
            } catch (err) {
                console.error('Failed to load dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-20 text-center">Loading Admin Controls...</div>;

    return (
        <div className="p-8 pt-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-slate-400 mt-1">Management portal for inventory and operations</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={logout}
                        className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-bold transition-all border border-red-500/20 flex items-center gap-2"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                    <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25">
                        Add New Medicine
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard
                    icon={<Package className="text-blue-400" />}
                    label="Total Inventory"
                    value={stats.inventory}
                    trend="+12 from last week"
                />
                <StatCard
                    icon={<AlertTriangle className="text-amber-400" />}
                    label="Low Stock Alerts"
                    value={stats.lowStock}
                    alert={stats.lowStock > 0}
                />
                <StatCard
                    icon={<Clock className="text-purple-400" />}
                    label="Pending Prescriptions"
                    value={stats.pendingRX}
                />
            </div>

            {/* Inventory Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                        Inventory Status
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4">Medicine Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Stock Level</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {medicines.map((med) => (
                                <tr key={med.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold">{med.name}</div>
                                        <div className="text-xs text-slate-500">{med.brand}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-300 border border-white/10">
                                            {med.category || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${med.stock_quantity < med.minimum_stock_alert ? 'bg-amber-500' : 'bg-green-500'}`}
                                                    style={{ width: `${Math.min((med.stock_quantity / 100) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium">{med.stock_quantity}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-indigo-400">₹{med.price}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-slate-400 hover:text-white transition-colors">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend, alert }) => (
    <div className={`p-6 bg-white/5 border rounded-3xl backdrop-blur-xl ${alert ? 'border-amber-500/20' : 'border-white/10'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
            {trend && <span className="text-xs text-green-400 font-medium">{trend}</span>}
        </div>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
    </div>
);

export default Dashboard;
