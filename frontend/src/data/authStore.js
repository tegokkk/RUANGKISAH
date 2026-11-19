export const ROLES = { SISWA: 'siswa', ADMIN: 'admin', SUPERADMIN: 'superadmin' };
export const ROLE_LABELS = { siswa: 'Siswa', admin: 'Admin', superadmin: 'Superadmin' };
export const ACCOUNT_STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  PENDING_APPROVAL: 'pending_approval',
};
export const ACCOUNT_STATUS_LABELS = {
  active: 'Aktif',
  disabled: 'Dinonaktifkan',
  pending_approval: 'Menunggu persetujuan Admin',
};
const ERROR_MESSAGES = {
  ACCOUNT_PENDING_APPROVAL:
    'Akunmu menunggu persetujuan Admin. Kamu dapat masuk setelah akun disetujui.',
  ACCOUNT_DISABLED: 'Akun ini dinonaktifkan.',
  INVALID_EMAIL_OR_PASSWORD: 'Email atau kata sandi tidak sesuai.',
  USER_ALREADY_EXISTS: 'Pendaftaran belum dapat diselesaikan. Coba masuk dengan akun yang ada.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'Pendaftaran belum dapat diselesaikan. Coba masuk dengan akun yang ada.',
  INVALID_TOKEN: 'Tautan tidak berlaku atau sudah kedaluwarsa.',
  PASSWORD_TOO_SHORT: 'Kata sandi minimal 10 karakter.',
  PASSWORD_TOO_LONG: 'Kata sandi maksimal 128 karakter.',
  TOO_MANY_REQUESTS: 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.',
};
export async function apiRequest(path, { method = 'GET', body } = {}) {
  try {
    const response = await fetch(path, {
      method,
      credentials: 'include',
      cache: 'no-store',
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data = await response.json();
    if (!response.ok)
      return {
        ok: false,
        errorCode: data.code || 'REQUEST_FAILED',
        message:
          ERROR_MESSAGES[data.code] ||
          (response.status === 429 ? ERROR_MESSAGES.TOO_MANY_REQUESTS : data.message) ||
          'Permintaan belum berhasil. Coba lagi.',
      };
    return { ...data, ok: true };
  } catch {
    return {
      ok: false,
      errorCode: 'NETWORK_ERROR',
      message:
        'Layanan akun belum dapat dihubungi. Coba lagi nanti. Masuk diperlukan untuk mengakses aktivitas refleksi.',
    };
  }
}
function normalizeUser(user) {
  if (!user) return null;
  return {
    ...user,
    displayName: user.displayName || user.name,
    status:
      user.status === 'disabled'
        ? 'disabled'
        : user.approvalStatus !== 'approved'
          ? 'pending_approval'
          : 'active',
  };
}
function callback(path) {
  return window.location.origin + path;
}
export const authStore = {
  async getSessionUser() {
    const result = await apiRequest('/api/me');
    const user = result.ok ? normalizeUser(result.user) : null;
    return user?.status === 'active' ? user : null;
  },
  async login({ email, password }) {
    const result = await apiRequest('/api/auth/sign-in/email', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), password },
    });
    if (!result.ok) return result;
    const user = normalizeUser(result.user);
    if (user?.status !== 'active')
      return {
        ok: false,
        errorCode: 'ACCOUNT_PENDING_APPROVAL',
        message: ERROR_MESSAGES.ACCOUNT_PENDING_APPROVAL,
      };
    return { ...result, user };
  },
  logout() {
    return apiRequest('/api/auth/sign-out', { method: 'POST', body: {} });
  },
  registerStudent({ displayName, email, password, agreed }) {
    return apiRequest('/api/auth/sign-up/email', {
      method: 'POST',
      body: {
        name: displayName.trim(),
        email: email.trim().toLowerCase(),
        password,
        termsAccepted: Boolean(agreed),
      },
    });
  },
  requestPasswordReset(email) {
    return apiRequest('/api/auth/request-password-reset', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), redirectTo: callback('/reset-kata-sandi') },
    });
  },
  resetPasswordWithToken(token, newPassword) {
    return apiRequest('/api/auth/reset-password', { method: 'POST', body: { token, newPassword } });
  },
  async updateOwnProfile(_id, { displayName }) {
    const result = await apiRequest('/api/auth/update-user', {
      method: 'POST',
      body: { name: displayName.trim() },
    });
    return result.ok ? { ok: true, user: await this.getSessionUser() } : result;
  },
  listAccounts() {
    return apiRequest('/api/admin/accounts');
  },
  listAuditLogs() {
    return apiRequest('/api/admin/audit');
  },
  deleteAccount(_actor, id) {
    return apiRequest('/api/admin/accounts/' + encodeURIComponent(id), { method: 'DELETE' });
  },
  setAccountStatus(_actor, id, status) {
    return apiRequest('/api/admin/accounts/' + encodeURIComponent(id) + '/status', {
      method: 'PATCH',
      body: { status },
    });
  },
  approveAccount(_actor, id) {
    return apiRequest('/api/admin/accounts/' + encodeURIComponent(id) + '/approval', {
      method: 'PATCH',
      body: { approvalStatus: 'approved' },
    });
  },
  setAccountRole(_actor, id, role) {
    return apiRequest('/api/admin/accounts/' + encodeURIComponent(id) + '/role', {
      method: 'PATCH',
      body: { role },
    });
  },
};
