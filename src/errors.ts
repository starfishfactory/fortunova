export const ErrorCodes = {
  INVALID_BIRTH_DATA: { status: 400, code: 'INVALID_BIRTH_DATA', message: '생년월일시 유효성 검증 실패' },
  VALIDATION_ERROR: { status: 400, code: 'VALIDATION_ERROR', message: '입력값이 올바르지 않습니다' },
  UNSUPPORTED_SYSTEM: { status: 400, code: 'UNSUPPORTED_SYSTEM', message: '지원하지 않는 운세 시스템' },
  UNAUTHORIZED: { status: 401, code: 'UNAUTHORIZED', message: '인증이 필요합니다' },
  INVALID_CREDENTIALS: { status: 401, code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다' },
  EMAIL_ALREADY_EXISTS: { status: 409, code: 'EMAIL_ALREADY_EXISTS', message: '이미 등록된 이메일입니다' },
  DAILY_LIMIT_EXCEEDED: { status: 429, code: 'DAILY_LIMIT_EXCEEDED', message: '일일 무료 3회 초과' },
  LLM_UNAVAILABLE: { status: 503, code: 'LLM_UNAVAILABLE', message: 'AI 서비스 일시 불가' },
} as const;
