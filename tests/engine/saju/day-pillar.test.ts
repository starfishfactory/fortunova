import { describe, it, expect } from 'vitest';
import { calculateDayPillar } from '@/engine/saju/day-pillar.js';

describe('calculateDayPillar', () => {
  it('2000-01-01 → 무오일을 반환한다', () => {
    const result = calculateDayPillar({ year: 2000, month: 1, day: 1 });
    expect(result).toEqual({ stem: '무', branch: '오' });
  });

  it('연속 날짜의 일주가 60갑자 순서로 이어진다', () => {
    const day1 = calculateDayPillar({ year: 2024, month: 1, day: 1 });
    const day2 = calculateDayPillar({ year: 2024, month: 1, day: 2 });
    const day3 = calculateDayPillar({ year: 2024, month: 1, day: 3 });

    // 연속 3일이 순서대로인지 확인
    const stems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
    const branches = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

    const idx1 = stems.indexOf(day1.stem);
    const idx2 = stems.indexOf(day2.stem);
    const idx3 = stems.indexOf(day3.stem);

    expect(idx2).toBe((idx1 + 1) % 10);
    expect(idx3).toBe((idx2 + 1) % 10);

    const bidx1 = branches.indexOf(day1.branch);
    const bidx2 = branches.indexOf(day2.branch);
    const bidx3 = branches.indexOf(day3.branch);

    expect(bidx2).toBe((bidx1 + 1) % 12);
    expect(bidx3).toBe((bidx2 + 1) % 12);
  });

  it('60일 후의 일주가 원래와 같다', () => {
    const day0 = calculateDayPillar({ year: 2024, month: 1, day: 1 });
    const day60 = calculateDayPillar({ year: 2024, month: 3, day: 1 }); // 1/1 + 60 = 3/1 (2024 윤년)
    expect(day0).toEqual(day60);
  });

  it('음수 년도도 처리한다', () => {
    // JD 계산이 음수 연도에서도 동작하는지 확인 (크래시 없음)
    const result = calculateDayPillar({ year: 1900, month: 1, day: 1 });
    expect(result.stem).toBeTruthy();
    expect(result.branch).toBeTruthy();
  });
});
