import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface-950">
      <Navbar />
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-28 p-6 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
