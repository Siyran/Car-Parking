import { useState, useEffect } from 'react';
import { walletAPI } from '../../api';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet as WalletIcon, Plus, ArrowDownLeft, ArrowUpRight, RefreshCw, IndianRupee, Zap, History, CreditCard, Smartphone, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpMethod, setTopUpMethod] = useState('upi');
  const [showTopUp, setShowTopUp] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [balRes, histRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getHistory()
      ]);
      setBalance(balRes.data.balance);
      setHistory(histRes.data.transactions);
    } catch (err) {
      toast.error('Failed to load wallet data');
    }
    setLoading(false);
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > 10000) {
      toast.error('Maximum top-up is ₹10,000');
      return;
    }
    setProcessing(true);
    try {
      const { data } = await walletAPI.topUp({ amount, method: topUpMethod });
      setBalance(data.balance);
      toast.success(data.message);
      setTopUpAmount('');
      setShowTopUp(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Top-up failed');
    }
    setProcessing(false);
  };

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

  const getTypeInfo = (type) => {
    switch (type) {
      case 'wallet_topup': return { label: 'Top Up', icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', sign: '+' };
      case 'wallet_debit': return { label: 'Parking Payment', icon: ArrowUpRight, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', sign: '-' };
      case 'refund': return { label: 'Refund', icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', sign: '+' };
      default: return { label: type, icon: IndianRupee, color: 'text-surface-400', bg: 'bg-white/5', border: 'border-white/10', sign: '' };
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="pt-32 min-h-screen bg-surface-950 selection:bg-primary-500 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 map-grid opacity-10 pointer-events-none" />

      <div className="max-w-[900px] mx-auto px-6 md:px-8 w-full pb-24 relative z-10">

        {/* Header */}
        <div className="mb-12 pt-10 border-b border-white/5 pb-10">
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary-600/10 border border-primary-500/20 text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] w-fit mb-6">
            <WalletIcon className="w-3.5 h-3.5" />
            Digital Wallet
          </div>
          <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
            My <span className="gradient-text italic text-glow">Wallet</span>.
          </h1>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 group"
        >
          <div className="absolute -inset-1 bg-linear-to-r from-primary-500 to-accent-500 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="glass-dark rounded-[3rem] border-2 border-primary-500/30 p-10 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]">
            <div className="absolute top-0 right-0 w-60 h-60 bg-primary-600/10 blur-[100px] pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.4em] mb-3">Available Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">INR</span>
                  <h2 className="text-6xl md:text-7xl font-black text-white italic tracking-tighter leading-none">
                    {loading ? '---' : `₹${balance.toLocaleString('en-IN')}`}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setShowTopUp(!showTopUp)}
                className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-black uppercase tracking-[0.15em] transition-all shadow-glow group/btn"
              >
                <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
                Add Funds
              </button>
            </div>
          </div>
        </motion.div>

        {/* Top-Up Panel */}
        <AnimatePresence>
          {showTopUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-10"
            >
              <div className="glass-dark rounded-[2.5rem] border border-white/10 p-10 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Quick Top-Up</h3>
                    <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Select amount or enter custom</p>
                  </div>
                </div>

                {/* Quick Amounts */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {quickAmounts.map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTopUpAmount(amt.toString())}
                      className={`py-4 rounded-2xl text-sm font-black uppercase tracking-wider transition-all border ${
                        topUpAmount === amt.toString()
                          ? 'bg-primary-600 text-white border-primary-500 shadow-glow'
                          : 'bg-white/5 text-surface-300 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-surface-500">₹</span>
                    <input
                      type="number"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      placeholder="Custom amount"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-12 text-xl font-black text-white placeholder:text-surface-600 focus:outline-none focus:border-primary-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-surface-500 uppercase tracking-[0.3em]">Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'upi', label: 'UPI', icon: Smartphone, sub: 'Google Pay / PhonePe' },
                      { id: 'card', label: 'Card', icon: CreditCard, sub: 'Debit / Credit Card' }
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setTopUpMethod(m.id)}
                        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                          topUpMethod === m.id
                            ? 'bg-primary-600/10 border-primary-500/30 text-white'
                            : 'bg-white/5 border-white/10 text-surface-400 hover:text-white'
                        }`}
                      >
                        <m.icon className={`w-6 h-6 ${topUpMethod === m.id ? 'text-primary-400' : ''}`} />
                        <div className="text-left">
                          <p className="text-sm font-black uppercase tracking-wider">{m.label}</p>
                          <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{m.sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Confirm */}
                <button
                  onClick={handleTopUp}
                  disabled={processing || !topUpAmount}
                  className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black uppercase tracking-[0.2em] transition-all shadow-glow flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <IndianRupee className="w-5 h-5" />
                      {topUpAmount ? `Add ₹${parseFloat(topUpAmount).toLocaleString()} to Wallet` : 'Enter Amount'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction History */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="flex items-center gap-3 text-[10px] font-black text-surface-400 uppercase tracking-[0.5em] opacity-80">
              <History className="w-3.5 h-3.5" /> Transaction Ledger
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {history.length === 0 && !loading && (
            <div className="text-center py-24 glass-dark border border-white/5 rounded-[3rem] relative overflow-hidden">
              <WalletIcon className="w-16 h-16 mx-auto mb-6 opacity-20 text-white" />
              <p className="text-xl font-black text-white italic uppercase tracking-tighter">No Transactions Yet</p>
              <p className="text-sm font-medium text-surface-400 mt-2 opacity-70">Add funds to your wallet to begin.</p>
            </div>
          )}

          <div className="space-y-3">
            {history.map((tx, i) => {
              const info = getTypeInfo(tx.type);
              return (
                <motion.div
                  key={tx._id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-dark border border-white/5 rounded-[2rem] p-6 flex items-center gap-6 hover:border-primary-500/10 transition-all"
                >
                  <div className={`w-14 h-14 rounded-2xl ${info.bg} border ${info.border} flex items-center justify-center shrink-0`}>
                    <info.icon className={`w-6 h-6 ${info.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-black text-white italic uppercase tracking-tighter truncate">{info.label}</h4>
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest truncate mt-1">{tx.description}</p>
                    <p className="text-[10px] font-bold text-surface-600 uppercase tracking-widest mt-1">{formatTime(tx.createdAt)}</p>
                  </div>
                  <div className={`text-right shrink-0 ${info.sign === '+' ? 'text-emerald-400' : 'text-red-400'}`}>
                    <p className="text-2xl font-black italic tracking-tighter">
                      {info.sign}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
