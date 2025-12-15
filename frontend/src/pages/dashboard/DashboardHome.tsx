export const DashboardHome = () => {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Willkommen zurück, Alex! 👋</h1>
                <p className="text-gray-500 mt-2">Ready to conquer your German B1 Exam today?</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Exams Passed', value: '4', color: 'bg-green-100 text-green-700' },
                    { label: 'Study Streak', value: '12 Days', color: 'bg-orange-100 text-orange-700' },
                    { label: 'Next Goal', value: 'Goethe B1', color: 'bg-blue-100 text-blue-700' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 mb-1">{stat.label}</div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Placeholder for Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                Recent Exam Activity Chart (Recharts) goes here...
            </div>
        </div>
    );
};
