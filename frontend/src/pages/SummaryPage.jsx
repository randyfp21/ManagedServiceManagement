import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Filter, Building2, Info, Users, Search, X, CheckCircle2, UserCheck, ChevronRight } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { formatDateID, formatIDR } from '../utils/formatters';

export default function SummaryPage() {
  const [data, setData] = useState(null);
  const [year, setYear] = useState(2026);
  const [loading, setLoading] = useState(true);

  // Modal Detail Karyawan State
  const [assignedModal, setAssignedModal] = useState({
    open: false,
    customerName: '',
    customerId: null,
    monthName: '',
    count: 0,
  });
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  useEffect(() => {
    fetchSummary();
  }, [year]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/summary/monthly-allocation?year=${year}`);
      if (res.success) setData(res.data);
    } catch (err) {
      console.error('Failed to fetch summary matrix:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Determine if a month in a given year has NOT passed yet
  const isFutureMonth = (targetYear, monthIdx) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth(); // 0-indexed: 0 = Jan, 7 = Aug

    if (targetYear > currentYear) return true;
    if (targetYear === currentYear && monthIdx > currentMonthIdx) return true;
    return false;
  };

  // Open Detail Assigned Employees Modal when cell count is clicked
  const handleOpenAssignedModal = async (customerName, customerId, monthName = '', count = 0) => {
    setAssignedModal({
      open: true,
      customerName,
      customerId,
      monthName,
      count,
    });
    setModalSearch('');
    setLoadingModal(true);

    try {
      let endpoint = `/summary/assigned-employees?year=${year}`;
      if (customerName && customerName !== 'Semua Customer') {
        endpoint += `&customer_name=${encodeURIComponent(customerName)}`;
      }
      if (monthName) {
        endpoint += `&month=${encodeURIComponent(monthName)}`;
      }

      const res = await apiFetch(endpoint);
      if (res.success) {
        setAssignedEmployees(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch assigned employees:', err);
    } finally {
      setLoadingModal(false);
    }
  };

  // Filter employees inside modal search
  const filteredModalEmployees = useMemo(() => {
    if (!modalSearch.trim()) return assignedEmployees;
    const q = modalSearch.toLowerCase();
    return assignedEmployees.filter(
      (e) =>
        e.employee_name.toLowerCase().includes(q) ||
        e.employee_role.toLowerCase().includes(q) ||
        (e.brand_name && e.brand_name.toLowerCase().includes(q)) ||
        (e.group_name && e.group_name.toLowerCase().includes(q))
    );
  }, [assignedEmployees, modalSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            Summary Employee per Month
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Matriks alokasi headcount karyawan per customer bank (Klik angka cell untuk melihat daftar karyawan yang di-assign)
          </p>
        </div>

        {/* Year Filter */}
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

      {/* Info Banner */}
      <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between gap-2.5 text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2.5">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            Bulan mendatang yang belum dilalui (seperti September–Desember {year}) secara otomatis dikosongkan. <strong>Klik pada angka cell</strong> untuk melihat daftar karyawan yang di-assign.
          </span>
        </div>
      </div>

      {/* Allocation Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4 min-w-[220px]">Customer Name</th>
                {data?.months?.map((m, idx) => {
                  const isFuture = isFutureMonth(year, idx);
                  return (
                    <th
                      key={m}
                      className={`px-3 py-4 text-center min-w-[60px] ${
                        isFuture ? 'text-slate-300 dark:text-slate-600 font-normal' : ''
                      }`}
                    >
                      {m}
                    </th>
                  );
                })}
                <th className="px-5 py-4 text-center min-w-[120px] bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300">
                  Total Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="14" className="px-5 py-12 text-center text-slate-400">
                    Memuat matriks alokasi bulanan...
                  </td>
                </tr>
              ) : !data?.rows || data.rows.length === 0 ? (
                <tr>
                  <td colSpan="14" className="px-5 py-12 text-center text-slate-400">
                    Tidak ada data customer aktif pada tahun {year}
                  </td>
                </tr>
              ) : (
                data.rows.map((row) => (
                  <tr key={row.id_customer} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span className="truncate">{row.customer_name}</span>
                    </td>
                    {data.months.map((m, mIdx) => {
                      const isFuture = isFutureMonth(year, mIdx);
                      const count = row.monthly_count[m] || 0;

                      if (isFuture) {
                        return (
                          <td key={m} className="px-3 py-3.5 text-center text-slate-300 dark:text-slate-700">
                            {/* Empty space for future months */}
                          </td>
                        );
                      }

                      return (
                        <td key={m} className="px-3 py-3.5 text-center font-medium">
                          {count > 0 ? (
                            <button
                              onClick={() => handleOpenAssignedModal(row.customer_name, row.id_customer, m, count)}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all transform hover:scale-110 cursor-pointer shadow-xs"
                              title={`Klik untuk lihat ${count} karyawan di-assign ke ${row.customer_name} (${m} ${year})`}
                            >
                              {count}
                            </button>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3.5 text-center font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20 text-sm">
                      <button
                        onClick={() => handleOpenAssignedModal(row.customer_name, row.id_customer, '', row.total_active)}
                        className="hover:underline cursor-pointer"
                        title={`Klik untuk lihat total ${row.total_active} karyawan di-assign ke ${row.customer_name}`}
                      >
                        {row.total_active}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Total Footer Row */}
            {data && (
              <tfoot className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-slate-100 border-t-2 border-slate-300 dark:border-slate-700">
                <tr>
                  <td className="px-5 py-4 text-slate-900 dark:text-white uppercase font-bold tracking-wider">
                    Total Karyawan Aktif
                  </td>
                  {data.months.map((m, mIdx) => {
                    const isFuture = isFutureMonth(year, mIdx);
                    if (isFuture) {
                      return <td key={m} className="px-3 py-4 text-center"></td>;
                    }
                    const totalM = data.monthly_total[m] || 0;
                    return (
                      <td key={m} className="px-3 py-4 text-center text-blue-600 dark:text-blue-400 text-xs">
                        {totalM > 0 ? (
                          <button
                            onClick={() => handleOpenAssignedModal('Semua Customer', null, m, totalM)}
                            className="hover:underline font-extrabold cursor-pointer"
                            title={`Klik untuk lihat ${totalM} total karyawan di-assign pada bulan ${m} ${year}`}
                          >
                            {totalM}
                          </button>
                        ) : (
                          0
                        )}
                      </td>
                    );
                  })}
                  <td className="px-5 py-4 text-center text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-950/50 border-l border-slate-300 dark:border-slate-700">
                    <button
                      onClick={() => handleOpenAssignedModal('Semua Customer', null, '', data.grand_total)}
                      className="hover:underline cursor-pointer font-black"
                      title="Klik untuk lihat seluruh karyawan aktif"
                    >
                      {data.grand_total} Active
                    </button>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal Detail List Karyawan Assigned */}
      {assignedModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-fade-in max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    Daftar Karyawan Assigned
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {assignedModal.customerName} {assignedModal.monthName ? `• Bulan ${assignedModal.monthName} ${year}` : `• Tahun ${year}`} ({assignedModal.count} Resource)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAssignedModal({ ...assignedModal, open: false })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="relative w-full shrink-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Cari nama karyawan, role, atau group..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Modal Employee List Table */}
            <div className="overflow-y-auto flex-1 border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">Nama Karyawan</th>
                    <th className="px-4 py-3">Role / Keahlian</th>
                    <th className="px-4 py-3">Group</th>
                    <th className="px-4 py-3">Periode Kontrak</th>
                    <th className="px-4 py-3 text-right">Gross Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {loadingModal ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                        Memuat daftar karyawan...
                      </td>
                    </tr>
                  ) : filteredModalEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                        Tidak ada data karyawan ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredModalEmployees.map((emp) => (
                      <tr key={emp.id_employee} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white flex items-center justify-between gap-2">
                          <span>{emp.employee_name}</span>
                          {emp.status === 'Resign' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                              Resign (Histori)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                          {emp.employee_role}
                        </td>
                        <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">
                          {emp.brand_name || emp.group_name || emp.group?.group_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-500">
                          {emp.is_permanent || emp.start_contract?.toLowerCase() === 'permanent' || emp.end_contract?.toLowerCase() === 'permanent' ? (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-extrabold border border-blue-200 dark:border-blue-800 text-[10px]">
                              🛡️ Permanent
                            </span>
                          ) : (
                            `${formatDateID(emp.start_contract)} – ${formatDateID(emp.end_contract)}`
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatIDR(emp.sallary_gross)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 shrink-0 text-xs">
              <span className="text-slate-400">
                Menampilkan <strong className="text-slate-900 dark:text-white">{filteredModalEmployees.length}</strong> karyawan assigned
              </span>
              <button
                onClick={() => setAssignedModal({ ...assignedModal, open: false })}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition-colors"
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
