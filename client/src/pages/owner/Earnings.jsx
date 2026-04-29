import { useState, useEffect } from 'react';
import { billingAPI } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { TrendingUp, Calendar, DollarSign, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Earnings() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const { data: d } = await billingAPI.getOwnerEarnings();
      setData(d);
    } catch { toast.error('Failed to load earnings data'); }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface-950">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-sm text-surface-500 font-medium tracking-widest uppercase">Loading earnings...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-surface-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Earnings</h1>
            <p className="text-surface-500 text-sm mt-1">Track your revenue and withdrawal history</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data?.earningsByMonth?.length > 0 && (
          <Card className="p-8">
            <h2 className="text-xs font-semibold text-surface-500 uppercase tracking-widest mb-8 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              Monthly Revenue
            </h2>
            <div className="space-y-6">
              {data.earningsByMonth.map(m => {
                const maxEarnings = Math.max(...data.earningsByMonth.map(x => x.earnings));
                return (
                  <div key={m._id} className="space-y-2">
                    <div className="flex justify-between text-xs font-medium uppercase tracking-widest">
                      <span className="text-white">{m._id}</span>
                      <span className="text-surface-500">{m.sessions} sessions</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-white/5 rounded-full h-8 overflow-hidden border border-white/5">
                        <div className="bg-primary-600 h-full rounded-full flex items-center px-3 transition-all duration-700"
                          style={{ width: `${Math.max((m.earnings / maxEarnings) * 100, 10)}%` }}>
                          <span className="text-[10px] font-bold text-white whitespace-nowrap">{formatCurrency(m.earnings)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card className="p-8 border-primary-500/20 bg-primary-600/5">
          <h2 className="text-xs font-semibold text-surface-500 uppercase tracking-widest mb-8 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary-500" />
            Payout Summary
          </h2>
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-4xl font-bold text-white">{formatCurrency(data?.transactions?.reduce((acc, t) => acc + (t.ownerShare || t.amount), 0) || 0)}</p>
            </div>
            <p className="text-xs text-surface-500 leading-relaxed">Payments are processed and settled directly to your connected UPI account upon session completion.</p>
            <Button className="w-full py-4 text-sm font-semibold">Request Withdrawal</Button>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-widest px-1">Transaction History</h3>
        <div className="space-y-2">
          {data?.transactions?.length === 0 ? (
            <p className="text-center py-12 text-surface-600 italic">No transactions found.</p>
          ) : (
            data?.transactions?.map(t => (
              <Card key={t._id} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.type === 'withdrawal' ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                    <DollarSign className={`w-5 h-5 ${t.type === 'withdrawal' ? 'text-red-500' : 'text-emerald-500'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.description || t.type}</p>
                    <p className="text-[10px] text-surface-600 mt-0.5">{formatDate(t.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base font-bold ${t.type === 'withdrawal' ? 'text-red-500' : 'text-white'}`}>
                    {t.type === 'withdrawal' ? '-' : '+'}{formatCurrency(t.ownerShare || t.amount)}
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
