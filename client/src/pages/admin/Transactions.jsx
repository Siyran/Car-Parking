import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { IndianRupee } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getTransactions({ type: filter || undefined });
      setTransactions(data.transactions);
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const typeVariant = { booking: 'primary', payout: 'success', withdrawal: 'warning' };

  return (
    <div className="pt-20 min-h-screen bg-surface-50">
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Transactions</h1>

        <div className="flex gap-2 mb-4">
          {['', 'booking', 'withdrawal'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-primary-100 text-primary-700' : 'text-surface-500 hover:bg-surface-100'}`}>
              {f || 'All'}
            </button>
          ))}
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50">
                <tr>
                  {['Type', 'User', 'Owner', 'Amount', 'Owner Share', 'Platform Share', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id} className="border-t border-surface-50 hover:bg-surface-50/50">
                    <td className="px-4 py-3"><Badge variant={typeVariant[t.type] || 'neutral'}>{t.type}</Badge></td>
                    <td className="px-4 py-3 text-sm text-surface-600">{t.user?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm text-surface-600">{t.owner?.name || '—'}</td>
                    <td className="px-4 py-3 text-sm font-bold text-surface-800">{formatCurrency(t.amount)}</td>
                    <td className="px-4 py-3 text-sm text-success-500">{formatCurrency(t.ownerShare)}</td>
                    <td className="px-4 py-3 text-sm text-primary-500">{formatCurrency(t.platformShare)}</td>
                    <td className="px-4 py-3"><Badge variant={t.status === 'completed' ? 'success' : 'warning'}>{t.status}</Badge></td>
                    <td className="px-4 py-3 text-sm text-surface-400">{formatDate(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && !loading && (
              <div className="text-center py-8 text-surface-400 text-sm">No transactions found</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
