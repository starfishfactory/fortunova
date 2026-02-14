import { hash, compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { getDatabase } from '@/db/connection.js';
import { config } from '@/config.js';

export interface RegisterInput {
  email: string;
  password: string;
  gender: 'M' | 'F';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour?: number;
  isLunar?: boolean;
  isLeapMonth?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  gender: 'M' | 'F';
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number | null;
  isLunar: boolean;
  isLeapMonth: boolean;
}

function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(config.jwtSecret);
}

export async function register(input: RegisterInput): Promise<{ user: AuthUser; token: string }> {
  const db = getDatabase();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(input.email);
  if (existing) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const passwordHash = await hash(input.password, config.bcryptSaltRounds);
  const now = new Date().toISOString();

  const result = db.prepare(
    `INSERT INTO users (email, password_hash, gender, birth_year, birth_month, birth_day, birth_hour, is_lunar, is_leap_month, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    input.email,
    passwordHash,
    input.gender,
    input.birthYear,
    input.birthMonth,
    input.birthDay,
    input.birthHour ?? null,
    input.isLunar ? 1 : 0,
    input.isLeapMonth ? 1 : 0,
    now,
    now,
  );

  const user: AuthUser = {
    id: result.lastInsertRowid as number,
    email: input.email,
    gender: input.gender,
    birthYear: input.birthYear,
    birthMonth: input.birthMonth,
    birthDay: input.birthDay,
    birthHour: input.birthHour ?? null,
    isLunar: input.isLunar ?? false,
    isLeapMonth: input.isLeapMonth ?? false,
  };

  const token = await createToken(user.id, user.email);
  return { user, token };
}

export async function login(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
  const db = getDatabase();

  const row = db.prepare(
    'SELECT id, email, password_hash, gender, birth_year, birth_month, birth_day, birth_hour, is_lunar, is_leap_month FROM users WHERE email = ?',
  ).get(input.email) as {
    id: number;
    email: string;
    password_hash: string;
    gender: 'M' | 'F';
    birth_year: number;
    birth_month: number;
    birth_day: number;
    birth_hour: number | null;
    is_lunar: number;
    is_leap_month: number;
  } | undefined;

  if (!row) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const passwordMatch = await compare(input.password, row.password_hash);
  if (!passwordMatch) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const user: AuthUser = {
    id: row.id,
    email: row.email,
    gender: row.gender,
    birthYear: row.birth_year,
    birthMonth: row.birth_month,
    birthDay: row.birth_day,
    birthHour: row.birth_hour,
    isLunar: !!row.is_lunar,
    isLeapMonth: !!row.is_leap_month,
  };

  const token = await createToken(user.id, user.email);
  return { user, token };
}

export async function verifyToken(token: string): Promise<{ userId: number; email: string }> {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return {
    userId: payload.userId as number,
    email: payload.email as string,
  };
}

async function createToken(userId: number, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(config.jwtExpiresIn)
    .sign(getJwtSecret());
}
