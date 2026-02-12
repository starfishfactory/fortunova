/**
 * 한국 음력 년도별 데이터 (시헌력 기반)
 *
 * 데이터 출처: korean-lunar-calendar npm 패키지에서 디코딩
 * 검증: 한국천문연구원(KASI) 음양력 변환 데이터와 교차 검증
 */

export interface LunarYearInfo {
  /** 각 월의 일수를 비트로 표현 (1=30일, 0=29일), 비트 12~1 */
  monthDays: number;
  /** 윤달 월 (0이면 윤달 없음, 1-12) */
  leapMonth: number;
  /** 윤달 일수 (0=29일, 1=30일) */
  leapDays: 0 | 1;
}

/**
 * 1950-2050년 음력 데이터
 *
 * monthDays 비트 배치:
 *   비트 12 = 1월, 비트 11 = 2월, ..., 비트 1 = 12월
 *   1 = 30일(대월), 0 = 29일(소월)
 */
export const LUNAR_YEAR_DATA: Record<number, LunarYearInfo> = {
  1949: { monthDays: 0b1101010101010, leapMonth: 7, leapDays: 0 },
  1950: { monthDays: 0b1011010010100, leapMonth: 0, leapDays: 0 },
  1951: { monthDays: 0b1011010101010, leapMonth: 0, leapDays: 0 },
  1952: { monthDays: 0b0101010101010, leapMonth: 5, leapDays: 1 },
  1953: { monthDays: 0b0100110110110, leapMonth: 0, leapDays: 0 },
  1954: { monthDays: 0b0010010110110, leapMonth: 0, leapDays: 0 },
  1955: { monthDays: 0b1000010101110, leapMonth: 3, leapDays: 1 },
  1956: { monthDays: 0b0101001010110, leapMonth: 0, leapDays: 0 },
  1957: { monthDays: 0b1010100110110, leapMonth: 8, leapDays: 0 },
  1958: { monthDays: 0b0110100101010, leapMonth: 0, leapDays: 0 },
  1959: { monthDays: 0b0110101010100, leapMonth: 0, leapDays: 0 },
  1960: { monthDays: 0b1010111010100, leapMonth: 6, leapDays: 0 },
  1961: { monthDays: 0b1010101101010, leapMonth: 0, leapDays: 0 },
  1962: { monthDays: 0b0100101101100, leapMonth: 0, leapDays: 0 },
  1963: { monthDays: 0b1010101011100, leapMonth: 4, leapDays: 0 },
  1964: { monthDays: 0b1010010101110, leapMonth: 0, leapDays: 0 },
  1965: { monthDays: 0b0101001001110, leapMonth: 0, leapDays: 0 },
  1966: { monthDays: 0b0111001001100, leapMonth: 3, leapDays: 0 },
  1967: { monthDays: 0b1101100101010, leapMonth: 0, leapDays: 0 },
  1968: { monthDays: 0b0110101101010, leapMonth: 7, leapDays: 0 },
  1969: { monthDays: 0b0101011010100, leapMonth: 0, leapDays: 0 },
  1970: { monthDays: 0b1001101011010, leapMonth: 0, leapDays: 0 },
  1971: { monthDays: 0b0100110111010, leapMonth: 5, leapDays: 0 },
  1972: { monthDays: 0b0100101011100, leapMonth: 0, leapDays: 0 },
  1973: { monthDays: 0b1010010011100, leapMonth: 0, leapDays: 0 },
  1974: { monthDays: 0b1101010011010, leapMonth: 4, leapDays: 0 },
  1975: { monthDays: 0b1101001001010, leapMonth: 0, leapDays: 0 },
  1976: { monthDays: 0b1101010110010, leapMonth: 8, leapDays: 0 },
  1977: { monthDays: 0b1011010101000, leapMonth: 0, leapDays: 0 },
  1978: { monthDays: 0b1101011010100, leapMonth: 0, leapDays: 0 },
  1979: { monthDays: 0b1001010110100, leapMonth: 6, leapDays: 1 },
  1980: { monthDays: 0b1001010110110, leapMonth: 0, leapDays: 0 },
  1981: { monthDays: 0b0100100110110, leapMonth: 0, leapDays: 0 },
  1982: { monthDays: 0b1010100110110, leapMonth: 4, leapDays: 0 },
  1983: { monthDays: 0b1010010010110, leapMonth: 0, leapDays: 0 },
  1984: { monthDays: 0b1011001001110, leapMonth: 10, leapDays: 0 },
  1985: { monthDays: 0b0110101001010, leapMonth: 0, leapDays: 0 },
  1986: { monthDays: 0b0110110101000, leapMonth: 0, leapDays: 0 },
  1987: { monthDays: 0b1011011101010, leapMonth: 6, leapDays: 0 },
  1988: { monthDays: 0b0010101101100, leapMonth: 0, leapDays: 0 },
  1989: { monthDays: 0b1001010110110, leapMonth: 0, leapDays: 0 },
  1990: { monthDays: 0b0100101101110, leapMonth: 5, leapDays: 0 },
  1991: { monthDays: 0b0100100101110, leapMonth: 0, leapDays: 0 },
  1992: { monthDays: 0b0110010010110, leapMonth: 0, leapDays: 0 },
  1993: { monthDays: 0b0111010010100, leapMonth: 3, leapDays: 0 },
  1994: { monthDays: 0b1110101001010, leapMonth: 0, leapDays: 0 },
  1995: { monthDays: 0b0110110110010, leapMonth: 8, leapDays: 0 },
  1996: { monthDays: 0b0101101011010, leapMonth: 0, leapDays: 0 },
  1997: { monthDays: 0b0010101101100, leapMonth: 0, leapDays: 0 },
  1998: { monthDays: 0b1001011011100, leapMonth: 5, leapDays: 0 },
  1999: { monthDays: 0b1001001011100, leapMonth: 0, leapDays: 0 },
  2000: { monthDays: 0b1100100101100, leapMonth: 0, leapDays: 0 },
  2001: { monthDays: 0b1110100101010, leapMonth: 4, leapDays: 0 },
  2002: { monthDays: 0b1101010010100, leapMonth: 0, leapDays: 0 },
  2003: { monthDays: 0b1101101001010, leapMonth: 0, leapDays: 0 },
  2004: { monthDays: 0b0111010101010, leapMonth: 2, leapDays: 0 },
  2005: { monthDays: 0b0101011011000, leapMonth: 0, leapDays: 0 },
  2006: { monthDays: 0b1010101110110, leapMonth: 7, leapDays: 0 },
  2007: { monthDays: 0b0010010111010, leapMonth: 0, leapDays: 0 },
  2008: { monthDays: 0b1001001011010, leapMonth: 0, leapDays: 0 },
  2009: { monthDays: 0b1100101010110, leapMonth: 5, leapDays: 0 },
  2010: { monthDays: 0b1010100101010, leapMonth: 0, leapDays: 0 },
  2011: { monthDays: 0b1011010010100, leapMonth: 0, leapDays: 0 },
  2012: { monthDays: 0b1011010010100, leapMonth: 3, leapDays: 1 },
  2013: { monthDays: 0b1011010101010, leapMonth: 0, leapDays: 0 },
  2014: { monthDays: 0b0101010111010, leapMonth: 9, leapDays: 0 },
  2015: { monthDays: 0b0100101110100, leapMonth: 0, leapDays: 0 },
  2016: { monthDays: 0b1010010110110, leapMonth: 0, leapDays: 0 },
  2017: { monthDays: 0b0101010101110, leapMonth: 5, leapDays: 0 },
  2018: { monthDays: 0b0101001010110, leapMonth: 0, leapDays: 0 },
  2019: { monthDays: 0b1010100101010, leapMonth: 0, leapDays: 0 },
  2020: { monthDays: 0b1011100101010, leapMonth: 4, leapDays: 0 },
  2021: { monthDays: 0b0110101010100, leapMonth: 0, leapDays: 0 },
  2022: { monthDays: 0b1010110101010, leapMonth: 0, leapDays: 0 },
  2023: { monthDays: 0b0110101101010, leapMonth: 2, leapDays: 0 },
  2024: { monthDays: 0b0100101101100, leapMonth: 0, leapDays: 0 },
  2025: { monthDays: 0b1010011011100, leapMonth: 6, leapDays: 0 },
  2026: { monthDays: 0b1010010101110, leapMonth: 0, leapDays: 0 },
  2027: { monthDays: 0b0101001001110, leapMonth: 0, leapDays: 0 },
  2028: { monthDays: 0b0110101001100, leapMonth: 5, leapDays: 0 },
  2029: { monthDays: 0b1101100100110, leapMonth: 0, leapDays: 0 },
  2030: { monthDays: 0b0101101010100, leapMonth: 0, leapDays: 0 },
  2031: { monthDays: 0b1011011010100, leapMonth: 3, leapDays: 0 },
  2032: { monthDays: 0b1001011011010, leapMonth: 0, leapDays: 0 },
  2033: { monthDays: 0b0100101011110, leapMonth: 11, leapDays: 0 },
  2034: { monthDays: 0b0100101011100, leapMonth: 0, leapDays: 0 },
  2035: { monthDays: 0b1010010011010, leapMonth: 0, leapDays: 0 },
  2036: { monthDays: 0b1101000011010, leapMonth: 6, leapDays: 1 },
  2037: { monthDays: 0b1101001001010, leapMonth: 0, leapDays: 0 },
  2038: { monthDays: 0b1101010100100, leapMonth: 0, leapDays: 0 },
  2039: { monthDays: 0b1101110101000, leapMonth: 5, leapDays: 0 },
  2040: { monthDays: 0b1011011010100, leapMonth: 0, leapDays: 0 },
  2041: { monthDays: 0b1001011011010, leapMonth: 0, leapDays: 0 },
  2042: { monthDays: 0b0101010110110, leapMonth: 2, leapDays: 0 },
  2043: { monthDays: 0b0100100110110, leapMonth: 0, leapDays: 0 },
  2044: { monthDays: 0b1010010101110, leapMonth: 7, leapDays: 0 },
  2045: { monthDays: 0b1010010010110, leapMonth: 0, leapDays: 0 },
  2046: { monthDays: 0b1011001001010, leapMonth: 0, leapDays: 0 },
  2047: { monthDays: 0b1011001001010, leapMonth: 5, leapDays: 1 },
  2048: { monthDays: 0b0110110101000, leapMonth: 0, leapDays: 0 },
  2049: { monthDays: 0b1010110110100, leapMonth: 0, leapDays: 0 },
  2050: { monthDays: 0b1000101101100, leapMonth: 3, leapDays: 1 },
};

/**
 * 특정 년도의 특정 월 일수를 반환한다
 */
export function getLunarMonthDays(year: number, month: number, isLeapMonth: boolean = false): number {
  const info = LUNAR_YEAR_DATA[year];
  if (!info) {
    throw new Error(`음력 데이터가 없는 년도입니다: ${year}`);
  }
  if (isLeapMonth) {
    if (info.leapMonth !== month) {
      throw new Error(`${year}년 ${month}월은 윤달이 아닙니다`);
    }
    return info.leapDays ? 30 : 29;
  }
  const bit = (info.monthDays >> (13 - month)) & 1;
  return bit ? 30 : 29;
}

/**
 * 특정 년도의 총 음력 일수를 반환한다
 */
export function getLunarYearDays(year: number): number {
  const info = LUNAR_YEAR_DATA[year];
  if (!info) {
    throw new Error(`음력 데이터가 없는 년도입니다: ${year}`);
  }
  let totalDays = 0;
  for (let month = 1; month <= 12; month++) {
    const bit = (info.monthDays >> (13 - month)) & 1;
    totalDays += bit ? 30 : 29;
  }
  if (info.leapMonth > 0) {
    totalDays += info.leapDays ? 30 : 29;
  }
  return totalDays;
}
