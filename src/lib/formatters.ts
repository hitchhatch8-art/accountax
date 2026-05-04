/**
 * Formats a number as a currency string in French style (e.g., 1 250,00 DH)
 */
export function formatCurrency(amount: number, currency: string = 'DH'): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${formatted} ${currency}`;
}

/**
 * Calculates sums for an array of invoice items
 */
export function calculateInvoiceTotals(items: { quantity: number; priceHT: number; tvaRate: number }[]) {
  const totalHT = items.reduce((sum, item) => sum + (item.quantity * item.priceHT), 0);
  const totalTVA = items.reduce((sum, item) => sum + (item.quantity * item.priceHT * (item.tvaRate / 100)), 0);
  const totalTTC = totalHT + totalTVA;

  return { totalHT, totalTVA, totalTTC };
}
