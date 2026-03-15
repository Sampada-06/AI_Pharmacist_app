import React, { useEffect, useState } from 'react';
import { userService, authService } from '../services/api';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, MapPin, LogOut, ShieldCheck, CreditCard } from 'lucide-react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await userService.getProfile();
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return <div className="text-center p-20 text-red-400 font-bold">Error loading profile</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 pt-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden"
            >
                {/* Header/Cover */}
                <div className="h-32 bg-indigo-600/20 border-b border-indigo-500/10 flex items-end px-8 pb-4">
                    <div className="p-1 bg-slate-900 rounded-2xl border border-white/10 translate-y-8">
                        <div className="w-24 h-24 bg-indigo-500 rounded-xl flex items-center justify-center text-3xl font-bold">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                </div>

                <div className="px-8 pt-12 pb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            <p className="text-indigo-400 font-medium mt-1 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4" />
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account
                            </p>
                        </div>
                        <button
                            onClick={authService.logout}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                        <InfoCard icon={<Mail className="w-5 h-5" />} label="Email Address" value={user.email} />
                        <InfoCard icon={<Phone className="w-5 h-5" />} label="Phone Number" value={user.phone || 'Not provided'} />
                        <InfoCard icon={<Calendar className="w-5 h-5" />} label="Date of Birth" value={user.date_of_birth || 'Not set'} />
                        <InfoCard icon={<MapPin className="w-5 h-5" />} label="Residential Address" value={user.address || 'No address saved'} />
                    </div>

                    <div className="mt-12 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500 rounded-xl">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold">Membership Status</h3>
                                <p className="text-sm text-slate-400">Pro Member &bull; Free deliveries enabled</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
                            Active
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const InfoCard = ({ icon, label, value }) => (
    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
        <div className="p-2 bg-white/5 rounded-lg text-slate-400">
            {icon}
        </div>
        <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
            <p className="font-semibold text-slate-200 mt-0.5">{value}</p>
        </div>
    </div>
);

export default Profile;
