import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Users, ParkingCircle, TrendingUp, Activity, BarChart3, IndianRupee, Car } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await adminAPI.getAnalytics();
      setAnalytics(data);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  if (loading) return <div className="pt-20 flex justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} /></div>;

  const stats = [
    { label: 'Total Users', value: analytics?.users?.total, sub: `${analytics?.users?.drivers} drivers, ${analytics?.users?.owners} owners`, icon: Users, color: 'from-primary-500 to-blue-400' },
    { label: 'Parking Spots', value: analytics?.spots?.total, sub: `${analytics?.spots?.pending} pending approval`, icon: ParkingCircle, color: 'from-accent-500 to-purple-400' },
    { label: 'Total Bookings', value: analytics?.bookings?.total, sub: `${analytics?.bookings?.active} active now`, icon: Car, color: 'from-success-500 to-emerald-400' },
    { label: 'Platform Revenue', value: formatCurrency(analytics?.revenue?.platformRevenue || 0), sub: `Total: ${formatCurrency(analytics?.revenue?.totalRevenue || 0)}`, icon: IndianRupee, color: 'from-warning-500 to-amber-400' }
  ];

  return (
    <div className="pt-20 min-h-screen bg-surface-50">
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, sub, icon: SIcon, color }) => (
            <Card key={label}>
              <div className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                  <SIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-surface-800">{value}</div>
                <div className="text-xs text-surface-400 mt-1">{label}</div>
                <div className="text-[10px] text-surface-400 mt-0.5">{sub}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Monthly Revenue Chart */}
        {analytics?.monthlyRevenue?.length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="font-semibold text-surface-800 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary-500" /> Monthly Revenue</h2>
              <div className="space-y-3">
                {analytics.monthlyRevenue.map(m => {
                  const max = Math.max(...analytics.monthlyRevenue.map(x => x.revenue));
                  return (
                    <div key={m._id} className="flex items-center gap-4">
                      <span className="text-sm text-surface-500 w-20 shrink-0">{m._id}</span>
                      <div className="flex-1 bg-surface-100 rounded-full h-7 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-500 to-accent-400 h-full rounded-full flex items-center px-3"
                          style={{ width: `${Math.max((m.revenue / max) * 100, 10)}%` }}>
                          <span className="text-xs font-bold text-white whitespace-nowrap">{formatCurrency(m.revenue)}</span>
                        </div>
                      </div>
                      <span className="text-xs text-surface-400 w-24 text-right">{m.bookings} bookings</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
