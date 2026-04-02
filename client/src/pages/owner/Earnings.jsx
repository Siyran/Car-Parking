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
    <div className="pt-24 min-h-screen bg-surface-950 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 map-grid opacity-10 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-8 w-full pb-24 relative z-10">
        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-10 decoration-primary-500 underline decoration-4 underline-offset-8">
           Revenue <span className="text-primary-400">Stream</span>.
        </h1>

        {/* Monthly chart */}
        {data?.earningsByMonth?.length > 0 && (
          <Card className="mb-8 glass-dark border-white/5">
            <div className="p-8">
              <h2 className="text-xs font-black text-surface-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-primary-400" />
                Aggregated Monthly Performance
              </h2>
              <div className="space-y-6">
                {data.earningsByMonth.map(m => {
                  const maxEarnings = Math.max(...data.earningsByMonth.map(x => x.earnings));
                  return (
                    <div key={m._id} className="flex items-center gap-6">
                      <span className="text-xs font-bold text-white italic tracking-widest w-24 shrink-0 opacity-80">{m._id}</span>
                      <div className="flex-1 bg-white/5 rounded-2xl h-10 overflow-hidden border border-white/5">
                        <div className="bg-linear-to-r from-primary-600 to-accent-500 h-full rounded-2xl flex items-center px-4 transition-all duration-700 shadow-glow"
                          style={{ width: `${Math.max((m.earnings / maxEarnings) * 100, 10)}%` }}>
                          <span className="text-xs font-black text-white whitespace-nowrap drop-shadow-sm">{formatCurrency(m.earnings)}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-surface-500 w-24 text-right uppercase tracking-widest">{m.sessions} syncs</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Transactions */}
        <Card className="glass-dark border-white/5">
          <div className="p-8">
            <h2 className="text-xs font-black text-surface-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
               <Calendar className="w-4 h-4 text-accent-400" />
               Historical Ledgers
            </h2>
            <div className="space-y-2">
              {data?.transactions?.length === 0 && (
                 <div className="text-center py-12">
                   <p className="text-lg font-bold text-white italic uppercase tracking-tighter opacity-20">Zero Ledger Entries</p>
                 </div>
              )}
              {data?.transactions?.map(t => (
                <div key={t._id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white/[0.02] border border-transparent hover:border-white/5 hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 shadow-2xl transition-transform group-hover:scale-110 ${t.type === 'withdrawal' ? 'bg-danger-500/10' : 'bg-emerald-500/10'}`}>
                      <IndianRupee className={`w-5 h-5 ${t.type === 'withdrawal' ? 'text-danger-400' : 'text-emerald-400'}`} />
                    </div>
                    <div>
                      <p className="text-base font-black text-white italic uppercase tracking-tighter group-hover:text-primary-400 transition-colors leading-none mb-1">{t.description || t.type}</p>
                      <p className="text-[9px] font-bold text-surface-500 uppercase tracking-widest">{formatDate(t.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`text-xl font-black italic tracking-tighter ${t.type === 'withdrawal' ? 'text-danger-400' : 'text-emerald-400'}`}>
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
