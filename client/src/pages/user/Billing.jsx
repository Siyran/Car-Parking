import { useState, useEffect } from 'react';
import { billingAPI } from '../../api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { CreditCard, Calendar, Clock, Receipt, Wallet } from 'lucide-react';
import { formatCurrency, formatDate, formatTime, formatDuration } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function Billing() {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
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


  const handlePay = async (method) => {
    setPaying(method);
    try {
      await billingAPI.pay({ month, amount: bill.totalAmount, paymentMethod: method });
      toast.success(`Payment successful via ${method}!`);
      loadBill();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment failed');
    }
    setPaying(null);
  };

  return (
    <div className="pt-32 min-h-screen bg-surface-950 text-white selection:bg-primary-500 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 map-grid opacity-10 pointer-events-none" />
      <div className="max-w-3xl mx-auto px-4 pb-12 relative z-10 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none pt-10">Monthly Billing</h1>
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="text-xs px-4 py-2 rounded-xl bg-surface-900 border border-white/5 text-white focus:ring-2 focus:ring-primary-500/30 outline-none uppercase font-black tracking-widest" />
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
                <Card key={label} className="bg-surface-900/50 border-white/5 backdrop-blur-sm">
                  <div className="p-5 text-center">
                    <SIcon className={`w-6 h-6 mx-auto mb-2 ${color} custom-icon`} />
                    <div className="text-2xl font-black text-white italic tracking-tighter">{value}</div>
                    <div className="text-[10px] font-black text-surface-500 uppercase tracking-widest mt-1">{label}</div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pay button */}
            {bill.totalAmount > 0 && !bill.isPaid && (
              <Card className="mb-6 bg-linear-to-r from-surface-900 to-surface-800 border-white/10 relative overflow-hidden">
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="font-black text-white italic uppercase tracking-widest text-lg">Payment Due: <span className="text-primary-400">{formatCurrency(bill.totalAmount)}</span></h3>
                    <p className="text-surface-400 text-[10px] font-black uppercase tracking-widest mt-1">Select a payment method to settle your bill</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button 
                      onClick={() => handlePay('wallet')} 
                      loading={paying === 'wallet'} 
                      disabled={(bill.walletBalance || 0) < bill.totalAmount || paying !== null}
                      variant="primary" 
                      className="flex-1 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-md pointer-events-none"></div>
                      <Wallet className="w-4 h-4 mr-2 relative z-10" /> <span className="relative z-10 font-bold tracking-widest">Pay with Wallet</span>
                    </Button>
                    <Button 
                      onClick={() => handlePay('simulated')} 
                      loading={paying === 'simulated'} 
                      disabled={paying !== null}
                      variant="secondary" 
                      className="flex-1 group hover:border-white/20 transition-colors font-bold tracking-widest bg-surface-900 border-white/10"
                    >
                      <CreditCard className="w-4 h-4 mr-2" /> Pay with Card 
                    </Button>
                  </div>
                  {(bill.walletBalance || 0) < bill.totalAmount && (
                    <p className="text-error-500 text-[10px] uppercase font-black tracking-widest mt-3 flex items-center gap-1"><Wallet className="w-3 h-3" /> Insufficient wallet balance</p>
                  )}
                </div>
              </Card>
            )}

            {bill.isPaid && bill.totalAmount > 0 && (
              <Card className="mb-6 bg-success-500/5 border-success-500/20 backdrop-blur-sm">
                <div className="p-5 text-center">
                  <Badge variant="success" className="!rounded-lg text-xs px-4 py-1 font-black uppercase tracking-widest border-none">✓ Paid</Badge>
                  <p className="text-surface-400 text-[10px] font-black uppercase tracking-widest mt-3">Your bill for this month has been paid</p>
                </div>
              </Card>
            )}

            {/* Sessions breakdown */}
            <h2 className="text-lg font-black text-white italic uppercase tracking-widest mb-4">Session Details</h2>
            <div className="space-y-3">
              {bill.bookings?.map(b => (
                <Card key={b._id} className="bg-surface-900/50 border-white/5 hover:border-primary-500/20 group transition-all">
                  <div className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-white italic uppercase tracking-tighter text-sm group-hover:text-primary-400 transition-colors">{b.spot?.title}</h4>
                      <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">{formatDate(b.startTime)} • {formatDuration(b.duration)}</p>
                    </div>
                    <div className="font-black text-white italic tracking-tighter text-lg">{formatCurrency(b.totalAmount)}</div>
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
