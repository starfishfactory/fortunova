import { describe, it, expect } from 'vitest';
import { getTableName, getTableColumns } from 'drizzle-orm';
import { users, fortuneCache, dailyUsage, subscriptions, payments } from '../../src/db/schema.js';

describe('DB Schema', () => {
  describe('users 테이블', () => {
    it('테이블명이 users이다', () => {
      expect(getTableName(users)).toBe('users');
    });

    it('필수 컬럼이 모두 존재한다', () => {
      const columns = getTableColumns(users);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('passwordHash');
      expect(columnNames).toContain('gender');
      expect(columnNames).toContain('birthYear');
      expect(columnNames).toContain('birthMonth');
      expect(columnNames).toContain('birthDay');
      expect(columnNames).toContain('birthHour');
      expect(columnNames).toContain('isLunar');
      expect(columnNames).toContain('isLeapMonth');
      expect(columnNames).toContain('createdAt');
      expect(columnNames).toContain('updatedAt');
    });

    it('id가 primary key이다', () => {
      const columns = getTableColumns(users);
      expect(columns.id.primary).toBe(true);
    });

    it('birthHour은 nullable이다', () => {
      const columns = getTableColumns(users);
      expect(columns.birthHour.notNull).toBe(false);
    });
  });

  describe('fortune_cache 테이블', () => {
    it('테이블명이 fortune_cache이다', () => {
      expect(getTableName(fortuneCache)).toBe('fortune_cache');
    });

    it('필수 컬럼이 모두 존재한다', () => {
      const columns = getTableColumns(fortuneCache);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain('cacheKey');
      expect(columnNames).toContain('date');
      expect(columnNames).toContain('category');
      expect(columnNames).toContain('systemId');
      expect(columnNames).toContain('sajuData');
      expect(columnNames).toContain('fortune');
      expect(columnNames).toContain('score');
      expect(columnNames).toContain('expiresAt');
      expect(columnNames).toContain('createdAt');
    });

    it('cacheKey가 primary key이다', () => {
      const columns = getTableColumns(fortuneCache);
      expect(columns.cacheKey.primary).toBe(true);
    });

    it('score는 nullable이다', () => {
      const columns = getTableColumns(fortuneCache);
      expect(columns.score.notNull).toBe(false);
    });
  });

  describe('daily_usage 테이블', () => {
    it('테이블명이 daily_usage이다', () => {
      expect(getTableName(dailyUsage)).toBe('daily_usage');
    });

    it('필수 컬럼이 모두 존재한다', () => {
      const columns = getTableColumns(dailyUsage);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('identifier');
      expect(columnNames).toContain('identifierType');
      expect(columnNames).toContain('date');
      expect(columnNames).toContain('count');
    });

    it('id가 primary key이다', () => {
      const columns = getTableColumns(dailyUsage);
      expect(columns.id.primary).toBe(true);
    });
  });

  describe('subscriptions 테이블', () => {
    it('테이블명이 subscriptions이다', () => {
      expect(getTableName(subscriptions)).toBe('subscriptions');
    });

    it('필수 컬럼이 모두 존재한다', () => {
      const columns = getTableColumns(subscriptions);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('userId');
      expect(columnNames).toContain('plan');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('startDate');
      expect(columnNames).toContain('endDate');
      expect(columnNames).toContain('createdAt');
    });
  });

  describe('payments 테이블', () => {
    it('테이블명이 payments이다', () => {
      expect(getTableName(payments)).toBe('payments');
    });

    it('필수 컬럼이 모두 존재한다', () => {
      const columns = getTableColumns(payments);
      const columnNames = Object.keys(columns);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('userId');
      expect(columnNames).toContain('amount');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('provider');
      expect(columnNames).toContain('providerPaymentId');
      expect(columnNames).toContain('createdAt');
    });

    it('providerPaymentId는 nullable이다', () => {
      const columns = getTableColumns(payments);
      expect(columns.providerPaymentId.notNull).toBe(false);
    });
  });
});
