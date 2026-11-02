import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { authAPI } from '../../api/auth';
import { useToast } from '../../components/Toast';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [userToDeactivate, setUserToDeactivate] = useState(null);
  const { addToast } = useToast();

  const fetchUsers = () => {
    setLoading(true);
    authAPI
      .getAdminUsers(search ? { search } : {})
      .then((data) => setUsers(data.results || data || []))
      .catch((err) => console.error('Failed to load users', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleToggleActive = async (targetUser) => {
    if (targetUser.is_active) {
      setUserToDeactivate(targetUser);
      return;
    }
    // Directly reactivate
    try {
      await authAPI.updateAdminUser(targetUser.id, { is_active: true });
      addToast(`Account for ${targetUser.email} reactivated.`, 'success');
      fetchUsers();
    } catch (err) {
      addToast('Failed to update user account status.', 'error');
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!userToDeactivate) return;
    try {
      await authAPI.updateAdminUser(userToDeactivate.id, { is_active: false });
      addToast(`Account for ${userToDeactivate.email} has been deactivated.`, 'success');
      setUserToDeactivate(null);
      fetchUsers();
    } catch (err) {
      addToast('Failed to deactivate user.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Customer Accounts Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review registered customer records, search, and toggle active status.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email, username, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Verified</th>
                <th className="py-3.5 px-4">Date Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    Loading customer accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30">
                    <td className="py-4 px-5">
                      <div className="font-bold text-white">
                        {u.first_name ? `${u.first_name} ${u.last_name}` : u.username}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.is_active
                            ? 'bg-emerald-950/60 text-emerald-300'
                            : 'bg-rose-950/60 text-rose-400'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {u.is_verified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`py-1 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                            u.is_active
                              ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/40'
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(userToDeactivate)}
        onClose={() => setUserToDeactivate(null)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate Customer Account?"
        message={`Are you sure you want to deactivate ${userToDeactivate?.email}? This customer will be prevented from logging in or downloading templates.`}
        confirmText="Yes, Deactivate Account"
        variant="danger"
      />
    </div>
  );
};

