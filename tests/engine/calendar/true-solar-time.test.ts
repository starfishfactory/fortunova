import { describe, it, expect } from 'vitest';
import { calculateTrueSolarTime, adjustHourForTrueSolarTime } from '@/engine/calendar/true-solar-time.js';

describe('calculateTrueSolarTime', () => {
  // 서울 경도 126.98°, 표준시 경도 135.0°
  // 경도 보정: (126.98 - 135.0) × 4 = -32.08분

  it('서울에서 정오(12:00)의 진태양시를 계산한다', () => {
    // 2024-03-20 (춘분 근처, 균시차 ≈ -7.5분)
    const result = calculateTrueSolarTime(
      { year: 2024, month: 3, day: 20 }, 12, 0, 126.98
    );
    // 12:00 - 32.08(경도) - 7.5(균시차) ≈ 11:20
    expect(result.hour).toBe(11);
    expect(result.minute).toBeGreaterThanOrEqual(15);
    expect(result.minute).toBeLessThanOrEqual(25);
  });

  it('표준시 경도(135°)에서는 경도 보정이 0이다', () => {
    const result = calculateTrueSolarTime(
      { year: 2024, month: 6, day: 21 }, 12, 0, 135.0
    );
    // 경도 보정 = 0, 하지 근처 균시차 ≈ -1.5분
    expect(result.hour).toBe(11);
    expect(result.minute).toBeGreaterThanOrEqual(55);
  });

  it('경도에 따라 보정값이 달라진다', () => {
    const date = { year: 2024, month: 9, day: 23 }; // 추분
    const seoulResult = calculateTrueSolarTime(date, 12, 0, 126.98);
    const standardResult = calculateTrueSolarTime(date, 12, 0, 135.0);
    // 서울이 표준시보다 약 32분 느림
    const seoulMinutes = seoulResult.hour * 60 + seoulResult.minute;
    const standardMinutes = standardResult.hour * 60 + standardResult.minute;
    expect(standardMinutes - seoulMinutes).toBeGreaterThanOrEqual(28);
    expect(standardMinutes - seoulMinutes).toBeLessThanOrEqual(36);
  });

  it('자정(0시) 근처에서 올바르게 처리한다', () => {
    const result = calculateTrueSolarTime(
      { year: 2024, month: 1, day: 15 }, 0, 30, 126.98
    );
    // 0:30 - 32(경도) - 9(균시차) ≈ 23:49 전날
    expect(result.hour).toBe(23);
    expect(result.minute).toBeGreaterThanOrEqual(40);
  });

  it('24시를 넘어갈 때 올바르게 처리한다', () => {
    // 동쪽 경도(135도보다 크면 보정이 +)에서 늦은 시간
    const result = calculateTrueSolarTime(
      { year: 2024, month: 11, day: 3 }, 23, 50, 140.0
    );
    // 23:50 + 20(경도) + 16(균시차) ≈ 00:26 다음날
    expect(result.hour).toBeGreaterThanOrEqual(0);
    expect(result.hour).toBeLessThanOrEqual(1);
  });

  it('균시차가 양수인 시기에도 올바르게 계산한다', () => {
    // 11월 초: 균시차 약 +16분
    const result = calculateTrueSolarTime(
      { year: 2024, month: 11, day: 3 }, 12, 0, 126.98
    );
    // 12:00 - 32(경도) + 16(균시차) ≈ 11:44
    expect(result.hour).toBe(11);
    expect(result.minute).toBeGreaterThanOrEqual(38);
    expect(result.minute).toBeLessThanOrEqual(50);
  });

  it('균시차가 음수인 시기에도 올바르게 계산한다', () => {
    // 2월 중순: 균시차 약 -14분
    const result = calculateTrueSolarTime(
      { year: 2024, month: 2, day: 15 }, 12, 0, 126.98
    );
    // 12:00 - 32(경도) - 14(균시차) ≈ 11:14
    expect(result.hour).toBe(11);
    expect(result.minute).toBeGreaterThanOrEqual(10);
    expect(result.minute).toBeLessThanOrEqual(20);
  });
});

describe('adjustHourForTrueSolarTime', () => {
  it('서울에서 시주 시간을 보정한다', () => {
    const result = adjustHourForTrueSolarTime(
      14, { year: 2024, month: 5, day: 15 }, 126.98
    );
    // 14시 - 32분(경도) + 약 4분(균시차) ≈ 13:32
    expect(result).toBe(13);
  });

  it('23시를 보정하면 전날 시간이 될 수 있다', () => {
    // 0시에 가까운 시간, 서울 보정 = -32분
    const result = adjustHourForTrueSolarTime(
      0, { year: 2024, month: 1, day: 15 }, 126.98
    );
    // 0:00 - 32(경도) - 9(균시차) ≈ 23시
    expect(result).toBe(23);
  });

  it('보정 없는 경도에서는 시간이 거의 변하지 않는다', () => {
    const result = adjustHourForTrueSolarTime(
      14, { year: 2024, month: 6, day: 21 }, 135.0
    );
    // 경도 보정 0, 균시차 약 -1.5분
    expect(result).toBe(13);
  });
});
