import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Filter,
  Search,
  Calendar,
  User,
  ShieldCheck,
  RotateCcw,
  Info,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileSpreadsheet,
  Activity
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import { formatDateID } from '../utils/formatters';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState({
    total_logs: 0,
    create_count: 0,
    update_count: 0,
    delete_count: 0,
    status_count: 0,
    login_count: 0,
  });
  const [loading, setLoading] = useState(true);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Modal State
  const [detailModal, setDetailModal] = useState({
    open: false,
    item: null,
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [page, startDate, endDate, selectedEntity, selectedAction]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = `/v1/audit-logs?page=${page}&limit=20`;
      if (startDate) query += `&start_date=${startDate}`;
      if (endDate) query += `&end_date=${endDate}`;
      if (selectedEntity !== 'all') query += `&entity=${selectedEntity}`;
      if (selectedAction !== 'all') query += `&action=${selectedAction}`;

      const res = await apiFetch(query);
      if (res.success) {
        setLogs(res.data.logs || []);
        setTotalPages(res.data.total_pages || 1);
        setTotalItems(res.data.total || 0);
        if (res.data.summary) {
          setSummaryMetrics(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedEntity('all');
    setSelectedAction('all');
    setSearchQuery('');
    setPage(1);
  };

  // Client side search inside current logs
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        log.summary.toLowerCase().includes(q) ||
        log.performed_by.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q))
    );
  }, [logs, searchQuery]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-300 dark:border-emerald-800">
            🟢 CREATE
          </span>
        );
      case 'UPDATE':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-extrabold text-[10px] border border-blue-300 dark:border-blue-800">
            🔵 UPDATE
          </span>
        );
      case 'DELETE':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-extrabold text-[10px] border border-rose-300 dark:border-rose-800">
            🔴 DELETE
          </span>
        );
      case 'STATUS_CHANGE':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] border border-amber-300 dark:border-amber-800">
            🟡 STATUS CHANGE
          </span>
        );
      case 'LOGIN':
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-extrabold text-[10px] border border-purple-300 dark:border-purple-800">
            🟣 LOGIN
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-[10px]">
            {action}
          </span>
        );
    }
  };

  const formatDateTimeFull = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Audit Changes & System Activity Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Pelacakan riwayat aktivitas perubahan data, penyesuaian gaji, autentikasi, dan status sistem
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Audited Logs</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block">
              {summaryMetrics.total_logs} Aktivitas
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Created Records</span>
            <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
              {summaryMetrics.create_count} Added
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            🟢
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Updated Records</span>
            <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">
              {summaryMetrics.update_count} Modified
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            🔵
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Deleted Records</span>
            <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">
              {summaryMetrics.delete_count} Removed
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            🔴
          </div>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ringkasan, user, atau detail..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Range & Dropdown Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 flex-1">
            {/* Start Date */}
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Tanggal Mulai"
              />
            </div>

            {/* End Date */}
            <div>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Tanggal Selesai"
              />
            </div>

            {/* Entity Filter */}
            <div>
              <select
                value={selectedEntity}
                onChange={(e) => {
                  setSelectedEntity(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">📁 Semua Entitas</option>
                <option value="employee">👤 Employee</option>
                <option value="customer">🏢 Customer</option>
                <option value="group">📂 Group</option>
                <option value="personalnote">💳 Personal Note</option>
                <option value="auth">🔑 Auth / Login</option>
              </select>
            </div>

            {/* Action Filter */}
            <div>
              <select
                value={selectedAction}
                onChange={(e) => {
                  setSelectedAction(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">⚡ Semua Aksi</option>
                <option value="create">🟢 CREATE</option>
                <option value="update">🔵 UPDATE</option>
                <option value="delete">🔴 DELETE</option>
                <option value="status_change">🟡 STATUS CHANGE</option>
                <option value="login">🟣 LOGIN</option>
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

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 min-w-[150px]">Waktu Activity</th>
                <th className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-700 min-w-[100px]">Pelaku</th>
                <th className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-700 min-w-[110px]">Aksi</th>
                <th className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-700 min-w-[100px]">Entitas</th>
                <th className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 min-w-[280px]">Ringkasan Aktivitas</th>
                <th className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-700 text-center min-w-[80px]">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-400">
                    Memuat data audit activity logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-400">
                    Tidak ada log aktivitas ditemukan untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 font-medium whitespace-nowrap text-[11px]">
                      {formatDateTimeFull(log.created_at)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                      {log.performed_by || 'admin'}
                    </td>
                    <td className="px-4 py-3.5">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3.5 font-bold text-blue-600 dark:text-blue-400 text-xs">
                      {log.entity}
                    </td>
                    <td className="px-5 py-3.5 text-slate-900 dark:text-slate-100 font-semibold text-xs">
                      {log.summary}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setDetailModal({ open: true, item: log })}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold transition-colors inline-flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Menampilkan halaman <strong className="text-slate-900 dark:text-white">{page}</strong> dari{' '}
            <strong className="text-slate-900 dark:text-white">{totalPages}</strong> (Total {totalItems} activity logs)
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold disabled:opacity-50 flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail JSON Modal */}
      {detailModal.open && detailModal.item && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Detail Audit Changes</h3>
              </div>
              <button
                onClick={() => setDetailModal({ open: false, item: null })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">User Pelaku:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{detailModal.item.performed_by}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Tipe Aksi:</span>
                <div>{getActionBadge(detailModal.item.action)}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Target Entitas:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{detailModal.item.entity} (ID: {detailModal.item.entity_id || '-'})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Waktu Persis:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{formatDateTimeFull(detailModal.item.created_at)}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1 text-[10px]">
                  Ringkasan Aktivitas:
                </label>
                <p className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">
                  {detailModal.item.summary}
                </p>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1 text-[10px]">
                  Payload Details (JSON):
                </label>
                <pre className="p-3 rounded-xl bg-slate-950 text-emerald-400 text-[11px] overflow-x-auto max-h-48 font-mono border border-slate-800">
                  {formatDetailsJSON(detailModal.item.details)}
                </pre>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setDetailModal({ open: false, item: null })}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDetailsJSON(detailsStr) {
  if (!detailsStr) return '{}';
  try {
    const parsed = JSON.parse(detailsStr);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return detailsStr;
  }
}
