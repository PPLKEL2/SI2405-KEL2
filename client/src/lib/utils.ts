import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatIndonesianDate(isoOrDate?: string | Date): string {
  const dt = isoOrDate ? new Date(isoOrDate) : new Date();
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dt);
}

export function formatIndonesianDateTime(isoOrDate?: string | Date): string {
  const dt = isoOrDate ? new Date(isoOrDate) : new Date();
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dt);
}

