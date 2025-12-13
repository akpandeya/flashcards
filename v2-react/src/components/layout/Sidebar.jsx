import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Library, Play } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function Sidebar({ className }) {
    const navigate = useNavigate();

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/courses', icon: Library, label: 'Courses' },
        { to: '/dictionary', icon: BookOpen, label: 'Dictionary' },
    ];

    return (
        <aside className={`flex flex-col h-full bg-slate-900 text-white w-64 p-4 border-r border-slate-800 ${className}`}>
            <div className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                    LingoFlow
                </h1>
                <p className="text-xs text-slate-400 mt-1">V2 React Edition</p>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                ? 'bg-slate-800 text-teal-400'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-8 border-t border-slate-800">
                <button
                    onClick={() => navigate('/review')}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-teal-500/20"
                >
                    <Play size={20} fill="currentColor" />
                    <span>Review</span>
                </button>
            </div>
        </aside>
    );
}
