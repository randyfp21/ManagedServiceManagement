import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  CheckCircle2,
  UserCheck,
  UserX,
  Layers,
  ChevronRight,
  Briefcase,
  UserMinus,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  LabelList
} from 'recharts';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { formatIDR, formatDateID } from '../utils/formatters';

const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#64748b'  // Slate
];

const shortenCustomerName = (fullName) => {
  if (!fullName) return '';
  if (fullName.includes('Central Asia')) return 'BCA';
  if (fullName.includes('Mandiri')) return 'Mandiri';
  if (fullName.includes('Rakyat Indonesia')) return 'BRI';
  if (fullName.includes('Negara Indonesia')) return 'BNI';
  if (fullName.includes('Tabungan Negara')) return 'BTN';
  if (fullName.includes('CIMB Niaga')) return 'CIMB Niaga';
  if (fullName.includes('Permata')) return 'Permata';
  if (fullName.includes('Danamon')) return 'Danamon';
  if (fullName.includes('Maybank')) return 'Maybank';
  if (fullName.includes('Bench')) return 'On Bench';
  return fullName;
};

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [revenueItems, setRevenueItems] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [idleSummary, setIdleSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resOverview, resRev, resExpiring, resIdle] = await Promise.all([
        apiFetch('/dashboard/overview'),
        apiFetch('/revenue/analysis'),
        apiFetch('/dashboard/expiring-contracts'),
        apiFetch('/dashboard/idle-summary'),
      ]);

      if (resOverview.success) setOverview(resOverview.data);
      if (resRev.success) setRevenueItems(resRev.data?.items || []);
      if (resExpiring.success) setExpiringContracts(resExpiring.data || []);
      if (resIdle.success) setIdleSummary(resIdle.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formattedChartData = useMemo(() => {
    if (!revenueItems || revenueItems.length === 0) return [];

    const groupMap = {};
    revenueItems.forEach((item) => {
      const cust = item.customer_name || 'On Bench';
      if (!groupMap[cust]) {
        groupMap[cust] = {
          customer_name: cust,
          employee_count: 0,
          total_revenue: 0,
          total_cogs: 0,
          total_margin_nominal: 0,
          margin_pct: 0,
        };
      }
      groupMap[cust].employee_count += 1;
      groupMap[cust].total_revenue += item.revenue_nett || 0;
      groupMap[cust].total_cogs += item.cogs || 0;
      groupMap[cust].total_margin_nominal += item.margin_nominal || 0;
    });

    const totalHeadcount = revenueItems.length || 1;

    return Object.values(groupMap).map((cust, idx) => {
      const marginPct = cust.total_revenue > 0 ? (cust.total_margin_nominal / cust.total_revenue) * 100 : 0;
      return {
        ...cust,
        short_name: shortenCustomerName(cust.customer_name),
        percentage: Number(((cust.employee_count / totalHeadcount) * 100).toFixed(1)),
        margin_pct: marginPct,
        color: CHART_COLORS[idx % CHART_COLORS.length],
      };
    });
  }, [revenueItems]);

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-blue-400 opacity-75"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent z-10"></div>
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide">
          Memuat Command Center Overview...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Modern Hero Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-2xl border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Managed Services Resource Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Resource & Revenue Command Center
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Monitoring real-time alokasi karyawan, kalkulasi Cost of Goods Sold (COGS), Margin Profitabilitas, dan status resource aktif per enterprise banking customer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-900/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-xs font-bold text-slate-200 shadow-inner">
              <Calendar className="h-4 w-4 text-blue-400" />
              <span>Periode 2026</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* C-Suite Executive Summary Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl border border-slate-700/80 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/80 pb-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Executive Briefing & Strategic Summary
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Real DB Counts
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 font-medium">
                Ringkasan performa finansial, tingkat alokasi resource, dan profitabilitas Managed Services
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              {overview?.average_margin_pct ? overview.average_margin_pct.toFixed(1) : '0.0'}% Profitability Rating
            </span>
          </div>
        </div>

        {/* Real Data Highlight Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Resource Utilization Rate
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-blue-400">
                {overview?.total_employees ? ((overview.active_employees / overview.total_employees) * 100).toFixed(1) : '0'}%
              </span>
              <span className="text-xs font-bold text-slate-300">
                {overview?.active_employees || 0} / {overview?.total_employees || 0} Headcount
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 font-medium">
              {overview?.bench_employees || 0} Karyawan ({(overview?.total_employees ? ((overview.bench_employees / overview.total_employees) * 100).toFixed(1) : 0)}%) sedang On Bench
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Enterprise Banking Accounts
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-400">
                {overview?.total_customers || 0} Clients
              </span>
              <span className="text-xs font-extrabold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-lg border border-emerald-800">
                100% Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 font-medium">
              Enterprise Client Accounts Terdaftar
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Monthly Revenue Run-Rate
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-extrabold text-blue-300 truncate">
                {formatIDR(overview?.total_revenue || 0)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 font-medium truncate">
              COGS Base: <span className="text-slate-200 font-bold">{formatIDR(overview?.total_cogs || 0)}</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Net Profit Nominal / Bulan
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-extrabold text-emerald-400 truncate">
                {formatIDR(overview?.total_margin_nominal || 0)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-300 pt-1 font-bold flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Margin Bersih: {overview?.average_margin_pct?.toFixed(1) || '0.0'}%
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Employee Placement by Customer Container */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Employee Placement & Profitability Distribution by Customer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detail alokasi headcount, kontribusi Nett Revenue, COGS, dan Margin Profitabilitas per enterprise client
            </p>
          </div>

          {/* View Mode Switcher: Bar / Pie / Matrix Table */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" /> Bar Chart
            </button>
            <button
              onClick={() => setChartType('pie')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chartType === 'pie'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PieIcon className="h-3.5 w-3.5" /> Pie Chart
            </button>
            <button
              onClick={() => setChartType('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                chartType === 'matrix'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" /> Matriks Detail Table
            </button>
          </div>
        </div>

        {/* Chart / Matrix Content View */}
        {chartType === 'matrix' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Enterprise Customer / Bank</th>
                  <th className="px-4 py-3 text-center">Headcount (Resource)</th>
                  <th className="px-4 py-3 text-center">Pangsa Alokasi</th>
                  <th className="px-4 py-3">Total Nett Revenue</th>
                  <th className="px-4 py-3">Total COGS</th>
                  <th className="px-4 py-3">Profit Margin Nominal</th>
                  <th className="px-4 py-3 text-center">Margin % & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {formattedChartData.map((item) => {
                  const isBench = item.customer_name.includes('Bench');
                  return (
                    <tr key={item.id_customer} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                        {isBench ? (
                          <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
                            ⚠️ On Bench (Unassigned)
                          </span>
                        ) : (
                          item.customer_name
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                        {item.employee_count} Orang
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-600 dark:text-slate-400">
                        {item.percentage}%
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                        {formatIDR(item.total_revenue || 0)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">
                        {formatIDR(item.total_cogs || 0)}
                      </td>
                      <td className={`px-4 py-3 font-extrabold ${item.total_margin_nominal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatIDR(item.total_margin_nominal || 0)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold ${
                            item.margin_pct >= 28
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                              : item.margin_pct >= 12
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                          }`}
                        >
                          {item.margin_pct ? item.margin_pct.toFixed(1) : '0.0'}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={formattedChartData} margin={{ top: 25, right: 15, left: -10, bottom: 40 }}>
                  <XAxis
                    dataKey="short_name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.06)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2 min-w-[220px]">
                            <p className="font-extrabold text-blue-400 text-sm border-b border-slate-700 pb-1">{data.customer_name}</p>
                            <div className="flex items-center justify-between gap-4 text-slate-200">
                              <span>Headcount Alokasi:</span>
                              <span className="font-extrabold text-white text-sm">{data.employee_count} Resource ({data.percentage}%)</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-blue-300">
                              <span>Nett Revenue:</span>
                              <span className="font-bold">{formatIDR(data.total_revenue || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-slate-400">
                              <span>COGS Base:</span>
                              <span className="font-semibold">{formatIDR(data.total_cogs || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-emerald-400 pt-1 border-t border-slate-800">
                              <span>Margin Nominal:</span>
                              <span className="font-extrabold">{formatIDR(data.total_margin_nominal || 0)} ({data.margin_pct ? data.margin_pct.toFixed(1) : 0}%)</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="employee_count" radius={[8, 8, 0, 0]}>
                    <LabelList
                      dataKey="employee_count"
                      position="top"
                      fill="#3b82f6"
                      fontSize={11}
                      fontWeight="bold"
                      formatter={(val) => `${val}`}
                    />
                    {formattedChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={formattedChartData}
                    dataKey="employee_count"
                    nameKey="customer_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={115}
                    innerRadius={55}
                    paddingAngle={3}
                    label={({ short_name, employee_count }) => `${short_name}: ${employee_count}`}
                  >
                    {formattedChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2 min-w-[220px]">
                            <p className="font-extrabold text-blue-400 text-sm border-b border-slate-700 pb-1">{data.customer_name}</p>
                            <div className="flex items-center justify-between gap-4 text-slate-200">
                              <span>Headcount Alokasi:</span>
                              <span className="font-extrabold text-white text-sm">{data.employee_count} Resource ({data.percentage}%)</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-blue-300">
                              <span>Nett Revenue:</span>
                              <span className="font-bold">{formatIDR(data.total_revenue || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-slate-400">
                              <span>COGS Base:</span>
                              <span className="font-semibold">{formatIDR(data.total_cogs || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-emerald-400 pt-1 border-t border-slate-800">
                              <span>Margin Nominal:</span>
                              <span className="font-extrabold">{formatIDR(data.total_margin_nominal || 0)} ({data.margin_pct ? data.margin_pct.toFixed(1) : 0}%)</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Standalone Detailed Container: Kontrak Segera Berakhir */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Monitoring Early Warning: Kontrak Segera Berakhir (≤ 3 Bulan Terdekat)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  {expiringContracts.length} Karyawan Berisiko
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar karyawan aktif yang tanggal akhir masa kerjanya mendekati batas (≤ 3 Bulan) untuk tindak lanjut perpanjangan kontrak atau re-alokasi.
              </p>
            </div>
          </div>

          <Link
            to="/employees?status=expiring_3m"
            className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all self-start sm:self-auto shrink-0"
          >
            <span>Lihat Semua Kontrak Expiring</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Detailed Table for Expiring Contracts */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-amber-50/70 dark:bg-slate-800/80 text-amber-900 dark:text-amber-200 uppercase text-[10px] font-bold border-b border-amber-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Nama & Specialist Role</th>
                <th className="px-4 py-3">Group / Unit</th>
                <th className="px-4 py-3">Enterprise Client</th>
                <th className="px-4 py-3">Tanggal Expire Kontrak</th>
                <th className="px-4 py-3">Gaji Gross (Cost)</th>
                <th className="px-4 py-3">Nett Revenue</th>
                <th className="px-4 py-3 text-center">Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {expiringContracts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400 font-medium">
                    Tidak ada karyawan yang masa kontrak kerjanya berakhir dalam 3 bulan ke depan.
                  </td>
                </tr>
              ) : (
                expiringContracts.map((emp) => (
                  <tr key={emp.id_employee} className="hover:bg-amber-50/30 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                      <div>{emp.employee_name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{emp.employee_role}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">
                      {emp.group?.brand_name || emp.group?.group_name || '-'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                      {emp.customer?.customer_name ? (
                        <span>{emp.customer.customer_name}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px]">
                          ⚠️ On Bench
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-extrabold text-[11px] border border-rose-200 dark:border-rose-800">
                        <Calendar className="h-3.5 w-3.5 text-rose-600" />
                        {formatDateID(emp.end_contract)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                      {formatIDR(emp.sallary_gross)}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatIDR(emp.revenue_nett)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        to={`/employees?search=${encodeURIComponent(emp.employee_name)}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-xs"
                      >
                        <span>Kelola Master Data</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Resources Idle / On Bench Panel */}
      <div className="bg-gradient-to-br from-amber-50/70 via-amber-50/30 to-orange-50/20 dark:from-amber-950/30 dark:to-orange-950/10 p-6 sm:p-7 rounded-3xl border border-amber-200 dark:border-amber-800/70 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200/80 dark:border-amber-800/60 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <UserX className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Summary Resources Idle (On Bench)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  Unassigned Cost
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar karyawan yang sedang On Bench dan belum teralokasi ke customer perbankan
              </p>
            </div>
          </div>

          <Link
            to="/timeline"
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <span>Alokasikan Karyawan Idle</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Idle KPI Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 shadow-xs max-w-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Headcount Idle (On Bench)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {idleSummary?.total_idle_count || 0} Karyawan
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {idleSummary?.idle_percentage?.toFixed(1) || 0}% Total Resource
            </span>
          </div>
        </div>

        {/* Idle Table List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 uppercase font-bold text-[10px] border-b border-amber-200 dark:border-amber-800/50">
                <tr>
                  <th className="px-5 py-3.5">Nama Karyawan</th>
                  <th className="px-4 py-3.5">Role / Spesialisasi</th>
                  <th className="px-4 py-3.5">Group Tim</th>
                  <th className="px-4 py-3.5">Periode Kontrak</th>
                  <th className="px-5 py-3.5 font-extrabold text-right">Gaji Gross</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {!idleSummary?.idle_employees || idleSummary.idle_employees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                      Tidak ada karyawan yang sedang Idle (100% Resource Allocated 🎉)
                    </td>
                  </tr>
                ) : (
                  idleSummary.idle_employees.map((emp) => (
                    <tr key={emp.id_employee} className="hover:bg-amber-50/60 dark:hover:bg-amber-950/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        {emp.employee_name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {emp.employee_role}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-500">
                        {emp.group_name}
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-slate-500 whitespace-nowrap">
                        {formatDateID(emp.start_contract)} - {formatDateID(emp.end_contract)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {formatIDR(emp.sallary_gross, false)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Allocation Breakdown Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Detail Total Alokasi Karyawan per Customer Bank
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rincian jumlah headcount dan persentase alokasi per perbankan
            </p>
          </div>
          <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            Total {overview?.total_employees || 0} Resource
          </span>
        </div>

        {/* Breakdown Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          {formattedChartData.map((item) => {
            const isBench = item.customer_name.includes('Bench');
            return (
              <div
                key={item.customer_name}
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  isBench
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {item.short_name}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                      isBench
                        ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    }`}
                  >
                    {item.employee_count} Orang
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-3 font-medium">
                  {item.customer_name}
                </p>

                {/* Custom Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <span>Pangsa Alokasi</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(item.percentage, 4)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

