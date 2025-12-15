import { LayoutDashboard, GraduationCap, Settings, LogOut, BookOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export const Sidebar = () => {
    const links = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: GraduationCap, label: 'My Exams', to: '/exams' },
        { icon: BookOpen, label: 'Courses', to: '/courses' },
        { icon: Settings, label: 'Settings', to: '/settings' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4 flex flex-col z-10 hidden md:flex">
            <div className="flex items-center gap-2 px-2 py-4 mb-8">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    L
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">LingoDrift</span>
            </div>

            <nav className="flex-1 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-gray-200 pt-4">
                <button className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};
