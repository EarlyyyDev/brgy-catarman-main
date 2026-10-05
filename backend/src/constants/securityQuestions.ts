// Preset list for self-service password recovery -- kept as a fixed set
// (rather than free-typed questions) so answers stay reasonably hard to
// guess/social-engineer. Must stay in sync with the frontend's copy
// (frontend/lib/security-questions.ts) since the backend validates every
// submitted question string against this exact list.
export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What was your favorite childhood nickname?",
  "What city were you born in?",
  "What was your first job?",
  "What is the name of your best childhood friend?",
  "What was the make/model of your first vehicle?",
] as const;
