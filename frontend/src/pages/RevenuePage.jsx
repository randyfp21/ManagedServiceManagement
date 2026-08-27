import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  ShieldAlert,
  Building2,
  Users,
  Search,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  Edit2,
  X,
  Check,
  AlertCircle,
  Calculator,
  FolderGit2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Layers,
  ChevronRight
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { formatIDR, getMarginBadge, formatDateID } from '../utils/formatters';

export default function RevenuePage() {
  const [analysis, setAnalysis] = useState(null);
  const [customersList, setCustomersList] = useState([]);
  const [groupsList, setGroupsList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'table'
  const [loading, setLoading] = useState(true);
  const [expandedCustomers, setExpandedCustomers] = useState({});

  // Edit Modal & Notification State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    employee_name: '',
    employee_role: '',
    id_group: '',
    id_customer: '', // '' for On Bench
    start_contract: '',
    end_contract: '',
    sallary_gross: 0,
    tunjangan_penempatan: 0,
    tunjangan_keahlian: 0,
    koefisien: 1.4,
    revenue_nett: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    try {
      const res = await apiFetch('/customers');
      if (res.success) setCustomersList(res.data);
    } catch (err) {
      console.error('Failed to load customers list:', err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await apiFetch('/groups');
      if (res.success) setGroupsList(res.data);
    } catch (err) {
      console.error('Failed to load groups list:', err);
    }
  };

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const query = selectedCustomer !== 'all' ? `?id_customer=${selectedCustomer}` : '';
      const res = await apiFetch(`/revenue/analysis${query}`);
      if (res.success) {
        setAnalysis(res.data);
        const initialExpanded = {};
        res.data.items?.forEach((item) => {
          initialExpanded[item.customer_name] = true;
        });
        setExpandedCustomers(initialExpanded);
      }
    } catch (err) {
      console.error('Failed to load revenue analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (custName) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [custName]: !prev[custName],
    }));
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('T')) return dateStr.split('T')[0];
    if (dateStr.includes(' ')) return dateStr.split(' ')[0];
    return dateStr.substring(0, 10);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const matchedCust = customersList.find((c) => c.customer_name === item.customer_name);
    const matchedGroup = groupsList.find((g) => g.group_name === item.group_name);

    setFormData({
      employee_name: item.employee_name || '',
      employee_role: item.employee_role || '',
      id_group: matchedGroup ? matchedGroup.id_group : '',
      id_customer: matchedCust ? matchedCust.id_customer : '',
      start_contract: formatDateForInput(item.start_contract),
      end_contract: formatDateForInput(item.end_contract),
      sallary_gross: item.sallary_gross || 0,
      tunjangan_penempatan: item.tunjangan_penempatan || 0,
      tunjangan_keahlian: item.tunjangan_keahlian || 0,
      koefisien: item.koefisien || 1.4,
      revenue_nett: item.revenue_nett || 0,
    });

    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
    setErrorMsg('');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.employee_name.trim() || !formData.employee_role.trim()) {
      setErrorMsg('Nama Karyawan dan Role wajib diisi');
      return;
    }

    setSubmitting(true);

    const isPerm = formData.start_contract?.toLowerCase() === 'permanent' || formData.end_contract?.toLowerCase() === 'permanent';
    const payload = {
      employee_name: formData.employee_name,
      employee_role: formData.employee_role,
      id_group: formData.id_group !== '' ? Number(formData.id_group) : null,
      id_customer: formData.id_customer !== '' ? Number(formData.id_customer) : null,
      start_contract: isPerm ? 'Permanent' : formData.start_contract,
      end_contract: isPerm ? 'Permanent' : formData.end_contract,
      is_permanent: isPerm,
      sallary_gross: Number(formData.sallary_gross),
      tunjangan_penempatan: Number(formData.tunjangan_penempatan),
      tunjangan_keahlian: Number(formData.tunjangan_keahlian),
      koefisien: Number(formData.koefisien),
      revenue_nett: Number(formData.revenue_nett),
    };

    try {
      if (!window.confirm(`Apakah Anda yakin ingin memperbarui data finansial & alokasi untuk "${formData.employee_name}"?`)) {
        setSubmitting(false);
        return;
      }
      const res = await apiFetch(`/employees/${editingItem.id_employee}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccessMsg(`Data finansial & alokasi ${formData.employee_name} berhasil diperbarui di database!`);
        setTimeout(() => setSuccessMsg(''), 5000);
        handleCloseModal();
        fetchRevenueData();
      } else {
        setErrorMsg(res.message || 'Gagal memperbarui data karyawan');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const livePreview = useMemo(() => {
    const gross = Number(formData.sallary_gross) || 0;
    const penempatan = Number(formData.tunjangan_penempatan) || 0;
    const keahlian = Number(formData.tunjangan_keahlian) || 0;
    const koef = Number(formData.koefisien) || 1.4;
    const revNett = Number(formData.revenue_nett) || 0;

    const directCost = gross + penempatan + keahlian;
    const cogs = gross * koef;
    const marginNominal = revNett - cogs;
    const marginPercent = revNett > 0 ? (marginNominal / revNett) * 100 : 0;

    let status = 'Mid';
    if (marginPercent <= 12) status = 'Low';
    else if (marginPercent <= 28) status = 'Mid';
    else status = 'High';

    return {
      directCost,
      cogs,
      marginNominal,
      marginPercent,
      status,
    };
  }, [formData]);

  const filteredItems = useMemo(() => {
    if (!analysis?.items) return [];

    const activeOnly = analysis.items.filter(
      (item) => item.status !== 'Resign' && item.is_active !== false
    );

    if (!searchQuery.trim()) return activeOnly;

    const q = searchQuery.toLowerCase();
    return activeOnly.filter(
      (item) =>
        item.employee_name.toLowerCase().includes(q) ||
        item.employee_role.toLowerCase().includes(q) ||
        item.group_name.toLowerCase().includes(q) ||
        item.customer_name.toLowerCase().includes(q)
    );
  }, [analysis, searchQuery]);

  const groupedByCustomer = useMemo(() => {
    const groups = {};

    filteredItems.forEach((item) => {
      const custName = item.customer_name || 'On Bench';
      if (!groups[custName]) {
        groups[custName] = {
          customerName: custName,
          isBench: custName === 'On Bench',
          items: [],
          totalGrossSalary: 0,
          totalPenempatan: 0,
          totalKeahlian: 0,
          totalDirectCost: 0,
          totalCOGS: 0,
          totalRevenue: 0,
          marginNominal: 0,
        };
      }

      groups[custName].items.push(item);
      groups[custName].totalGrossSalary += item.sallary_gross;
      groups[custName].totalPenempatan += item.tunjangan_penempatan;
      groups[custName].totalKeahlian += item.tunjangan_keahlian;
      groups[custName].totalDirectCost += item.total_direct_cost;
      groups[custName].totalCOGS += item.cogs;
      groups[custName].totalRevenue += item.revenue_nett;
    });

    Object.values(groups).forEach((g) => {
      g.marginNominal = g.totalRevenue - g.totalCOGS;
      g.marginPercent = g.totalRevenue > 0 ? (g.marginNominal / g.totalRevenue) * 100 : 0;
    });

    return Object.values(groups).sort((a, b) => {
      if (a.isBench) return 1;
      if (b.isBench) return -1;
      return a.customerName.localeCompare(b.customerName);
    });
  }, [filteredItems]);

  const filteredSummary = useMemo(() => {
    let rev = 0;
    let direct = 0;
    let cogs = 0;
    let gross = 0;
    let penempatan = 0;
    let keahlian = 0;
    let countActive = 0;
    let countBench = 0;

    filteredItems.forEach((item) => {
      rev += item.revenue_nett;
      direct += item.total_direct_cost;
      cogs += item.cogs;
      gross += item.sallary_gross;
      penempatan += item.tunjangan_penempatan;
      keahlian += item.tunjangan_keahlian;
      if (item.customer_name === 'On Bench') {
        countBench++;
      } else {
        countActive++;
      }
    });

    const marginNominal = rev - cogs;
    const marginPct = rev > 0 ? (marginNominal / rev) * 100 : 0;

    return {
      totalRevenue: rev,
      totalDirectCost: direct,
      totalCOGS: cogs,
      totalGrossSalary: gross,
      totalPenempatan: penempatan,
      totalKeahlian: keahlian,
      marginNominal,
      marginPct,
      countActive,
      countBench,
      totalEmployees: filteredItems.length,
    };
  }, [filteredItems]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modern Hero Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-2xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Financial Profitability Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Revenue & Profitability per Customer
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Kalkulasi margin profitabilitas, alokasi biaya langsung (COGS), dan manajemen finansial karyawan per nasabah perbankan.
            </p>
          </div>

          {/* View Mode Switcher Toggle */}
          <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-900/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 self-start lg:self-auto">
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grouped'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Per Customer Cards</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              <span>Tabel Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Customer Filter Dropdown */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Filter className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Filter Customer:
          </span>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full sm:w-72 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          >
            <option value="all">🌐 Semua Customer & Idle (All)</option>
            <option value="bench">⚠️ On Bench (Idle Resources Only)</option>
            <optgroup label="Bank Customers">
              {customersList.map((cust) => (
                <option key={cust.id_customer} value={cust.id_customer}>
                  🏢 {cust.customer_name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama karyawan, role, atau bank..."
            className="w-full pl-10 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Revenue Nett</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 truncate tracking-tight">
            {formatIDR(filteredSummary.totalRevenue)}
          </p>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">Dari {filteredSummary.totalEmployees} Active Resource</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Direct Cost</span>
            <div className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
              <Calculator className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2 truncate tracking-tight">
            {formatIDR(filteredSummary.totalDirectCost)}
          </p>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">Gaji Gross + Tunjangan</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total COGS</span>
            <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2 truncate tracking-tight">
            {formatIDR(filteredSummary.totalCOGS)}
          </p>
          <span className="text-[11px] font-semibold text-slate-400 mt-1 block">Base (Gross x Koefisien)</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Net Profit Margin</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className={`text-xl font-extrabold mt-2 truncate tracking-tight ${filteredSummary.marginNominal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatIDR(filteredSummary.marginNominal)}
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md mt-1 border border-emerald-200/60 dark:border-emerald-800/60">
            <ArrowUpRight className="h-3 w-3" />
            {filteredSummary.marginPct.toFixed(1)}% Profitability
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Resource Distribution</span>
            <div className="h-8 w-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs font-bold gap-2">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <UserCheck className="h-3.5 w-3.5" />
              {filteredSummary.countActive} Active
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
              <UserX className="h-3.5 w-3.5" />
              {filteredSummary.countBench} Idle
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-xs text-slate-400 font-bold">Mengkalkulasi profitabilitas per customer bank...</p>
        </div>
      ) : groupedByCustomer.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 space-y-2 shadow-sm">
          <ShieldAlert className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="font-bold text-slate-700 dark:text-slate-300">Tidak ada data finansial ditemukan</p>
          <p className="text-xs">Coba ganti filter customer atau ubah kata kunci pencarian.</p>
        </div>
      ) : viewMode === 'grouped' ? (
        /* View Mode 1: Grouped Cards per Customer */
        <div className="space-y-6">
          {groupedByCustomer.map((group) => {
            const isExpanded = expandedCustomers[group.customerName] !== false;

            return (
              <div
                key={group.customerName}
                className={`rounded-3xl border transition-all overflow-hidden ${
                  group.isBench
                    ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-300/80 dark:border-amber-800/60 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                {/* Group Card Header */}
                <div
                  onClick={() => toggleExpand(group.customerName)}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                    group.isBench
                      ? 'bg-amber-100/60 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/50'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        group.isBench
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                          : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      }`}
                    >
                      {group.isBench ? <UserX className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                          {group.customerName}
                        </h3>
                        {group.isBench ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                            ⚠️ Idle Resources (On Bench)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Enterprise Client
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {group.items.length} Karyawan Terdaftar
                      </p>
                    </div>
                  </div>

                  {/* Summary Metrics for this Customer */}
                  <div className="flex items-center gap-5 flex-wrap md:flex-nowrap">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Revenue Nett
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400">
                        {formatIDR(group.totalRevenue)}
                      </span>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total COGS
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300">
                        {formatIDR(group.totalCOGS)}
                      </span>
                    </div>

                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Net Margin
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs sm:text-sm font-extrabold ${
                            group.marginNominal >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {formatIDR(group.marginNominal)}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {group.marginPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <button className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Group Employee Table List */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800 text-[10px]">
                        <tr>
                          <th className="px-4 py-3">Nama Karyawan</th>
                          <th className="px-3 py-3">Role</th>
                          <th className="px-3 py-3">Group</th>
                          <th className="px-3 py-3">Periode Kontrak</th>
                          <th className="px-3 py-3">Gaji Gross</th>
                          <th className="px-3 py-3">Tunj. Penempatan</th>
                          <th className="px-3 py-3">Tunj. Keahlian</th>
                          <th className="px-3 py-3 font-extrabold text-slate-800 dark:text-slate-200">Direct Cost</th>
                          <th className="px-2 py-3 text-center">Koef</th>
                          <th className="px-3 py-3 font-extrabold text-slate-800 dark:text-slate-200">COGS</th>
                          <th className="px-3 py-3 font-extrabold text-blue-600 dark:text-blue-400">Revenue Nett</th>
                          <th className="px-3 py-3 font-extrabold text-emerald-600 dark:text-emerald-400">Margin (Rp)</th>
                          <th className="px-3 py-3 font-extrabold text-center text-emerald-600 dark:text-emerald-400">Margin (%)</th>
                          <th className="px-3 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                        {group.items.map((emp) => {
                          const badge = getMarginBadge(emp.margin_status);
                          return (
                            <tr
                              key={emp.id_employee}
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                                {emp.employee_name}
                              </td>
                              <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300">
                                {emp.employee_role}
                              </td>
                              <td className="px-3 py-3.5 text-slate-500 font-semibold">
                                {emp.group_name}
                              </td>
                              <td className="px-3 py-3.5 whitespace-nowrap text-[11px] text-slate-500">
                                {emp.start_contract?.toLowerCase() === 'permanent' || emp.end_contract?.toLowerCase() === 'permanent' ? (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-extrabold border border-blue-200 dark:border-blue-800 text-[10px]">
                                    🛡️ Permanent
                                  </span>
                                ) : (
                                  `${formatDateID(emp.start_contract)} - ${formatDateID(emp.end_contract)}`
                                )}
                              </td>
                              <td className="px-3 py-3.5 whitespace-nowrap font-medium">
                                {formatIDR(emp.sallary_gross, false)}
                              </td>
                              <td className="px-3 py-3.5 whitespace-nowrap text-slate-500">
                                {formatIDR(emp.tunjangan_penempatan, false)}
                              </td>
                              <td className="px-3 py-3.5 whitespace-nowrap text-slate-500">
                                {formatIDR(emp.tunjangan_keahlian, false)}
                              </td>
                              <td className="px-3 py-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-slate-100 bg-slate-50/80 dark:bg-slate-800/30">
                                {formatIDR(emp.total_direct_cost, false)}
                              </td>
                              <td className="px-2 py-3.5 text-center font-bold">
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px]">
                                  {emp.koefisien}
                                </span>
                              </td>
                              <td className="px-3 py-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-slate-100 bg-slate-50/80 dark:bg-slate-800/30">
                                {formatIDR(emp.cogs, false)}
                              </td>
                              <td className="px-3 py-3.5 whitespace-nowrap font-bold text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/20">
                                {formatIDR(emp.revenue_nett, false)}
                              </td>
                              <td
                                className={`px-3 py-3.5 whitespace-nowrap font-bold ${
                                  emp.margin_nominal >= 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {formatIDR(emp.margin_nominal, false)}
                              </td>
                              <td className="px-3 py-3.5 text-center font-extrabold text-slate-900 dark:text-slate-100">
                                {emp.margin_percent.toFixed(1)}%
                              </td>
                              <td className="px-3 py-3.5 text-center">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${badge.badgeColor}`}></span>
                                  {badge.text}
                                </span>
                              </td>
                              <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                <button
                                  onClick={() => handleOpenEditModal(emp)}
                                  className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all font-bold text-[11px] flex items-center gap-1.5 mx-auto border border-blue-200 dark:border-blue-800"
                                  title="Edit Data Finansial & Alokasi"
                                >
                                  <Edit2 className="h-3 w-3" />
                                  <span>Edit</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>

                      {/* Summary Row for Grouped View */}
                      <tfoot className="bg-slate-100/80 dark:bg-slate-800/80 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-xs">
                        <tr>
                          <td colSpan="4" className="px-4 py-3 text-slate-900 dark:text-white uppercase font-bold tracking-wider text-[10px]">
                            Subtotal {group.customerName} ({group.items.length} Karyawan)
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap font-extrabold">{formatIDR(group.totalGrossSalary, false)}</td>
                          <td className="px-3 py-3 whitespace-nowrap font-extrabold">{formatIDR(group.totalPenempatan, false)}</td>
                          <td className="px-3 py-3 whitespace-nowrap font-extrabold">{formatIDR(group.totalKeahlian, false)}</td>
                          <td className="px-3 py-3 whitespace-nowrap font-extrabold text-slate-900 dark:text-slate-100">{formatIDR(group.totalDirectCost, false)}</td>
                          <td className="px-2 py-3 text-center">-</td>
                          <td className="px-3 py-3 whitespace-nowrap font-extrabold text-slate-900 dark:text-slate-100">{formatIDR(group.totalCOGS, false)}</td>
                          <td className="px-3 py-3 whitespace-nowrap font-extrabold text-blue-600 dark:text-blue-400">{formatIDR(group.totalRevenue, false)}</td>
                          <td className="px-3 py-3 whitespace-nowrap font-extrabold text-emerald-600 dark:text-emerald-400">{formatIDR(group.marginNominal, false)}</td>
                          <td className="px-3 py-3 text-center font-extrabold text-emerald-600 dark:text-emerald-400">{group.marginPercent.toFixed(1)}%</td>
                          <td className="px-3 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getMarginBadge(group.marginPercent <= 12 ? 'Low' : group.marginPercent <= 28 ? 'Mid' : 'High').bg}`}>
                              {group.marginPercent <= 12 ? 'Low' : group.marginPercent <= 28 ? 'Mid' : 'High'}
                            </span>
                          </td>
                          <td className="px-4 py-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* View Mode 2: Full Matrix Table */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800 text-[10px]">
                <tr>
                  <th className="px-4 py-3.5 min-w-[150px]">Karyawan</th>
                  <th className="px-3 py-3.5">Group</th>
                  <th className="px-3 py-3.5">Role</th>
                  <th className="px-3 py-3.5">Customer Bank</th>
                  <th className="px-3 py-3.5">Periode Kontrak</th>
                  <th className="px-3 py-3.5">Gaji Gross</th>
                  <th className="px-3 py-3.5">Tunj. Penempatan</th>
                  <th className="px-3 py-3.5">Tunj. Keahlian</th>
                  <th className="px-3 py-3.5 font-extrabold text-slate-800 dark:text-slate-200">Total Direct Cost</th>
                  <th className="px-2 py-3.5 text-center">Koef</th>
                  <th className="px-3 py-3.5 font-extrabold text-slate-800 dark:text-slate-200">COGS</th>
                  <th className="px-3 py-3.5 font-extrabold text-blue-600 dark:text-blue-400">Revenue Nett</th>
                  <th className="px-3 py-3.5 font-extrabold text-emerald-600 dark:text-emerald-400">Margin (Rp)</th>
                  <th className="px-3 py-3.5 text-center font-extrabold text-emerald-600 dark:text-emerald-400">Margin (%)</th>
                  <th className="px-3 py-3.5 text-center">Status Margin</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredItems.map((item) => {
                  const badge = getMarginBadge(item.margin_status);
                  const isBench = item.customer_name === 'On Bench';
                  return (
                    <tr
                      key={item.id_employee}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isBench ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {item.employee_name}
                      </td>
                      <td className="px-3 py-3.5 text-slate-500 font-semibold">
                        {item.group_name}
                      </td>
                      <td className="px-3 py-3.5 text-slate-600 dark:text-slate-300">
                        {item.employee_role}
                      </td>
                      <td className="px-3 py-3.5 font-medium">
                        {isBench ? (
                          <span className="px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                            ⚠️ On Bench (Idle)
                          </span>
                        ) : (
                          item.customer_name
                        )}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-[11px] text-slate-500">
                        {formatDateID(item.start_contract)} - {formatDateID(item.end_contract)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap font-medium">
                        {formatIDR(item.sallary_gross, false)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-slate-500">
                        {formatIDR(item.tunjangan_penempatan, false)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-slate-500">
                        {formatIDR(item.tunjangan_keahlian, false)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40">
                        {formatIDR(item.total_direct_cost, false)}
                      </td>
                      <td className="px-2 py-3.5 text-center font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[11px]">
                          {item.koefisien}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40">
                        {formatIDR(item.cogs, false)}
                      </td>
                      <td className="px-3 py-3.5 whitespace-nowrap font-bold text-blue-600 dark:text-blue-400 bg-blue-50/20 dark:bg-blue-950/20">
                        {formatIDR(item.revenue_nett, false)}
                      </td>
                      <td
                        className={`px-3 py-3.5 whitespace-nowrap font-bold ${
                          item.margin_nominal >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {formatIDR(item.margin_nominal, false)}
                      </td>
                      <td className="px-3 py-3.5 text-center font-extrabold text-slate-900 dark:text-slate-100">
                        {item.margin_percent.toFixed(1)}%
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.badgeColor}`}></span>
                          {badge.text}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-all font-bold text-[11px] flex items-center gap-1.5 mx-auto border border-blue-200 dark:border-blue-800"
                          title="Edit Data Finansial & Alokasi"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Grand Total Summary Row for Table View */}
              <tfoot className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-slate-100 border-t-2 border-slate-300 dark:border-slate-700 text-xs">
                <tr>
                  <td colSpan="5" className="px-4 py-3.5 text-slate-900 dark:text-white uppercase font-bold tracking-wider text-[11px]">
                    Grand Total Summary ({filteredItems.length} Karyawan)
                  </td>
                  <td className="px-3 py-3.5 whitespace-nowrap">{formatIDR(filteredSummary.totalGrossSalary, false)}</td>
                  <td className="px-3 py-3.5 whitespace-nowrap">{formatIDR(filteredSummary.totalPenempatan, false)}</td>
                  <td className="px-3 py-3.5 whitespace-nowrap">{formatIDR(filteredSummary.totalKeahlian, false)}</td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-slate-900 dark:text-slate-100">{formatIDR(filteredSummary.totalDirectCost, false)}</td>
                  <td className="px-2 py-3.5 text-center">-</td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-slate-900 dark:text-slate-100">{formatIDR(filteredSummary.totalCOGS, false)}</td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-blue-600 dark:text-blue-400">{formatIDR(filteredSummary.totalRevenue, false)}</td>
                  <td className="px-3 py-3.5 whitespace-nowrap text-emerald-600 dark:text-emerald-400">{formatIDR(filteredSummary.marginNominal, false)}</td>
                  <td className="px-3 py-3.5 text-center text-emerald-600 dark:text-emerald-400 font-extrabold">{filteredSummary.marginPct.toFixed(1)}%</td>
                  <td className="px-3 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getMarginBadge(filteredSummary.marginPct <= 12 ? 'Low' : filteredSummary.marginPct <= 28 ? 'Mid' : 'High').bg}`}>
                      {filteredSummary.marginPct <= 12 ? 'Low' : filteredSummary.marginPct <= 28 ? 'Mid' : 'High'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Edit Direct Data Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Edit Data Finansial & Alokasi Karyawan
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Perubahan akan langsung memperbarui database dan berdampak pada seluruh tabel & grafik dashboard.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Live Calculation Preview Box */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Kalkulasi Otomatis (Live Preview)
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    getMarginBadge(livePreview.status).bg
                  }`}
                >
                  Status Margin: {livePreview.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block">Direct Cost:</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatIDR(livePreview.directCost, false)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block">COGS (Gaji x Koef):</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {formatIDR(livePreview.cogs, false)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block">Margin Nominal:</span>
                  <span
                    className={`font-extrabold ${
                      livePreview.marginNominal >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {formatIDR(livePreview.marginNominal, false)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 block">Net Margin (%):</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                    {livePreview.marginPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Group (Tim)
                  </label>
                  <select
                    value={formData.id_group}
                    onChange={(e) => setFormData({ ...formData, id_group: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="">-- Pilih Group --</option>
                    {groupsList.map((g) => (
                      <option key={g.id_group} value={g.id_group}>
                        {g.group_name}
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="">⚠️ On Bench (Idle / Unassigned)</option>
                    {customersList.map((c) => (
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
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-extrabold cursor-not-allowed"
                      />
                    ) : (
                      <input
                        type="date"
                        required={formData.start_contract?.toLowerCase() !== 'permanent'}
                        value={formData.start_contract}
                        onChange={(e) => setFormData({ ...formData, start_contract: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
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
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-extrabold cursor-not-allowed"
                      />
                    ) : (
                      <input
                        type="date"
                        required={formData.end_contract?.toLowerCase() !== 'permanent'}
                        value={formData.end_contract}
                        onChange={(e) => setFormData({ ...formData, end_contract: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Gaji Gross (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.sallary_gross}
                    onChange={(e) => setFormData({ ...formData, sallary_gross: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Koefisien (COGS Multiplier)
                  </label>
                  <select
                    value={formData.koefisien}
                    onChange={(e) => setFormData({ ...formData, koefisien: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
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
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-extrabold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {submitting ? 'Menyimpan...' : 'Perbarui Data Finansial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

