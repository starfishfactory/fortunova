export type AppVariables = {
  user?: { userId: number; email: string };
  identifier: string;
  identifierType: 'user' | 'anonymous';
};

export type AppEnv = {
  Variables: AppVariables;
};
