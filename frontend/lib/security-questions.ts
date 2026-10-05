// Must stay in sync with backend/src/constants/securityQuestions.ts -- the
// backend validates every submitted question string against its own copy of
// this exact list.
export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What was your favorite childhood nickname?",
  "What city were you born in?",
  "What was your first job?",
  "What is the name of your best childhood friend?",
  "What was the make/model of your first vehicle?",
] as const
