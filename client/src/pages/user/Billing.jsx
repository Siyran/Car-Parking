import { useState, useEffect } from 'react';
import { billingAPI } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { CreditCard, Calendar, Clock, Receipt } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, formatDuration } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function Billing() {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => { loadBill(); }, [month]);

  const loadBill = async () => {
    setLoading(true);
    try {
      const { data } = await billingAPI.getMonthly({ month });
      setBill(data);
    } catch (err) {
      toast.error('Failed to load bill');
    }
    setLoading(false);
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await billingAPI.pay({ month, amount: bill.totalAmount });
      toast.success('Payment simulated successfully!');
      loadBill();
    } catch (err) {
      toast.error('Payment failed');
    }
    setPaying(false);
  };

  return (
    <div className="pt-20 min-h-screen bg-surface-50">
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-surface-900">Monthly Billing</h1>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="text-sm px-4 py-2 rounded-xl border border-surface-200 focus:ring-2 focus:ring-primary-500/30 outline-none" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" style={{ animation: 'spin 1s linear infinite' }} /></div>
        ) : bill && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Amount', value: formatCurrency(bill.totalAmount), icon: CreditCard, color: 'text-primary-600' },
                { label: 'Total Sessions', value: bill.totalSessions, icon: Calendar, color: 'text-accent-500' },
                { label: 'Total Time', value: formatDuration(bill.totalDuration), icon: Clock, color: 'text-success-500' }
              ].map(({ label, value, icon: SIcon, color }) => (
                <Card key={label}>
                  <div className="p-5 text-center">
                    <SIcon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
                    <div className="text-2xl font-bold text-surface-800">{value}</div>
                    <div className="text-xs text-surface-400 mt-1">{label}</div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pay button */}
            {bill.totalAmount > 0 && !bill.isPaid && (
              <Card className="mb-6 bg-gradient-to-r from-primary-600 to-accent-500 text-white">
                <div className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Payment Due</h3>
                    <p className="text-white/70 text-sm mt-1">Pay your monthly parking bill</p>
                  </div>
                  <Button onClick={handlePay} loading={paying} variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-surface-50">
                    Pay {formatCurrency(bill.totalAmount)}
                  </Button>
                </div>
              </Card>
            )}

            {bill.isPaid && bill.totalAmount > 0 && (
              <Card className="mb-6 bg-success-500/5 border-success-200">
                <div className="p-5 text-center">
                  <Badge variant="success" className="text-sm px-4 py-1">✓ Paid</Badge>
                  <p className="text-surface-500 text-sm mt-2">Your bill for this month has been paid</p>
                </div>
              </Card>
            )}

            {/* Sessions breakdown */}
            <h2 className="text-lg font-semibold text-surface-800 mb-3">Session Details</h2>
            <div className="space-y-3">
              {bill.bookings?.map(b => (
                <Card key={b._id}>
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-surface-800 text-sm">{b.spot?.title}</h4>
                      <p className="text-xs text-surface-500">{formatDate(b.startTime)} • {formatDuration(b.duration)}</p>
                    </div>
                    <div className="font-bold text-surface-800">{formatCurrency(b.totalAmount)}</div>
                  </div>
                </Card>
              ))}
              {bill.bookings?.length === 0 && (
                <div className="text-center py-8 text-surface-400">
                  <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No sessions this month</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
