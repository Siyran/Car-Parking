import { useState, useEffect } from 'react';
import { walletAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet as WalletIcon, Plus, ArrowDownLeft, ArrowUpRight, RefreshCw, IndianRupee, Zap, History, Shield, Smartphone, QrCode, CheckCircle2, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';

export default function Wallet() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [upiLink, setUpiLink] = useState('');
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

  const initiateUPI = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    const { data: keyData } = await walletAPI.getKeyId();
    const upiId = keyData.upiId || 'siyranabrar12345@okaxis';
    
    // Generate UPI URI
    const uri = `upi://pay?pa=${upiId}&pn=ParkFlow&am=${amount}&cu=INR&tn=ParkFlow_TopUp_${user?._id}`;
    setUpiLink(uri);

    // Detect if mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Direct redirect for mobile
      window.location.href = uri;
      // Slight delay then show manual confirmation
      setTimeout(() => setShowQR(true), 1500);
    } else {
      // Show QR for desktop
      setShowQR(true);
    }
  };

  const handleManualVerify = async () => {
    setProcessing(true);
    try {
      const { data } = await walletAPI.verifyManual({
        amount: topUpAmount,
        type: 'wallet_topup',
        description: 'Wallet top-up via Direct UPI (GPay)'
      });
      setBalance(data.balance);
      toast.success(data.message);
      setShowQR(false);
      setShowTopUp(false);
      setTopUpAmount('');
      loadData();
    } catch (err) {
      toast.error('Verification failed');
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

            {/* Security Badge */}
            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/5">
              <Shield className="w-4 h-4 text-emerald-500" />
              <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Direct UPI Transfer · Peer-to-Peer Secured</p>
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
                    <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Pay via UPI (Google Pay, PhonePe)</p>
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
                      placeholder="Enter amount"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-12 text-xl font-black text-white placeholder:text-surface-600 focus:outline-none focus:border-primary-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={initiateUPI}
                  disabled={!topUpAmount}
                  className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-black uppercase tracking-[0.2em] transition-all shadow-glow flex items-center justify-center gap-3"
                >
                  <Smartphone className="w-5 h-5" />
                  {topUpAmount ? `Pay ₹${parseFloat(topUpAmount).toLocaleString()} via UPI` : 'Enter Amount'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction History */}
        <div className="space-y-6">
          {/* ... (Existing transaction history code) ... */}
          <div className="flex items-center gap-4 px-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="flex items-center gap-3 text-[10px] font-black text-surface-400 uppercase tracking-[0.5em] opacity-80">
              <History className="w-3.5 h-3.5" /> Transaction Ledger
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

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

      {/* UPI QR Modal */}
      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="UPI Payment Terminal">
        <div className="text-center space-y-8 p-6">
          <div className="relative inline-block group">
            <div className="absolute -inset-4 bg-linear-to-r from-primary-500 to-accent-500 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative glass-dark p-6 rounded-[2.5rem] border border-white/10">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`}
                alt="Payment QR"
                className="w-64 h-64 mx-auto rounded-2xl border-4 border-white/5 shadow-2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-glow">
                  Scalable QR
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase underline decoration-primary-500/50 underline-offset-8 decoration-4">
                Scan & Pay ₹{parseFloat(topUpAmount).toLocaleString()}
              </h3>
              <p className="text-xs text-surface-400 font-medium max-w-xs mx-auto">
                Open any UPI app (GPay, PhonePe, Paytm) and scan this QR code to initiate the transfer.
              </p>
          </div>

          <div className="h-px bg-white/5 max-w-[200px] mx-auto" />

          <div className="space-y-4">
             <button
               onClick={handleManualVerify}
               disabled={processing}
               className="w-full py-6 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-black uppercase tracking-[0.2em] transition-all shadow-glow flex items-center justify-center gap-3 group"
             >
               {processing ? (
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
               ) : (
                 <>
                   <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                   I Have Paid
                 </>
               )}
             </button>
             <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest">
               Click only AFTER completing the transaction
             </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
