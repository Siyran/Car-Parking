import { useState, useEffect } from 'react';
import { walletAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet as WalletIcon, Plus, ArrowDownLeft, ArrowUpRight, RefreshCw, IndianRupee, Zap, History, Shield, Smartphone, QrCode, CheckCircle2, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

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

  const loadData = async () => {
    setLoading(true);
    try {
      const [balRes, histRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getHistory()
      ]);
      setBalance(balRes?.data?.balance || 0);
      setHistory(histRes?.data?.transactions || []);
    } catch (err) {
      toast.error('Failed to load wallet data');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const initiateUPI = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    const { data: keyData } = await walletAPI.getKeyId();
    const upiId = keyData.upiId || 'siyranabrar12345@okaxis';
    const uri = `upi://pay?pa=${upiId}&pn=ParkFlow&am=${amount}&cu=INR&tn=ParkFlow_TopUp_${user?._id}`;
    setUpiLink(uri);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = uri;
      setTimeout(() => setShowQR(true), 1500);
    } else {
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

  const quickAmounts = [100, 200, 500, 1000];

  const getTypeInfo = (type) => {
    switch (type) {
      case 'wallet_topup': return { label: 'Top Up', icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-500/10', sign: '+' };
      case 'wallet_debit': return { label: 'Parking Payment', icon: ArrowUpRight, color: 'text-red-400', bg: 'bg-red-500/10', sign: '-' };
      case 'refund': return { label: 'Refund', icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/10', sign: '+' };
      default: return { label: type, icon: IndianRupee, color: 'text-surface-400', bg: 'bg-white/5', sign: '' };
    }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' at ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Wallet</h1>
          <p className="text-surface-500 text-sm mt-1">Manage your funds and transaction history</p>
        </div>
        <Button onClick={() => setShowTopUp(!showTopUp)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Funds
        </Button>
      </div>

      <Card className="p-8 relative overflow-hidden bg-primary-600/5 border-primary-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[100px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-widest mb-2">Available Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">₹{balance.toLocaleString('en-IN')}</span>
              <span className="text-sm font-medium text-surface-500 uppercase">INR</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-emerald-500/80">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-medium">Secured by UPI Direct</span>
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {showTopUp && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Quick Top-up</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickAmounts.map(amt => (
                  <button key={amt} onClick={() => setTopUpAmount(amt.toString())}
                    className={`py-3 rounded-xl text-sm font-medium transition-all border ${topUpAmount === amt.toString() ? 'bg-primary-600 border-primary-500 text-white' : 'bg-white/5 border-white/5 text-surface-400 hover:border-white/10'}`}>
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-500 font-medium">₹</span>
                <input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="Other amount"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-10 text-white focus:outline-none focus:border-primary-500/50" />
              </div>

              <Button onClick={initiateUPI} disabled={!topUpAmount} className="w-full py-4 text-sm font-semibold">
                Proceed to Pay
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-widest px-1">Recent Activity</h3>
        <div className="space-y-2">
          {loading && (
            <Card className="p-8 text-center text-surface-500">
              Loading wallet activity...
            </Card>
          )}
          {!loading && history.length === 0 && (
            <Card className="p-8 text-center text-surface-500">
              No wallet transactions yet.
            </Card>
          )}
          {history.map((tx) => {
            const info = getTypeInfo(tx.type);
            return (
              <Card key={tx._id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                <div className={`w-10 h-10 rounded-lg ${info.bg} flex items-center justify-center`}>
                  <info.icon className={`w-5 h-5 ${info.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white">{info.label}</h4>
                  <p className="text-[11px] text-surface-500 mt-0.5">{tx.description}</p>
                </div>
                <div className="text-right">
                  <p className={`text-base font-bold ${info.sign === '+' ? 'text-emerald-500' : 'text-white'}`}>
                    {info.sign}₹{tx.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-surface-600 mt-0.5">{formatTime(tx.createdAt)}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Modal isOpen={showQR} onClose={() => setShowQR(false)} title="UPI Payment">
        <div className="p-6 text-center space-y-6">
          <div className="bg-white p-4 rounded-2xl inline-block">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`} alt="QR" className="w-48 h-48" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Scan to Pay ₹{parseFloat(topUpAmount).toLocaleString()}</h3>
            <p className="text-sm text-surface-500 mt-2">Open GPay, PhonePe or any UPI app to scan</p>
          </div>
          <Button onClick={handleManualVerify} loading={processing} className="w-full">I have completed the payment</Button>
        </div>
      </Modal>
    </div>
  );
}
