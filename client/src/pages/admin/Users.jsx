import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Search, User, UserX, UserCheck } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [roleFilter]);

  const load = async () => {
    try {
      const { data } = await adminAPI.getUsers({ role: roleFilter || undefined, search: search || undefined });
      setUsers(data.users);
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const toggleStatus = async (id) => {
    try {
      await adminAPI.toggleUser(id);
      toast.success('Updated');
      load();
    } catch { toast.error('Failed'); }
  };

  const roleVariant = { driver: 'primary', owner: 'success', admin: 'warning' };

  return (
    <div className="pt-20 min-h-screen bg-surface-50">
      <div className="max-w-5xl mx-auto px-4 pb-12">
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Users</h1>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input icon={Search} placeholder="Search users..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()} />
          </div>
          <div className="flex gap-2">
            {['', 'driver', 'owner', 'admin'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${roleFilter === r ? 'bg-primary-100 text-primary-700' : 'text-surface-500 hover:bg-surface-100'}`}>
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50">
                <tr>
                  {['Name', 'Email', 'Phone', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="border-t border-surface-50 hover:bg-surface-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">{u.name?.[0]}</div>
                        <span className="font-medium text-sm text-surface-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-500">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-surface-500">{u.phone || '—'}</td>
                    <td className="px-4 py-3"><Badge variant={roleVariant[u.role]}>{u.role}</Badge></td>
                    <td className="px-4 py-3 text-sm text-surface-400">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3"><Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(u._id)}
                        className={`p-1.5 rounded-lg transition-all ${u.isActive ? 'text-danger-500 hover:bg-danger-50' : 'text-success-500 hover:bg-success-50'}`}>
                        {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
