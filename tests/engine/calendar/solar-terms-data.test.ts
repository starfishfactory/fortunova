import { describe, it, expect } from 'vitest';
import { SOLAR_TERMS_DATA, SOLAR_TERM_NAMES } from '@/engine/data/solar-terms-data.js';

describe('SOLAR_TERMS_DATA', () => {
  it('1950년부터 2050년까지 데이터를 포함한다', () => {
    for (let year = 1950; year <= 2050; year++) {
      expect(SOLAR_TERMS_DATA[year]).toBeDefined();
    }
  });

  it('각 년도에 24개 절기가 존재한다', () => {
    for (let year = 1950; year <= 2050; year++) {
      expect(SOLAR_TERMS_DATA[year]).toHaveLength(24);
    }
  });

  it('2024년 입춘이 2월 4일이다', () => {
    const ipchun = SOLAR_TERMS_DATA[2024][2]; // index 2 = 입춘
    expect(ipchun).toBe(204);
  });

  it('2025년 입춘이 2월 3일이다', () => {
    const ipchun = SOLAR_TERMS_DATA[2025][2];
    expect(ipchun).toBe(203);
  });

  it('2024년 동지가 12월 21일이다', () => {
    const dongji = SOLAR_TERMS_DATA[2024][23]; // index 23 = 동지
    expect(dongji).toBe(1221);
  });

  it('각 절기 날짜가 유효한 MMDD 형식이다', () => {
    for (let year = 1950; year <= 2050; year++) {
      const terms = SOLAR_TERMS_DATA[year];
      for (let i = 0; i < 24; i++) {
        const mmdd = terms[i];
        const month = Math.floor(mmdd / 100);
        const day = mmdd % 100;
        expect(month).toBeGreaterThanOrEqual(1);
        expect(month).toBeLessThanOrEqual(12);
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThanOrEqual(31);
      }
    }
  });

  it('소한은 항상 1월에 있다', () => {
    for (let year = 1950; year <= 2050; year++) {
      const sohan = SOLAR_TERMS_DATA[year][0];
      expect(Math.floor(sohan / 100)).toBe(1);
    }
  });

  it('입춘은 항상 2월에 있다', () => {
    for (let year = 1950; year <= 2050; year++) {
      const ipchun = SOLAR_TERMS_DATA[year][2];
      expect(Math.floor(ipchun / 100)).toBe(2);
    }
  });

  it('하지는 항상 6월에 있다', () => {
    for (let year = 1950; year <= 2050; year++) {
      const haji = SOLAR_TERMS_DATA[year][11];
      expect(Math.floor(haji / 100)).toBe(6);
    }
  });

  it('동지는 항상 12월에 있다', () => {
    for (let year = 1950; year <= 2050; year++) {
      const dongji = SOLAR_TERMS_DATA[year][23];
      expect(Math.floor(dongji / 100)).toBe(12);
    }
  });

  it('SOLAR_TERM_NAMES에 24개 절기 이름이 순서대로 있다', () => {
    expect(SOLAR_TERM_NAMES).toHaveLength(24);
    expect(SOLAR_TERM_NAMES[0]).toBe('소한');
    expect(SOLAR_TERM_NAMES[2]).toBe('입춘');
    expect(SOLAR_TERM_NAMES[11]).toBe('하지');
    expect(SOLAR_TERM_NAMES[23]).toBe('동지');
  });

  it('절기 날짜가 시간순으로 정렬되어 있다', () => {
    for (let year = 1950; year <= 2050; year++) {
      const terms = SOLAR_TERMS_DATA[year];
      for (let i = 1; i < 24; i++) {
        expect(terms[i]).toBeGreaterThan(terms[i - 1]);
      }
    }
  });
});
