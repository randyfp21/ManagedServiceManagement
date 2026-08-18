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
  ArrowRight
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
  '#3b82f6', // BCA - Blue
  '#10b981', // Mandiri - Emerald
  '#f59e0b', // BRI - Amber
  '#8b5cf6', // BNI - Purple
  '#ec4899', // BTN - Pink
  '#6366f1', // CIMB - Indigo
  '#06b6d4', // Permata - Cyan
  '#14b8a6', // Danamon - Teal
  '#f97316', // Maybank - Orange
  '#64748b'  // Bench - Slate
];

// Helper to shorten bank names for clean chart labels
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
  const [distribution, setDistribution] = useState([]);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [roleSummary, setRoleSummary] = useState([]);
  const [idleSummary, setIdleSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [resOverview, resDist, resExpiring, resRole, resIdle] = await Promise.all([
        apiFetch('/dashboard/overview'),
        apiFetch('/dashboard/customer-distribution'),
        apiFetch('/dashboard/expiring-contracts'),
        apiFetch('/dashboard/role-summary'),
        apiFetch('/dashboard/idle-summary'),
      ]);

      if (resOverview.success) setOverview(resOverview.data);
      if (resDist.success) setDistribution(resDist.data);
      if (resExpiring.success) setExpiringContracts(resExpiring.data);
      if (resRole.success) setRoleSummary(resRole.data || []);
      if (resIdle.success) setIdleSummary(resIdle.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Formatted chart data with short names & percentage calculation
  const formattedChartData = useMemo(() => {
    const total = overview?.total_employees || 1;
    return distribution.map((item, idx) => ({
      ...item,
      short_name: shortenCustomerName(item.customer_name),
      percentage: Number(((item.employee_count / total) * 100).toFixed(1)),
      color: CHART_COLORS[idx % CHART_COLORS.length],
    }));
  }, [distribution, overview]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <p className="text-xs font-semibold text-slate-400">Memuat dashboard overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6" />
            Resource & Revenue Command Center
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            Real-time tracking of employee allocations, COGS, and revenue margins in IDR
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-semibold">
          <Calendar className="h-4 w-4" />
          <span>Active Period 2026</span>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Employees */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Employees
            </span>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {overview?.active_employees || 0}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total: {overview?.total_employees || 0} Karyawan
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1">
              <UserX className="h-3 w-3" />
              {overview?.bench_employees || 0} On Bench (Idle)
            </span>
          </div>
        </div>

        {/* Card 2: Total Customers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Customers
            </span>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {overview?.total_customers || 0}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> 100% Active
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Enterprise Client Accounts
          </p>
        </div>

        {/* Card 3: Total Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Nett Revenue
            </span>
            <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg sm:text-xl font-extrabold text-blue-600 dark:text-blue-400 block truncate">
              {formatIDR(overview?.total_revenue || 0)}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate">
            COGS: {formatIDR(overview?.total_cogs || 0)}
          </p>
        </div>

        {/* Card 4: Total Margin */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Margin Nominal
            </span>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-1">
            <span className="text-lg sm:text-xl font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
              {formatIDR(overview?.total_margin_nominal || 0)}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {overview?.average_margin_pct?.toFixed(1) || '0.0'}% Avg Margin
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart & Expiring Contracts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution Chart (Left - 2 Cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Employee Allocation by Customer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Distribusi total alokasi karyawan per customer bank & status On Bench
              </p>
            </div>

            {/* Switcher Bar / Pie */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start sm:self-auto">
              <button
                onClick={() => setChartType('bar')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartType === 'bar'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" /> Bar Chart
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  chartType === 'pie'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PieIcon className="h-3.5 w-3.5" /> Pie Chart
              </button>
            </div>
          </div>

          {/* Graphic Container */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={formattedChartData} margin={{ top: 25, right: 15, left: -10, bottom: 25 }}>
                  <XAxis
                    dataKey="short_name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    tick={({ x, y, payload }) => (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={12}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize={11}
                          fontWeight="bold"
                        >
                          {payload.value}
                        </text>
                      </g>
                    )}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                            <p className="font-extrabold text-blue-400">{data.customer_name}</p>
                            <p className="font-bold text-slate-200">
                              Total Karyawan: <span className="text-white text-sm font-extrabold">{data.employee_count} Orang</span>
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Persentase Alokasi: <span className="text-emerald-400 font-bold">{data.percentage}%</span>
                            </p>
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
                      fontSize={12}
                      fontWeight="bold"
                      formatter={(val) => `${val} orang`}
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
                    outerRadius={100}
                    innerRadius={45}
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
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1">
                            <p className="font-extrabold text-blue-400">{data.customer_name}</p>
                            <p className="font-bold text-slate-200">
                              Total Karyawan: <span className="text-white text-sm font-extrabold">{data.employee_count} Orang</span>
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Persentase Alokasi: <span className="text-emerald-400 font-bold">{data.percentage}%</span>
                            </p>
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
        </div>

        {/* Alert Table: Contracts Expiring in <= 2 Months (Right - 1 Col) */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Kontrak Segera Berakhir
                </h3>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                  Jatuh tempo ≤ 2 Bulan
                </p>
              </div>
            </div>
            <span className="text-[11px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              {expiringContracts.length} Karyawan
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-72 pr-1">
            {expiringContracts.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-xs italic">
                Tidak ada kontrak berakhir dalam 2 bulan ke depan
              </div>
            ) : (
              expiringContracts.map((emp) => (
                <div
                  key={emp.id_employee}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs transition-all hover:border-amber-400"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {emp.employee_name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {emp.employee_role} • {emp.customer?.customer_name || 'Bench'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-200 dark:border-rose-800">
                      {formatDateID(emp.end_contract)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* NEW SECTION 1: Summary Resources Idle / On Bench */}
      <div className="bg-amber-50/40 dark:bg-amber-950/20 p-6 rounded-2xl border border-amber-300 dark:border-amber-800/80 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-200 dark:border-amber-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <UserX className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Summary Resources Idle (On Bench)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200">
                  Unassigned Cost Impact
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pemantauan beban biaya dan daftar karyawan yang belum dialokasikan ke customer bank
              </p>
            </div>
          </div>

          <Link
            to="/timeline"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <span>Alokasikan Karyawan Idle</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Idle KPI Card */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/50 shadow-xs max-w-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Headcount Idle (On Bench)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {idleSummary?.total_idle_count || 0} Karyawan
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {idleSummary?.idle_percentage?.toFixed(1) || 0}% Total Resource
            </span>
          </div>
        </div>

        {/* Idle Employees Table List */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/50 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 uppercase font-bold text-[10px] border-b border-amber-200 dark:border-amber-800/50">
                <tr>
                  <th className="px-4 py-3">Nama Karyawan</th>
                  <th className="px-3 py-3">Role / Spesialisasi</th>
                  <th className="px-3 py-3">Group Tim</th>
                  <th className="px-3 py-3">Periode Kontrak</th>
                  <th className="px-4 py-3 font-extrabold text-right">Gaji Gross</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {!idleSummary?.idle_employees || idleSummary.idle_employees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                      Tidak ada karyawan yang sedang Idle (100% Resource Allocated 🎉)
                    </td>
                  </tr>
                ) : (
                  idleSummary.idle_employees.map((emp) => (
                    <tr key={emp.id_employee} className="hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {emp.employee_name}
                      </td>
                      <td className="px-3 py-3 text-slate-600 dark:text-slate-300">
                        {emp.employee_role}
                      </td>
                      <td className="px-3 py-3 text-slate-500">
                        {emp.group_name}
                      </td>
                      <td className="px-3 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                        {formatDateID(emp.start_contract)} - {formatDateID(emp.end_contract)}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">
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



      {/* Customer Allocation Breakdown Grid (Bottom Section) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Detail Total Alokasi Karyawan per Customer Bank
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rincian jumlah total karyawan yang ditempatkan pada setiap nasabah bank dan status idle
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
            Total {overview?.total_employees || 0} Resource
          </span>
        </div>

        {/* Breakdown Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {formattedChartData.map((item) => {
            const isBench = item.customer_name.includes('Bench');
            return (
              <div
                key={item.customer_name}
                className={`p-4 rounded-xl border transition-all ${
                  isBench
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                    {item.short_name}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      isBench
                        ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    }`}
                  >
                    {item.employee_count} Orang
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-2">
                  {item.customer_name}
                </p>

                {/* Progress bar */}
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
