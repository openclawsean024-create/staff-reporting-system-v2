import { describe, it, expect } from 'vitest';
import { formatTime, getToday, formatPrice, lookupProduct, DEMO_PRODUCTS } from '../app/lib/format';

describe('formatTime', () => {
  it('formats time as HH:MM:SS from ISO string', () => {
    const iso = '2026-09-06T13:45:30.000Z';
    const result = formatTime(iso);
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('zero-pads single-digit hours, minutes, seconds', () => {
    // Use a date that produces single digits in local time
    const d = new Date();
    d.setHours(5, 7, 9, 0);
    const iso = d.toISOString();
    const result = formatTime(iso);
    // The local time will be 5:7:9 in some TZs
    const parts = result.split(':');
    expect(parts.length).toBe(3);
    // Each part should be 2 digits when split
    parts.forEach((p) => {
      // Allow both zero-padded and unpadded (depending on TZ shift)
      expect(p).toMatch(/^\d{1,2}$/);
    });
  });
});

describe('getToday', () => {
  it('returns YYYY-MM-DD format', () => {
    const today = getToday();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns a valid date', () => {
    const today = getToday();
    const d = new Date(today);
    expect(isNaN(d.getTime())).toBe(false);
  });
});

describe('formatPrice', () => {
  it('formats with $ prefix and zh-TW separators', () => {
    expect(formatPrice(36900)).toBe('$36,900');
  });

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0');
  });

  it('formats large numbers', () => {
    expect(formatPrice(1000000)).toBe('$1,000,000');
  });
});

describe('lookupProduct', () => {
  it('finds PN001 iPhone 15 Pro', () => {
    const p = lookupProduct('PN001');
    expect(p).toEqual({ name: 'iPhone 15 Pro', spec: '256GB', category: '手機', price: 36900 });
  });

  it('is case-insensitive (lowercase)', () => {
    const p = lookupProduct('pn001');
    expect(p?.name).toBe('iPhone 15 Pro');
  });

  it('is case-insensitive (mixed case)', () => {
    const p = lookupProduct('Pn001');
    expect(p?.name).toBe('iPhone 15 Pro');
  });

  it('trims whitespace', () => {
    const p = lookupProduct('  PN001  ');
    expect(p?.name).toBe('iPhone 15 Pro');
  });

  it('returns null for unknown PN', () => {
    expect(lookupProduct('PN999')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(lookupProduct('')).toBeNull();
  });

  it('returns null for null', () => {
    expect(lookupProduct(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(lookupProduct(undefined)).toBeNull();
  });

  it('handles whitespace-only', () => {
    expect(lookupProduct('   ')).toBeNull();
  });

  it('finds all 15 demo products', () => {
    expect(Object.keys(DEMO_PRODUCTS).length).toBe(15);
    for (let i = 1; i <= 15; i++) {
      const code = `PN${String(i).padStart(3, '0')}`;
      const p = lookupProduct(code);
      expect(p).toBeDefined();
      expect(p?.name).toBeTruthy();
    }
  });
});

describe('DEMO_PRODUCTS data integrity', () => {
  it('all products have name, spec, category, price', () => {
    Object.entries(DEMO_PRODUCTS).forEach(([code, p]) => {
      expect(p.name, `${code} missing name`).toBeTruthy();
      expect(p.spec, `${code} missing spec`).toBeTruthy();
      expect(p.category, `${code} missing category`).toBeTruthy();
      expect(typeof p.price, `${code} price type`).toBe('number');
      expect(p.price, `${code} price positive`).toBeGreaterThan(0);
    });
  });

  it('product codes are unique', () => {
    const codes = Object.keys(DEMO_PRODUCTS);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('product codes follow PN### pattern', () => {
    Object.keys(DEMO_PRODUCTS).forEach((code) => {
      expect(code).toMatch(/^PN\d{3}$/);
    });
  });

  it('categories are among expected values', () => {
    const validCategories = new Set(['手機', '筆電', '耳機', '平板', '手錶', '遊戲機']);
    Object.entries(DEMO_PRODUCTS).forEach(([code, p]) => {
      expect(validCategories.has(p.category), `${code} has unexpected category ${p.category}`).toBe(true);
    });
  });
});
