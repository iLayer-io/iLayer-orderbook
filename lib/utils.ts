import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeParseFloat(value: string | number): number {
  const parsed = parseFloat(value.toString());
  return isNaN(parsed) ? 0 : parsed;
}

// Funzione per formattare numeri con decimali
export function formatNumber(value: bigint, decimals?: number): number {
  if (!decimals) return 0;
  return parseFloat(formatUnits(value, decimals));
}

const isGhPages = process.env.DEPLOY_TARGET === 'gh-pages';
const isProd = process.env.NODE_ENV === 'production';
const repo = 'iLayer-orderbook';
export const baseUrl = isGhPages && isProd ? `/${repo}` : '';
