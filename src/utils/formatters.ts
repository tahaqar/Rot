export function formatPrice(price: number): string {
  return price.toLocaleString('en-US') + ' د.ع';
}

export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}
