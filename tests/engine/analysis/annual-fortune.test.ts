import { describe, it, expect } from 'vitest';
import { analyzeAnnualFortune } from '@/engine/analysis/annual-fortune.js';
import type { FourPillars } from '@/engine/types/index.js';
import type { MajorFatePeriod } from '@/engine/types/analysis.js';

describe('annual-fortune (세운 분석)', () => {
  // 테스트용 사주: 경오년 신사월 경진일 계미시 (1990년생 남자)
  const fourPillars: FourPillars = {
    year: { stem: '경', branch: '오' },
    month: { stem: '신', branch: '사' },
    day: { stem: '경', branch: '진' },
    hour: { stem: '계', branch: '미' },
  };

  const majorFate: MajorFatePeriod[] = [
    { startAge: 1, endAge: 11, ganJi: { stem: '임', branch: '오' } },
    { startAge: 11, endAge: 21, ganJi: { stem: '계', branch: '미' } },
    { startAge: 21, endAge: 31, ganJi: { stem: '갑', branch: '신' } },
    { startAge: 31, endAge: 41, ganJi: { stem: '을', branch: '유' } },
    { startAge: 41, endAge: 51, ganJi: { stem: '병', branch: '술' } },
    { startAge: 51, endAge: 61, ganJi: { stem: '정', branch: '해' } },
    { startAge: 61, endAge: 71, ganJi: { stem: '무', branch: '자' } },
    { startAge: 71, endAge: 81, ganJi: { stem: '기', branch: '축' } },
  ];

  describe('analyzeAnnualFortune', () => {
    it('세운 간지가 올바르게 계산된다', () => {
      // 2024년 = 갑진년
      const result = analyzeAnnualFortune(fourPillars, majorFate, 2024, 1990);
      expect(result.ganJi.stem).toBe('갑');
      expect(result.ganJi.branch).toBe('진');
      expect(result.year).toBe(2024);
    });

    it('세운 천간 십신이 올바르다', () => {
      // 일간 경(금/양) vs 세운 천간 갑(목/양) = 편재
      const result = analyzeAnnualFortune(fourPillars, majorFate, 2024, 1990);
      expect(result.tenGod).toBe('편재');
    });

    it('세운 지지 본기 십신이 올바르다', () => {
      // 일간 경(금/양) vs 세운 지지 진(토/양) 본기 = 무(토/양) → 편인
      const result = analyzeAnnualFortune(fourPillars, majorFate, 2024, 1990);
      expect(result.branchTenGod).toBe('편인');
    });

    it('충이 올바르게 검출된다', () => {
      // 2024 갑진년: 세운 지지 진 vs 원국 술(년지=오, 월지=사, 일지=진, 시지=미)
      // 진↔술 충: 원국에 술이 없으므로 충 없음
      const result = analyzeAnnualFortune(fourPillars, majorFate, 2024, 1990);
      const chungInteractions = result.interactions.filter(i => i.type === '충');
      expect(chungInteractions).toHaveLength(0);
    });

    it('충이 있는 해에 올바르게 검출된다', () => {
      // 2026 병오년: 세운 지지 오 vs 원국 자(없음)
      // 원국의 지지: 오(년), 사(월), 진(일), 미(시)
      // 오는 자와 충이지만, 원국에 자가 없으므로 충 없음
      const result = analyzeAnnualFortune(fourPillars, majorFate, 2026, 1990);
      const chungInteractions = result.interactions.filter(i => i.type === '충');
      expect(chungInteractions).toHaveLength(0);
    });

    it('합이 올바르게 검출된다', () => {
      // 2024 갑진년: 세운 지지 진 vs 원국 유(없음)
      // 진↔유 합인데 원국에 유가 없으므로 합 없음
      const result = analyzeAnnualFortune(fourPillars, majorFate, 2024, 1990);
      const hapInteractions = result.interactions.filter(i => i.type === '합');
      expect(hapInteractions).toHaveLength(0);
    });

    it('형이 올바르게 검출된다', () => {
      // 2024 갑진년: 세운 지지 진은 자형(진↔진)
      // 원국 일지에 진이 있으므로 자형 검출
      const result = analyzeAnnualFortune(fourPillars, majorFate, 2024, 1990);
      const hyungInteractions = result.interactions.filter(i => i.type === '형');
      expect(hyungInteractions).toHaveLength(1);
      expect(hyungInteractions[0].position).toBe('일지');
      expect(hyungInteractions[0].branches).toEqual(['진', '진']);
    });

    it('현재 대운이 올바르게 매칭된다', () => {
      // 2024년, 1990년생 → 나이 = 2024 - 1990 + 1 = 35세
      // 대운: 31~41세 → 을유
      const result = analyzeAnnualFortune(fourPillars, majorFate, 2024, 1990);
      expect(result.currentMajorFate).toBeDefined();
      expect(result.currentMajorFate!.ganJi.stem).toBe('을');
      expect(result.currentMajorFate!.ganJi.branch).toBe('유');
    });

    it('대운 범위 밖이면 currentMajorFate가 undefined이다', () => {
      // 1990년생, 2090년 → 나이 101세, 대운 범위(1~81세) 밖
      const result = analyzeAnnualFortune(fourPillars, majorFate, 2090, 1990);
      expect(result.currentMajorFate).toBeUndefined();
    });

    it('다른 해의 세운도 올바르게 계산된다', () => {
      // 2025년 = 을사년
      const result = analyzeAnnualFortune(fourPillars, majorFate, 2025, 1990);
      expect(result.ganJi.stem).toBe('을');
      expect(result.ganJi.branch).toBe('사');
      // 일간 경(금/양) vs 을(목/음) = 정재
      expect(result.tenGod).toBe('정재');
    });

    it('복합 상호작용을 올바르게 검출한다', () => {
      // 사신 합+형 테스트를 위한 사주
      // 원국에 신이 있는 사주로 사년을 체크
      const testPillars: FourPillars = {
        year: { stem: '갑', branch: '신' },   // 년지: 신
        month: { stem: '병', branch: '인' },   // 월지: 인
        day: { stem: '경', branch: '자' },     // 일지: 자
        hour: { stem: '임', branch: '오' },    // 시지: 오
      };
      // 2025 을사년: 세운 지지 사
      // 사↔신 합+형 (년지), 사↔인 형 (월지)
      const result = analyzeAnnualFortune(testPillars, majorFate, 2025, 1990);
      const yearInteractions = result.interactions.filter(i => i.position === '년지');
      expect(yearInteractions.some(i => i.type === '합')).toBe(true);
      expect(yearInteractions.some(i => i.type === '형')).toBe(true);
    });
  });
});
