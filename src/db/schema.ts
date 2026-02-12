import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

// SDD 3.2.1 ERD: users 테이블
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  gender: text('gender', { enum: ['M', 'F'] }).notNull(),
  birthYear: integer('birth_year').notNull(),
  birthMonth: integer('birth_month').notNull(),
  birthDay: integer('birth_day').notNull(),
  birthHour: integer('birth_hour'),
  isLunar: integer('is_lunar').notNull().default(0),
  isLeapMonth: integer('is_leap_month').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// SDD 3.2.1 ERD: fortune_cache 테이블
export const fortuneCache = sqliteTable('fortune_cache', {
  cacheKey: text('cache_key').primaryKey(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  systemId: text('system_id').notNull(),
  sajuData: text('saju_data').notNull(),
  fortune: text('fortune').notNull(),
  score: integer('score'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_fortune_cache_date').on(table.date),
  index('idx_fortune_cache_expires').on(table.expiresAt),
]);

// SDD 3.2.1 ERD: daily_usage 테이블
export const dailyUsage = sqliteTable('daily_usage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  identifier: text('identifier').notNull(),
  identifierType: text('identifier_type', { enum: ['user', 'anonymous'] }).notNull(),
  date: text('date').notNull(),
  count: integer('count').notNull().default(0),
}, (table) => [
  uniqueIndex('idx_daily_usage_unique').on(table.identifier, table.date),
]);

// SDD 3.2.1 ERD: subscriptions 테이블
export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  plan: text('plan', { enum: ['monthly', 'yearly'] }).notNull(),
  status: text('status', { enum: ['active', 'cancelled', 'expired'] }).notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_subscriptions_user').on(table.userId),
]);

// SDD 3.2.1 ERD: payments 테이블
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed', 'refunded'] }).notNull(),
  provider: text('provider', { enum: ['toss', 'kakao'] }).notNull(),
  providerPaymentId: text('provider_payment_id'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_payments_user').on(table.userId),
]);
