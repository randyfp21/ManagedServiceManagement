import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  FolderGit2,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserX,
  UserMinus,
  Check,
  Filter,
  RotateCcw,
  Tag
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { formatIDR, formatDateID } from '../utils/formatters';

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering state
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active'); // 'active', 'resign', 'all'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingID, setDeletingID] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    employee_name: '',
    employee_role: '',
    status: 'Active',
    id_group: '',
    id_customer: '',
    start_contract: '',
    end_contract: '',
    sallary_gross: 0,
    tunjangan_penempatan: 0,
    tunjangan_keahlian: 0,
    koefisien: 1.4,
    revenue_nett: 0,
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, search, selectedGroup, selectedCustomer, selectedStatus]);

  const fetchOptions = async () => {
    try {
      const [resG, resC] = await Promise.all([
        apiFetch('/groups'),
        apiFetch('/customers'),
      ]);
      if (resG.success) setGroups(resG.data);
      if (resC.success) setCustomers(resC.data);
    } catch (err) {
      console.error('Failed to load group/customer options:', err);
    }
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      let query = `/employees?page=${page}&limit=10&status=${selectedStatus}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedGroup !== 'all') query += `&id_group=${selectedGroup}`;
      if (selectedCustomer !== 'all') query += `&id_customer=${selectedCustomer}`;

      const res = await apiFetch(query);
      if (res.success) {
        setEmployees(res.data.employees || []);
        setTotalPages(res.data.total_pages || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGroup('all');
    setSelectedCustomer('all');
    setSelectedStatus('active');
    setPage(1);
  };

  const isFiltered =
    search !== '' ||
    selectedGroup !== 'all' ||
    selectedCustomer !== 'all' ||
    selectedStatus !== 'active';

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      employee_name: '',
      employee_role: '',
      status: 'Active',
      id_group: groups.length > 0 ? groups[0].id_group : '',
      id_customer: '',
      start_contract: new Date().toISOString().split('T')[0],
      end_contract: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      sallary_gross: 10000000,
      tunjangan_penempatan: 1000000,
      tunjangan_keahlian: 1000000,
      koefisien: 1.4,
      revenue_nett: 18000000,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('T')) return dateStr.split('T')[0];
    if (dateStr.includes(' ')) return dateStr.split(' ')[0];
    return dateStr.substring(0, 10);
  };

  const handleOpenEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      employee_name: emp.employee_name,
      employee_role: emp.employee_role,
      status: emp.status || (emp.is_active === false ? 'Resign' : 'Active'),
      id_group: emp.id_group || '',
      id_customer: emp.id_customer || '',
      start_contract: formatDateForInput(emp.start_contract),
      end_contract: formatDateForInput(emp.end_contract),
      sallary_gross: emp.sallary_gross,
      tunjangan_penempatan: emp.tunjangan_penempatan,
      tunjangan_keahlian: emp.tunjangan_keahlian,
      koefisien: emp.koefisien || 1.4,
      revenue_nett: emp.revenue_nett,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Quick action: Toggle Status between Active and Resign
  const handleToggleStatus = async (emp) => {
    const nextStatus = emp.status === 'Resign' ? 'Active' : 'Resign';
    const actionText = nextStatus === 'Resign' ? 'menandai sebagai Resign' : 'mengaktifkan kembali';
    if (!window.confirm(`Apakah Anda yakin ingin ${actionText} karyawan "${emp.employee_name}"?`)) {
      return;
    }

    try {
      const payload = {
        employee_name: emp.employee_name,
        employee_role: emp.employee_role,
        status: nextStatus,
        is_active: nextStatus === 'Active',
        id_group: emp.id_group,
        id_customer: emp.id_customer,
        start_contract: emp.start_contract,
        end_contract: emp.end_contract,
        sallary_gross: emp.sallary_gross,
        tunjangan_penempatan: emp.tunjangan_penempatan,
        tunjangan_keahlian: emp.tunjangan_keahlian,
        koefisien: emp.koefisien,
        revenue_nett: emp.revenue_nett,
      };

      const res = await apiFetch(`/employees/${emp.id_employee}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccessMsg(`Status ${emp.employee_name} berhasil diubah menjadi ${nextStatus}`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchEmployees();
      }
    } catch (err) {
      alert('Gagal mengubah status: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const isPerm = formData.start_contract?.toLowerCase() === 'permanent' || formData.end_contract?.toLowerCase() === 'permanent';
      const payload = {
        employee_name: formData.employee_name,
        employee_role: formData.employee_role,
        status: formData.status,
        id_group: formData.id_group ? Number(formData.id_group) : null,
        id_customer: formData.id_customer ? Number(formData.id_customer) : null,
        start_contract: isPerm ? 'Permanent' : formData.start_contract,
        end_contract: isPerm ? 'Permanent' : formData.end_contract,
        is_permanent: isPerm,
        sallary_gross: Number(formData.sallary_gross),
        tunjangan_penempatan: Number(formData.tunjangan_penempatan),
        tunjangan_keahlian: Number(formData.tunjangan_keahlian),
        koefisien: Number(formData.koefisien),
        revenue_nett: Number(formData.revenue_nett),
      };

      if (editingEmployee) {
        if (!window.confirm(`Apakah Anda yakin ingin memperbarui data karyawan "${formData.employee_name}"?`)) {
          setSubmitting(false);
          return;
        }
        await apiFetch(`/employees/${editingEmployee.id_employee}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccessMsg(`Data karyawan ${formData.employee_name} berhasil diperbarui!`);
      } else {
        await apiFetch('/employees', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccessMsg(`Karyawan baru ${formData.employee_name} berhasil ditambahkan!`);
      }

      setTimeout(() => setSuccessMsg(''), 4000);
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setFormError(err.message || 'Failed to save employee data');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingID) return;
    try {
      await apiFetch(`/employees/${deletingID}`, { method: 'DELETE' });
      setIsDeleteModalOpen(false);
      setDeletingID(null);
      setSuccessMsg('Karyawan berhasil dihapus dari database.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Failed to delete employee');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Employee Master Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Kelola data alokasi karyawan, status keaktifan (Active / Resign), gaji gross, dan penempatan customer
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Add Employee
        </button>
      </div>

      {/* Table Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 self-start">
            <button
              onClick={() => {
                setSelectedStatus('active');
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === 'active'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Aktif</span>
            </button>

            <button
              onClick={() => {
                setSelectedStatus('resign');
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === 'resign'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserMinus className="h-3.5 w-3.5" />
              <span>Resign</span>
            </button>

            <button
              onClick={() => {
                setSelectedStatus('all');
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedStatus === 'all'
                  ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Semua Status</span>
            </button>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari nama/role..."
                className="w-full pl-9 pr-7 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Group Filter */}
            <div>
              <select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">📁 Semua Group</option>
                {groups.map((g) => (
                  <option key={g.id_group} value={g.id_group}>
                    {g.brand_name || g.group_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Filter */}
            <div>
              <select
                value={selectedCustomer}
                onChange={(e) => {
                  setSelectedCustomer(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">🏢 Semua Customer</option>
                <option value="bench">⚠️ On Bench (Idle)</option>
                {customers.map((c) => (
                  <option key={c.id_customer} value={c.id_customer}>
                    {c.customer_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filter Button */}
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              title="Reset Semua Filter"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Active Filter Chips */}
        {isFiltered && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Filter Aktif:
            </span>

            {selectedStatus !== 'active' && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold flex items-center gap-1">
                Status: {selectedStatus === 'resign' ? 'Resign' : 'Semua'}
                <X onClick={() => setSelectedStatus('active')} className="h-3 w-3 cursor-pointer hover:text-blue-900" />
              </span>
            )}

            {search && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold flex items-center gap-1">
                Search: "{search}"
                <X onClick={() => setSearch('')} className="h-3 w-3 cursor-pointer hover:text-blue-900" />
              </span>
            )}

            {selectedGroup !== 'all' && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold flex items-center gap-1">
                Group: {groups.find((g) => g.id_group.toString() === selectedGroup)?.brand_name || groups.find((g) => g.id_group.toString() === selectedGroup)?.group_name || selectedGroup}
                <X onClick={() => setSelectedGroup('all')} className="h-3 w-3 cursor-pointer hover:text-blue-900" />
              </span>
            )}

            {selectedCustomer !== 'all' && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold flex items-center gap-1">
                Customer: {selectedCustomer === 'bench' ? 'On Bench' : customers.find((c) => c.id_customer.toString() === selectedCustomer)?.customer_name || selectedCustomer}
                <X onClick={() => setSelectedCustomer('all')} className="h-3 w-3 cursor-pointer hover:text-blue-900" />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Employees Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Nama & Role</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5">Group</th>
                <th className="px-4 py-3.5">Customer Assignment</th>
                <th className="px-4 py-3.5">Periode Kontrak</th>
                <th className="px-4 py-3.5">Gaji Gross</th>
                <th className="px-2 py-3.5 text-center">Koef</th>
                <th className="px-4 py-3.5">Nett Revenue</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-slate-400">
                    Memuat data karyawan...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-5 py-12 text-center text-slate-400 space-y-1">
                    <p className="font-bold text-slate-700 dark:text-slate-300">
                      {selectedStatus === 'resign'
                        ? 'Tidak ada karyawan yang berstatus Resign'
                        : 'Tidak ada data karyawan ditemukan'}
                    </p>
                    <p className="text-[11px]">Coba ganti filter atau status pencarian.</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const isResigned = emp.status === 'Resign' || emp.is_active === false;
                  return (
                    <tr
                      key={emp.id_employee}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isResigned ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {emp.employee_name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {emp.employee_role}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {isResigned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <UserMinus className="h-3 w-3" />
                            Resign
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <UserCheck className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                        {emp.group?.brand_name || emp.group?.group_name || '-'}
                      </td>

                      <td className="px-4 py-3.5">
                        {emp.customer ? (
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {emp.customer.customer_name}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                            ⚠️ On Bench (Idle)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {emp.start_contract?.toLowerCase() === 'permanent' || emp.end_contract?.toLowerCase() === 'permanent' ? (
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-extrabold border border-blue-200 dark:border-blue-800 text-[10px]">
                            🛡️ Permanent
                          </span>
                        ) : (
                          `${formatDateID(emp.start_contract)} - ${formatDateID(emp.end_contract)}`
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-medium whitespace-nowrap">
                        {formatIDR(emp.sallary_gross, false)}
                      </td>

                      <td className="px-2 py-3.5 text-center font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px]">
                          {emp.koefisien || 1.4}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {formatIDR(emp.revenue_nett, false)}
                      </td>

                      <td className="px-5 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Toggle Active / Resign Quick Button */}
                          <button
                            onClick={() => handleToggleStatus(emp)}
                            className={`p-1.5 rounded-lg transition-colors font-bold ${
                              isResigned
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                                : 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900'
                            }`}
                            title={isResigned ? 'Aktifkan Kembali Karyawan Ini' : 'Tandai sebagai Resign'}
                          >
                            {isResigned ? <UserCheck className="h-3.5 w-3.5" /> : <UserMinus className="h-3.5 w-3.5" />}
                          </button>

                          <button
                            onClick={() => handleOpenEdit(emp)}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                            title="Edit Data Karyawan"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setDeletingID(emp.id_employee);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors"
                            title="Hapus Karyawan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan halaman <strong className="text-slate-800 dark:text-slate-200">{page}</strong> dari{' '}
            <strong className="text-slate-800 dark:text-slate-200">{totalPages}</strong> (Total {totalItems} Data)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add / Edit Employee */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Nama Karyawan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employee_name}
                    onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Role / Jabatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employee_role}
                    onChange={(e) => setFormData({ ...formData, employee_role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Status Select Field */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Status Keaktifan Karyawan
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">🟢 Active (Aktif Bekerja)</option>
                  <option value="Resign">🔴 Resign (Telah Resign / Non-aktif)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Group (Tim)
                  </label>
                  <select
                    value={formData.id_group}
                    onChange={(e) => setFormData({ ...formData, id_group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Group --</option>
                    {groups.map((g) => (
                      <option key={g.id_group} value={g.id_group}>
                        {g.brand_name || g.group_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Customer Bank (Alokasi)
                  </label>
                  <select
                    value={formData.id_customer}
                    onChange={(e) => setFormData({ ...formData, id_customer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">⚠️ On Bench (Unassigned / Idle)</option>
                    {customers.map((c) => (
                      <option key={c.id_customer} value={c.id_customer}>
                        {c.customer_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-800 py-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Periode Kontrak Karyawan
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.start_contract?.toLowerCase() === 'permanent' || formData.end_contract?.toLowerCase() === 'permanent'}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            start_contract: 'Permanent',
                            end_contract: 'Permanent',
                          });
                        } else {
                          setFormData({
                            ...formData,
                            start_contract: '',
                            end_contract: '',
                          });
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span>Karyawan Tetap (Permanent Employee)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Start Contract
                    </label>
                    {formData.start_contract?.toLowerCase() === 'permanent' ? (
                      <input
                        type="text"
                        readOnly
                        value="Permanent"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-extrabold cursor-not-allowed"
                      />
                    ) : (
                      <input
                        type="date"
                        required={formData.start_contract?.toLowerCase() !== 'permanent'}
                        value={formData.start_contract}
                        onChange={(e) => setFormData({ ...formData, start_contract: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      End Contract
                    </label>
                    {formData.end_contract?.toLowerCase() === 'permanent' ? (
                      <input
                        type="text"
                        readOnly
                        value="Permanent"
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-extrabold cursor-not-allowed"
                      />
                    ) : (
                      <input
                        type="date"
                        required={formData.end_contract?.toLowerCase() !== 'permanent'}
                        value={formData.end_contract}
                        onChange={(e) => setFormData({ ...formData, end_contract: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Gross Salary (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.sallary_gross}
                    onChange={(e) => setFormData({ ...formData, sallary_gross: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Tunj. Penempatan
                  </label>
                  <input
                    type="number"
                    value={formData.tunjangan_penempatan}
                    onChange={(e) => setFormData({ ...formData, tunjangan_penempatan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Tunj. Keahlian
                  </label>
                  <input
                    type="number"
                    value={formData.tunjangan_keahlian}
                    onChange={(e) => setFormData({ ...formData, tunjangan_keahlian: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Koefisien
                  </label>
                  <select
                    value={formData.koefisien}
                    onChange={(e) => setFormData({ ...formData, koefisien: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1.3}>1.3</option>
                    <option value={1.4}>1.4</option>
                    <option value={1.5}>1.5</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Revenue Nett (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.revenue_nett}
                    onChange={(e) => setFormData({ ...formData, revenue_nett: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-600 dark:text-blue-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitting ? 'Menyimpan...' : editingEmployee ? 'Perbarui Data' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Hapus Data Karyawan?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tindakan ini akan menghapus data karyawan dari database secara permanen.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
