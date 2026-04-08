/**
 * 입력 검증 유틸리티 함수
 * 
 * 사용자 입력 데이터의 유효성을 검증하여 보안과 데이터 무결성을 보장합니다.
 */

/**
 * 실명 검증
 * 
 * @param name - 검증할 실명
 * @returns 유효 여부
 * 
 * 규칙:
 * - 2자 이상 50자 이하
 * - 특수문자 제한: < > { } ( ) [ ] \ /
 */
export const validateRealName = (name: string): boolean => {
  const trimmed = name.trim();
  
  if (trimmed.length < 2 || trimmed.length > 50) {
    return false;
  }
  
  // 위험한 특수문자 차단 (XSS, SQL Injection 방지)
  const dangerousChars = /[<>{}()\[\]\\\/]/;
  if (dangerousChars.test(trimmed)) {
    return false;
  }
  
  return true;
};

/**
 * 실명 검증 에러 메시지
 */
export const getRealNameErrorMessage = (name: string): string | null => {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return '실명을 입력해주세요';
  }
  
  if (trimmed.length < 2) {
    return '실명은 2자 이상이어야 합니다';
  }
  
  if (trimmed.length > 50) {
    return '실명은 50자 이하여야 합니다';
  }
  
  if (/[<>{}()\[\]\\\/]/.test(trimmed)) {
    return '실명에 사용할 수 없는 특수문자가 포함되어 있습니다';
  }
  
  return null;
};

/**
 * 인스타그램 ID 검증
 * 
 * @param id - 검증할 인스타그램 ID (@ 제외)
 * @returns 유효 여부
 * 
 * 규칙:
 * - 1자 이상 30자 이하
 * - 영문, 숫자, 언더스코어(_), 마침표(.)만 허용
 * - 인스타그램 공식 규칙에 따름
 */
export const validateInstagramId = (id: string): boolean => {
  if (!id.trim()) {
    return true; // 선택 항목이므로 빈 값 허용
  }
  
  const instagramIdPattern = /^[a-zA-Z0-9._]{1,30}$/;
  return instagramIdPattern.test(id);
};

/**
 * 인스타그램 ID 검증 에러 메시지
 */
export const getInstagramIdErrorMessage = (id: string): string | null => {
  if (!id.trim()) {
    return null; // 선택 항목
  }
  
  if (id.length > 30) {
    return '인스타그램 ID는 30자 이하여야 합니다';
  }
  
  if (!/^[a-zA-Z0-9._]+$/.test(id)) {
    return '영문, 숫자, 언더스코어(_), 마침표(.)만 사용 가능합니다';
  }
  
  return null;
};

/**
 * 은행 계좌번호 검증
 * 
 * @param account - 검증할 계좌번호 (숫자만)
 * @returns 유효 여부
 * 
 * 규칙:
 * - 10자리 이상 20자리 이하
 * - 숫자만 허용
 * - 한국 은행 계좌번호 일반 규칙
 */
export const validateBankAccount = (account: string): boolean => {
  if (!account.trim()) {
    return false;
  }
  
  const accountPattern = /^\d{10,20}$/;
  return accountPattern.test(account);
};

/**
 * 은행 계좌번호 검증 에러 메시지
 */
export const getBankAccountErrorMessage = (account: string): string | null => {
  const trimmed = account.trim();
  
  if (trimmed.length === 0) {
    return '계좌번호를 입력해주세요';
  }
  
  if (!/^\d+$/.test(trimmed)) {
    return '계좌번호는 숫자만 입력 가능합니다';
  }
  
  if (trimmed.length < 10) {
    return '계좌번호는 10자리 이상이어야 합니다';
  }
  
  if (trimmed.length > 20) {
    return '계좌번호는 20자리 이하여야 합니다';
  }
  
  return null;
};

/**
 * 이메일 검증 (상명대 이메일 전용)
 * 
 * @param email - 검증할 이메일
 * @returns 유효 여부
 */
export const validateSangmyungEmail = (email: string): boolean => {
  if (!email.trim()) {
    return false;
  }
  
  return email.endsWith('@sangmyung.kr');
};

/**
 * 이메일 검증 에러 메시지
 */
export const getSangmyungEmailErrorMessage = (email: string): string | null => {
  const trimmed = email.trim();
  
  if (trimmed.length === 0) {
    return '이메일을 입력해주세요';
  }
  
  if (!trimmed.includes('@')) {
    return '올바른 이메일 형식이 아닙니다';
  }
  
  if (!trimmed.endsWith('@sangmyung.kr')) {
    return '상명대학교 이메일(@sangmyung.kr)만 사용 가능합니다';
  }
  
  return null;
};

/**
 * 전화번호 검증 (한국 휴대폰 번호)
 * 
 * @param phone - 검증할 전화번호 (하이픈 포함 가능)
 * @returns 유효 여부
 */
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone.trim()) {
    return false;
  }
  
  // 하이픈 제거
  const cleaned = phone.replace(/-/g, '');
  
  // 010, 011, 016, 017, 018, 019로 시작하는 11자리 숫자
  const phonePattern = /^01[0-9]\d{7,8}$/;
  return phonePattern.test(cleaned);
};

/**
 * 전화번호 검증 에러 메시지
 */
export const getPhoneNumberErrorMessage = (phone: string): string | null => {
  const trimmed = phone.trim();
  
  if (trimmed.length === 0) {
    return '전화번호를 입력해주세요';
  }
  
  const cleaned = trimmed.replace(/-/g, '');
  
  if (!/^\d+$/.test(cleaned)) {
    return '전화번호는 숫자만 입력 가능합니다';
  }
  
  if (!cleaned.startsWith('01')) {
    return '휴대폰 번호 형식이 올바르지 않습니다';
  }
  
  if (cleaned.length < 10 || cleaned.length > 11) {
    return '휴대폰 번호는 10-11자리여야 합니다';
  }
  
  return null;
};
