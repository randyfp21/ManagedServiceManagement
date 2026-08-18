// IDR Currency Formatter matching standard Indonesian format: Rp 5.000.000,00
export const formatIDR = (val, showDecimals = true) => {
  if (val === null || val === undefined || isNaN(val)) {
    return showDecimals ? 'Rp 0,00' : 'Rp 0';
  }
  const num = Number(val);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(num);
};

// Safe Date formatter for YYYY-MM-DD or ISO strings without timezone shift
export const formatDateID = (dateStr) => {
  if (!dateStr) return '-';
  if (dateStr.toLowerCase() === 'permanent') return 'Permanent';
  const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = cleanDate.split('-');
  if (parts.length !== 3) return dateStr;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const d = new Date(year, month, day);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
};

// Calculate status margin color code matching PRD specification
export const getMarginBadge = (status) => {
  const normStatus = (status || '').toString().trim();

  if (normStatus === 'Low' || normStatus === 'Min') {
    return {
      text: 'Low',
      bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800',
      badgeColor: 'bg-rose-500',
    };
  } else if (normStatus === 'Mid' || normStatus === 'Middle') {
    return {
      text: 'Mid',
      bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      badgeColor: 'bg-amber-500',
    };
  } else if (normStatus === 'High' || normStatus === 'Very High') {
    return {
      text: 'High',
      bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      badgeColor: 'bg-emerald-500',
    };
  }

  return {
    text: normStatus || 'Mid',
    bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    badgeColor: 'bg-slate-400',
  };
};
