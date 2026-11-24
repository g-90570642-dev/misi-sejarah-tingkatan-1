const TEACHER_PIN_STORAGE_KEY = 'misi-sejarah-teacher-pin-v1';
export const DEFAULT_TEACHER_PIN = '1234';

export function loadTeacherPin(): string {
  try {
    const saved = localStorage.getItem(TEACHER_PIN_STORAGE_KEY);
    if (saved && /^\d{4,8}$/.test(saved.trim())) {
      return saved.trim();
    }
    return DEFAULT_TEACHER_PIN;
  } catch {
    return DEFAULT_TEACHER_PIN;
  }
}

export function saveTeacherPin(newPin: string): { ok: boolean; error?: string } {
  const clean = newPin.trim();
  if (!/^\d{4,8}$/.test(clean)) {
    return {
      ok: false,
      error: 'PIN mestilah mengandungi 4 hingga 8 digit nombor sahaja.',
    };
  }
  try {
    localStorage.setItem(TEACHER_PIN_STORAGE_KEY, clean);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan PIN guru dalam localStorage.',
    };
  }
}
