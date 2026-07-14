import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateRegistrationCode(teamName: string): string {
  const prefix = 'MLT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  const teamInitial = teamName.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  return `${prefix}-${teamInitial}-${timestamp}-${random}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatWhatsApp(number: string): string {
  // Remove all non-digits
  let cleaned = number.replace(/\D/g, '');
  // Convert 08xx to 628xx
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

export function getWhatsAppUrl(number: string, message?: string): string {
  const cleaned = formatWhatsApp(number);
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleaned}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
}

export function getTimeRemaining(targetDate: string) {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
}

export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'paid': return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'failed': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'expired': return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
}

export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'paid': return 'LUNAS';
    case 'pending': return 'MENUNGGU';
    case 'failed': return 'GAGAL';
    case 'expired': return 'KADALUARSA';
    default: return status.toUpperCase();
  }
}
