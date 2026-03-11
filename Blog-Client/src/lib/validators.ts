export function isValidEmail(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;
  // basit RFC 5322 uyumlu kontrol (tam kapsamlı değil, ama çoğu emaili yakalar)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function isMinLength(value: string, min: number): boolean {
  return value.trim().length >= min;
}
