import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import StatCard from '../components/dashboard/StatCard';
import SchemeBarChart from '../components/dashboard/SchemeBarChart';
import StatusPieChart from '../components/dashboard/StatusPieChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { BarChart3, FileText, Clock, CheckCircle } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/dashboard/stats')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <p className="text-red-600">Failed to load dashboard</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={FileText} count={stats.total} label="Total Applications" />
        <StatCard icon={Clock} count={stats.byStatus.Draft} label="Draft" />
        <StatCard icon={BarChart3} count={stats.byStatus.Review} label="In Review" />
        <StatCard icon={CheckCircle} count={stats.byStatus.Approved} label="Approved" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <SchemeBarChart data={stats.byScheme} />
        <StatusPieChart data={stats.byStatus} />
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={stats.recentActivity} />
    </div>
  );
}
