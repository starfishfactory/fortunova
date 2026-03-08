export type AppVariables = {
  user?: { userId: number; email: string };
  identifier: string;
  identifierType: 'user' | 'anonymous';
  isSubscriber: boolean;
};

export type AppEnv = {
  Variables: AppVariables;
};
