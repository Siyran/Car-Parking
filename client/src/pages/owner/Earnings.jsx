import { useState, useEffect } from 'react';
import { billingAPI } from '../../api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { TrendingUp, IndianRupee, Calendar } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function Earnings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data: d } = await billingAPI.getOwnerEarnings();
      setData(d);
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  if (loading) return <div className="pt-20 flex justify-center min-h-screen"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} /></div>;

  return (
    <div className="pt-20 min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Earnings</h1>

        {/* Monthly chart */}
        {data?.earningsByMonth?.length > 0 && (
          <Card className="mb-6">
            <div className="p-6">
              <h2 className="font-semibold text-surface-800 mb-4">Monthly Earnings</h2>
              <div className="space-y-3">
                {data.earningsByMonth.map(m => {
                  const maxEarnings = Math.max(...data.earningsByMonth.map(x => x.earnings));
                  return (
                    <div key={m._id} className="flex items-center gap-4">
                      <span className="text-sm text-surface-500 w-20 shrink-0">{m._id}</span>
                      <div className="flex-1 bg-surface-100 rounded-full h-8 overflow-hidden">
                        <div className="bg-gradient-to-r from-primary-500 to-accent-400 h-full rounded-full flex items-center px-3 transition-all duration-500"
                          style={{ width: `${Math.max((m.earnings / maxEarnings) * 100, 10)}%` }}>
                          <span className="text-xs font-bold text-white whitespace-nowrap">{formatCurrency(m.earnings)}</span>
                        </div>
                      </div>
                      <span className="text-xs text-surface-400 w-20 text-right">{m.sessions} sessions</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Transactions */}
        <Card>
          <div className="p-6">
            <h2 className="font-semibold text-surface-800 mb-4">Transaction History</h2>
            <div className="space-y-3">
              {data?.transactions?.length === 0 && <p className="text-center py-6 text-surface-400 text-sm">No transactions</p>}
              {data?.transactions?.map(t => (
                <div key={t._id} className="flex items-center justify-between py-3 border-b border-surface-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'withdrawal' ? 'bg-danger-50' : 'bg-success-50'}`}>
                      <IndianRupee className={`w-4 h-4 ${t.type === 'withdrawal' ? 'text-danger-500' : 'text-success-500'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-800">{t.description || t.type}</p>
                      <p className="text-xs text-surface-400">{formatDate(t.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${t.type === 'withdrawal' ? 'text-danger-500' : 'text-success-500'}`}>
                    {t.type === 'withdrawal' ? '-' : '+'}{formatCurrency(t.ownerShare || t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
