export const config = {
  port: Number(process.env.PORT) || 3000,
  databasePath: process.env.DATABASE_PATH || './data/fortunova.db',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  jwtExpiresIn: '24h',
  bcryptSaltRounds: 12,
  dailyFreeLimit: 3,
  maxOldSpaceSize: 384,
};
