import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Filter,
  Users,
  Building2,
  AlertTriangle,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  Clock,
  Info,
  Layers,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { formatDateID } from '../utils/formatters';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export default function TimelinePage() {
  const [timelineData, setTimelineData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [year, setYear] = useState(2026);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'active', 'onboarding', 'bench', 'expiring'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchTimeline();
  }, [year, selectedGroup, selectedCustomer, selectedStatus]);

  const fetchOptions = async () => {
    try {
      const [resG, resC] = await Promise.all([
        apiFetch('/groups'),
        apiFetch('/customers'),
      ]);
      if (resG.success) setGroups(resG.data);
      if (resC.success) setCustomers(resC.data);
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      let query = `/v1/bench-timeline?year=${year}`;
      if (selectedGroup !== 'all') query += `&group_id=${selectedGroup}`;
      if (selectedCustomer !== 'all') query += `&customer_id=${selectedCustomer}`;
      if (selectedStatus !== 'all') query += `&status=${selectedStatus}`;

      const res = await apiFetch(query);
      if (res.success) {
        setTimelineData(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load bench timeline matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setYear(2026);
    setSelectedGroup('all');
    setSelectedCustomer('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  // Client-side search filtering
  const filteredTimeline = useMemo(() => {
    if (!searchQuery.trim()) return timelineData;
    const q = searchQuery.toLowerCase();
    return timelineData.filter(
      (item) =>
        item.employee_name.toLowerCase().includes(q) ||
        item.employee_role.toLowerCase().includes(q) ||
        item.group_name.toLowerCase().includes(q) ||
        item.customer_name.toLowerCase().includes(q)
    );
  }, [timelineData, searchQuery]);

  // Map exact 6 color states matching user PRD revision
  const getCellColorClass = (cellStatus) => {
    switch (cellStatus) {
      case 'NOT_YET_JOINED':
        // Greyout: Belum Join
        return 'bg-slate-400 dark:bg-slate-600 text-slate-100 hover:bg-slate-500';
      case 'PAST_DAYS':
        // Hijau Muda: Hari yang dilalui
        return 'bg-emerald-200/90 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-300';
      case 'ONBOARDING':
        // Hijau Tua: Onboarding (OBD)
        return 'bg-emerald-600 text-white font-extrabold text-[10px] hover:bg-emerald-700 shadow-xs';
      case 'PO_EXPIRED':
        // Biru: PO Habis (PO)
        return 'bg-blue-600 text-white font-extrabold text-[10px] hover:bg-blue-700 shadow-xs';
      case 'FUTURE_DAYS':
        // Kuning: Hari belum dilalui
        return 'bg-amber-300 dark:bg-amber-600/70 text-amber-950 dark:text-amber-100 hover:bg-amber-400 font-medium';
      case 'EMPLOYEE_CONTRACT_EXPIRED':
      case 'BENCH':
      case 'OFFBOARDED':
        // Merah Muda: Kontrak Karyawan Habis (CO)
        return 'bg-rose-500 text-white font-extrabold text-[10px] hover:bg-rose-600 shadow-xs';
      default:
        return 'bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            On The Bench & Timeline Activity (Weekly Matrix View)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Gantt Chart interaktif 52 minggu per tahun untuk alokasi, onboarding, dan status durasi kontrak
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm self-start sm:self-auto">
          <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400 ml-2" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pilih Tahun:</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-1 text-xs font-extrabold rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 focus:outline-none"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* Filter Bar Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari karyawan, group, atau bank..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            {/* Group Filter */}
            <div>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
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
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">🏢 Semua Customer & Bench</option>
                <option value="bench">⚠️ On Bench (Idle Only)</option>
                {customers.map((c) => (
                  <option key={c.id_customer} value={c.id_customer}>
                    {c.customer_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">📊 Semua Status Timeline</option>
                <option value="active">🟢 Active Placement</option>
                <option value="onboarding">🔵 Status Onboarding</option>
                <option value="bench">🔴 Bench / Contract Expiring</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Interactive Sticky Timeline Gantt Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh]">
          <table className="w-full text-left text-xs border-collapse relative">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] sticky top-0 z-30 shadow-xs">
              {/* Header Level 1: Fixed Columns Title + Months */}
              <tr>
                <th className="px-4 py-2.5 sticky left-0 z-40 bg-slate-100 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 min-w-[160px] w-[160px]">
                  Name (Karyawan)
                </th>
                <th className="px-4 py-2.5 sticky left-[160px] z-40 bg-slate-100 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 min-w-[160px] w-[160px]">
                  Unit Kerja (Customer)
                </th>
                <th className="px-3 py-2.5 sticky left-[320px] z-40 bg-slate-100 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 min-w-[110px] w-[110px]">
                  PO End (Cust)
                </th>
                <th className="px-3 py-2.5 sticky left-[430px] z-40 bg-slate-100 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 min-w-[110px] w-[110px]">
                  End Contract (Emp)
                </th>

                {/* 12 Months Columns Header (colSpan 4 each = 48 weeks) */}
                {MONTH_NAMES.map((mName) => (
                  <th
                    key={mName}
                    colSpan={4}
                    className="px-2 py-2.5 text-center uppercase tracking-wider font-extrabold border-b border-r border-slate-200 dark:border-slate-700 min-w-[140px] bg-slate-200/80 dark:bg-slate-800/90 text-blue-600 dark:text-blue-400"
                  >
                    {mName} {year}
                  </th>
                ))}
              </tr>

              {/* Header Level 2: Empty Fixed Columns + Weeks Header (W1, W2, W3, W4) */}
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-[10px]">
                <th className="sticky left-0 z-40 bg-slate-50 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700"></th>
                <th className="sticky left-[160px] z-40 bg-slate-50 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700"></th>
                <th className="sticky left-[320px] z-40 bg-slate-50 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700"></th>
                <th className="sticky left-[430px] z-40 bg-slate-50 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700"></th>

                {MONTH_NAMES.map((mName, mIdx) => (
                  <React.Fragment key={`weeks-${mName}`}>
                    {[1, 2, 3, 4].map((wNum) => (
                      <th
                        key={`${mIdx}-${wNum}`}
                        className="px-1 py-1.5 text-center border-b border-r border-slate-200 dark:border-slate-700/60 text-slate-500 font-bold min-w-[35px] w-[35px]"
                      >
                        W{wNum}
                      </th>
                    ))}
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="52" className="px-5 py-12 text-center text-slate-400">
                    Membangun matriks mingguan (Weekly Gantt Chart 52 Minggu)...
                  </td>
                </tr>
              ) : filteredTimeline.length === 0 ? (
                <tr>
                  <td colSpan="52" className="px-5 py-12 text-center text-slate-400">
                    Tidak ada data timeline ditemukan untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredTimeline.map((emp) => {
                  const isBench = emp.customer_name.includes('Bench');

                  return (
                    <tr key={emp.id_employee} className="hover:bg-blue-50/20 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Fixed Left Column 1: Name & Role & Group */}
                      <td className="px-4 py-3 sticky left-0 z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 font-extrabold text-slate-900 dark:text-white text-xs truncate max-w-[160px]">
                        <div>{emp.employee_name}</div>
                        <div className="text-[10px] font-normal text-slate-400 truncate">
                          {emp.employee_role} • <span className="font-semibold text-blue-600 dark:text-blue-400">{emp.group_name}</span>
                        </div>
                      </td>

                      {/* Fixed Left Column 2: Unit Kerja (Customer) & Historical Flow */}
                      <td className="px-4 py-3 sticky left-[160px] z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-xs truncate max-w-[160px]">
                        {isBench ? (
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px]">
                            ⚠️ On Bench
                          </span>
                        ) : (
                          <span className="font-bold text-slate-900 dark:text-slate-100">{emp.customer_name}</span>
                        )}
                        {emp.assignment_flow && (
                          <div className="text-[9px] text-slate-500 dark:text-slate-400 font-normal truncate mt-0.5" title={emp.assignment_flow}>
                            🔄 {emp.assignment_flow}
                          </div>
                        )}
                      </td>

                      {/* Fixed Left Column 3: PO Start -> Customer End Contract */}
                      <td className="px-3 py-3 sticky left-[320px] z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {isBench ? '-' : formatDateID(emp.customer_end_contract)}
                      </td>

                      {/* Fixed Left Column 4: End Contract -> Employee Contract End */}
                      <td className="px-3 py-3 sticky left-[430px] z-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatDateID(emp.end_contract)}
                      </td>

                      {/* 48 Scrollable Weekly Status Cells */}
                      {emp.weekly_status?.map((cell, idx) => {
                        const cellColor = getCellColorClass(cell.status);
                        return (
                          <td
                            key={`${emp.id_employee}-${cell.month}-${cell.week}-${idx}`}
                            className={`p-0 border-r border-b border-slate-200/70 dark:border-slate-800 text-center relative group min-w-[35px] h-[38px] transition-colors cursor-pointer ${cellColor}`}
                          >
                            <div className="h-full w-full flex items-center justify-center text-[9px] font-extrabold select-none">
                              {cell.label}
                            </div>

                            {/* Concise Interactive Tooltip (Hover Popup) */}
                            <div className="hidden group-hover:block fixed z-50 p-2.5 bg-slate-950 text-white rounded-xl shadow-2xl border border-slate-700 text-left text-[11px] pointer-events-none w-64 -translate-x-1/2 -translate-y-full mb-2">
                              <div className="font-extrabold text-blue-400 text-xs border-b border-slate-800 pb-1 mb-1 truncate">
                                {emp.employee_name} • {emp.group_name}
                              </div>

                              <div className="space-y-0.5 text-slate-300 text-[10px]">
                                <p className="truncate">
                                  <strong className="text-slate-400">Unit:</strong> {emp.customer_name}
                                </p>
                                <p className="font-extrabold text-amber-400">
                                  Status: {cell.tooltip_status} ({MONTH_NAMES[cell.month - 1]} W{cell.week})
                                </p>
                                <p className="text-slate-400 pt-0.5">
                                  📅 Kontrak Karyawan: {formatDateID(emp.po_contract_timeline)} – {formatDateID(emp.end_contract)}
                                </p>
                                {!isBench && (
                                  <p className="text-slate-400">
                                    🏛️ Kontrak Customer (PO): {formatDateID(emp.customer_start_contract)} – {formatDateID(emp.customer_end_contract)}
                                  </p>
                                )}
                                {emp.previous_customer_name && (
                                  <p className="text-slate-300 border-t border-slate-800 pt-1 mt-1">
                                    ⏮️ <strong className="text-slate-400">Cust Sebelum:</strong> {emp.previous_customer_name}
                                  </p>
                                )}
                                {emp.idle_period_months && emp.idle_period_months !== '-' && (
                                  <p className="text-amber-400">
                                    ⏳ <strong className="text-amber-300">Durasi Bench:</strong> {emp.idle_period_months}
                                  </p>
                                )}
                                {emp.assignment_flow && (
                                  <p className="text-emerald-400 text-[9px] pt-0.5 truncate">
                                    🔄 <strong className="text-emerald-300">Alur Histori:</strong> {emp.assignment_flow}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clear Bottom Legend Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Keterangan Warna Cell (Legend Matrix)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-semibold">
          {/* 1. Greyout */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
            <span className="h-4 w-7 rounded bg-slate-400 dark:bg-slate-600 shrink-0"></span>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">Belum Join</span>
          </div>

          {/* 2. Hijau Muda */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
            <span className="h-4 w-7 rounded bg-emerald-200 dark:bg-emerald-900/80 border border-emerald-300 dark:border-emerald-700 shrink-0"></span>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">Hari yang dilalui</span>
          </div>

          {/* 3. Hijau Tua (OBD) */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
            <span className="h-4 w-7 rounded bg-emerald-600 text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
              OBD
            </span>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">Onboarding (OBD)</span>
          </div>

          {/* 4. Biru (PO) */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
            <span className="h-4 w-7 rounded bg-blue-600 text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
              PO
            </span>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">PO Habis (PO)</span>
          </div>

          {/* 5. Kuning */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
            <span className="h-4 w-7 rounded bg-amber-300 dark:bg-amber-600 border border-amber-400 dark:border-amber-500 shrink-0"></span>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">Hari belum dilalui</span>
          </div>

          {/* 6. Merah Muda (CO) */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
            <span className="h-4 w-7 rounded bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shrink-0">
              CO
            </span>
            <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">Kontrak Karyawan Habis (CO)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
