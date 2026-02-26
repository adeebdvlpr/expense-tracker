
export function formatMoney(amount, currency = 'USD') {
    const num = Number(amount);
    if (!Number.isFinite(num)) return `${currency} 0.00`;
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }).format(num);
    } catch {
      return `${currency} ${num.toFixed(2)}`;
    }
  }
  