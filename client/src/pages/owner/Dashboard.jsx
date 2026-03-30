import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { billingAPI, spotAPI } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { TrendingUp, Car, ParkingCircle, Wallet, Plus, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data } = await billingAPI.getOwnerDashboard();
      setDashboard(data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!dashboard || dashboard.availableBalance <= 0) return;
    try {
      await billingAPI.withdraw({ amount: dashboard.availableBalance });
      toast.success('Withdrawal processed!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Withdrawal failed');
    }
  };

  if (loading) return <div className="pt-20 flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} /></div>;

  const stats = [
    { label: 'Monthly Earnings', value: formatCurrency(dashboard?.monthlyEarnings || 0), icon: TrendingUp, color: 'from-primary-500 to-blue-400' },
    { label: 'Total Earnings', value: formatCurrency(dashboard?.totalEarnings || 0), icon: IndianRupee, color: 'from-success-500 to-emerald-400' },
    { label: 'Active Bookings', value: dashboard?.activeBookings || 0, icon: Car, color: 'from-accent-500 to-purple-400' },
    { label: 'Total Spots', value: dashboard?.totalSpots || 0, icon: ParkingCircle, color: 'from-warning-500 to-amber-400' }
  ];

  return (
    <div className="pt-20 min-h-screen bg-surface-50">
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-surface-900">Owner Dashboard</h1>
          <Link to="/owner/add-spot"><Button><Plus className="w-4 h-4" /> Add Spot</Button></Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: SIcon, color }) => (
            <Card key={label} className="overflow-hidden">
              <div className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                  <SIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-surface-800">{value}</div>
                <div className="text-xs text-surface-400 mt-1">{label}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Wallet */}
        <Card className="mb-6 bg-gradient-to-r from-surface-900 to-surface-800 text-white">
          <div className="p-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="w-5 h-5 text-primary-400" />
                <span className="text-sm text-surface-300">Available Balance</span>
              </div>
              <div className="text-3xl font-bold">{formatCurrency(dashboard?.availableBalance || 0)}</div>
              <p className="text-xs text-surface-400 mt-1">60% of booking revenue</p>
            </div>
            <Button onClick={handleWithdraw} variant="success" disabled={!dashboard?.availableBalance}>
              Withdraw
            </Button>
          </div>
        </Card>

        {/* Recent transactions */}
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-surface-800">Recent Transactions</h2>
              <Link to="/owner/earnings" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
            </div>
            <div className="space-y-3">
              {dashboard?.recentTransactions?.length === 0 && (
                <p className="text-center text-surface-400 py-6 text-sm">No transactions yet</p>
              )}
              {dashboard?.recentTransactions?.map(t => (
                <div key={t._id} className="flex items-center justify-between py-3 border-b border-surface-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'withdrawal' ? 'bg-danger-50' : 'bg-success-50'}`}>
                      <IndianRupee className={`w-4 h-4 ${t.type === 'withdrawal' ? 'text-danger-500' : 'text-success-500'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-800">{t.description || t.type}</p>
                      <p className="text-xs text-surface-400">{t.driver?.name || ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${t.type === 'withdrawal' ? 'text-danger-500' : 'text-success-500'}`}>
                      {t.type === 'withdrawal' ? '-' : '+'}{formatCurrency(t.ownerShare || t.amount)}
                    </span>
                    <Badge variant={t.status === 'completed' ? 'success' : 'warning'} className="ml-2">{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
