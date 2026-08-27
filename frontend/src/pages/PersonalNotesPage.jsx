import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  DollarSign,
  Info,
  CreditCard
} from 'lucide-react';
import { apiFetch, isViewerUser } from '../utils/api';
import { formatIDR } from '../utils/formatters';

export default function PersonalNotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formNetSalary, setFormNetSalary] = useState('');
  const [formTK0K0, setFormTK0K0] = useState('');
  const [formK1K2, setFormK1K2] = useState('');
  const [formError, setFormError] = useState('');

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/v1/personal-notes');
      if (res.success) {
        setNotes(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch personal notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormNetSalary('');
    setFormTK0K0('');
    setFormK1K2('');
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setIsEditing(true);
    setEditingId(item.id);
    setFormNetSalary(item.net_salary || '');
    setFormTK0K0(item.tk0_k0 !== null && item.tk0_k0 !== undefined ? item.tk0_k0 : '');
    setFormK1K2(item.k1_k2 !== null && item.k1_k2 !== undefined ? item.k1_k2 : '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    const netVal = parseFloat(formNetSalary);
    if (!netVal || netVal <= 0) {
      setFormError('Net Salary wajib diisi dan harus lebih dari 0.');
      return;
    }

    const payload = {
      net_salary: netVal,
      tk0_k0: formTK0K0 === '' || formTK0K0 === null ? null : parseFloat(formTK0K0),
      k1_k2: formK1K2 === '' || formK1K2 === null ? null : parseFloat(formK1K2),
    };

    try {
      if (isEditing) {
        if (!window.confirm('Apakah Anda yakin ingin memperbarui data acuan gaji ini?')) {
          return;
        }
        const res = await apiFetch(`/v1/personal-notes/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        if (res.success) {
          setModalOpen(false);
          fetchNotes();
        } else {
          setFormError(res.message || 'Gagal memperbarui data acuan gaji.');
        }
      } else {
        const res = await apiFetch('/v1/personal-notes', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (res.success) {
          setModalOpen(false);
          fetchNotes();
        } else {
          setFormError(res.message || 'Gagal menambahkan acuan gaji baru.');
        }
      }
    } catch (err) {
      setFormError(err.message || 'Terjadi kesalahan sistem.');
    }
  };

  const handleOpenDeleteModal = (id) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await apiFetch(`/v1/personal-notes/${deletingId}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setDeleteModalOpen(false);
        setDeletingId(null);
        fetchNotes();
      }
    } catch (err) {
      console.error('Failed to delete personal note:', err);
    }
  };

  // Search filtering
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter((item) => {
      const netStr = item.net_salary ? item.net_salary.toString() : '';
      const tk0Str = item.tk0_k0 ? item.tk0_k0.toString() : '';
      const k1Str = item.k1_k2 ? item.k1_k2.toString() : '';
      return netStr.includes(q) || tk0Str.includes(q) || k1Str.includes(q);
    });
  }, [notes, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Personal Notes / Salary Reference Master Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tabel acuan penetapan gaji bersih (Net Salary), komparasi TK0/K0, dan K1/K2
          </p>
        </div>

        {!isViewerUser() && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Record</span>
          </button>
        )}
      </div>

      {/* Top Bar Controls & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kisaran gaji bersih (Net Salary)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-bold">
          Total {filteredNotes.length} Acuan Nominal
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-extrabold border-b border-slate-200 dark:border-slate-800 text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Net Salary (Gaji Bersih)</th>
                <th className="px-6 py-3.5">TK0 / K0 (Gross Base)</th>
                <th className="px-6 py-3.5">K1 / K2 (Gross Base)</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-normal">
                    Loading reference notes...
                  </td>
                </tr>
              ) : filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-normal">
                    Belum ada data acuan gaji ditemukan.
                  </td>
                </tr>
              ) : (
                filteredNotes.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                      {formatIDR(item.net_salary)}
                    </td>
                    <td className="px-6 py-4">
                      {item.tk0_k0 ? (
                        formatIDR(item.tk0_k0)
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {item.k1_k2 ? (
                        formatIDR(item.k1_k2)
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {!isViewerUser() ? (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold transition-colors inline-flex items-center gap-1"
                            title="Edit Record"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(item.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold transition-colors inline-flex items-center gap-1"
                            title="Delete Record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px]">
                          👁️ Read-Only
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span>{isEditing ? 'Edit Acuan Gaji' : 'Tambah Acuan Gaji Baru'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Net Salary (IDR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formNetSalary}
                  onChange={(e) => setFormNetSalary(e.target.value)}
                  placeholder="Contoh: 4500000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  TK0 / K0 (IDR) <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formTK0K0}
                  onChange={(e) => setFormTK0K0(e.target.value)}
                  placeholder="Contoh: 5154639"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  K1 / K2 (IDR) <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formK1K2}
                  onChange={(e) => setFormK1K2(e.target.value)}
                  placeholder="Contoh: 5154639"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Tambah Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Konfirmasi Hapus</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus data acuan gaji ini?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-500/25"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function filteredTimelineNotesCount(count) {
  return `${count} Record`;
}
