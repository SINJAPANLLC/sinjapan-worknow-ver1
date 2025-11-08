export function formatCurrency(amount: number, currency: string = 'JPY'): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('ja-JP').format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
