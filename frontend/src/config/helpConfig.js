function cleanEnv(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeWhatsappNumber(raw) {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Membaca konfigurasi kontak publik Pusat Bantuan dari environment Vite.
 * Jika tidak ada kanal yang terkonfigurasi, isConfigured bernilai false dan UI memakai fallback jujur.
 */
export function getHelpConfiguration({ isDemo = false } = {}) {
  if (isDemo) {
    return {
      isDemo: true,
      isConfigured: false,
      schoolLabel: 'Sekolah Contoh (Mode Demonstrasi)',
      contactLabel: 'Guru BK (Contoh Fiktif)',
      serviceHours: 'Senin–Jumat, 08.00–14.00',
      timeZone: 'WIB',
      verifiedAt: 'Contoh fiktif',
      channels: [],
    };
  }

  const schoolLabel = cleanEnv(import.meta.env.VITE_HELP_SCHOOL_LABEL);
  const contactLabel = cleanEnv(import.meta.env.VITE_HELP_CONTACT_LABEL);
  const whatsappRaw = cleanEnv(import.meta.env.VITE_HELP_WHATSAPP);
  const emailRaw = cleanEnv(import.meta.env.VITE_HELP_EMAIL);
  const serviceHours = cleanEnv(import.meta.env.VITE_HELP_SERVICE_HOURS);
  const timeZone = cleanEnv(import.meta.env.VITE_HELP_TIMEZONE) || 'WIB';
  const verifiedAt = cleanEnv(import.meta.env.VITE_HELP_VERIFIED_AT);

  const channels = [];
  const waDigits = normalizeWhatsappNumber(whatsappRaw);
  if (waDigits.length >= 9) {
    const defaultMessage = encodeURIComponent('Saya ingin mengetahui cara menghubungi Guru BK');
    channels.push({
      id: 'whatsapp',
      type: 'whatsapp',
      label: 'WhatsApp Guru BK',
      actionLabel: 'Lanjut ke WhatsApp',
      displayAddress: whatsappRaw,
      href: `https://wa.me/${waDigits}?text=${defaultMessage}`,
    });
  }

  if (emailRaw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
    const subject = encodeURIComponent('Pertanyaan layanan BK');
    const body = encodeURIComponent('Saya ingin mengetahui cara menghubungi Guru BK.');
    channels.push({
      id: 'email',
      type: 'email',
      label: 'Email Guru BK',
      actionLabel: 'Lanjut ke email',
      displayAddress: emailRaw,
      href: `mailto:${emailRaw}?subject=${subject}&body=${body}`,
    });
  }

  const isConfigured = channels.length > 0;

  return {
    isDemo: false,
    isConfigured,
    schoolLabel,
    contactLabel: contactLabel || 'Pendamping',
    serviceHours,
    timeZone,
    verifiedAt,
    channels,
  };
}
