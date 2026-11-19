export const FEELING_OPTIONS = [
  { id: 'senang', label: 'Senang', icon: 'sun' },
  { id: 'sedih', label: 'Sedih', icon: 'cloud-rain' },
  { id: 'cemas', label: 'Cemas', icon: 'wind' },
  { id: 'marah', label: 'Marah', icon: 'flame' },
  { id: 'tenang', label: 'Tenang', icon: 'leaf' },
  { id: 'bingung', label: 'Bingung', icon: 'compass' },
  { id: 'lainnya', label: 'Lainnya', icon: 'sparkles' },
];

export const JOURNAL_PROMPTS = [
  {
    id: 'situation',
    label: 'Apa yang terjadi?',
    helper: 'Ceritakan singkat situasi atau peristiwa sebelum kamu merasakan hal itu.',
    placeholder: 'Tuliskan kejadian atau suasana yang kamu alami... (opsional)',
  },
  {
    id: 'response',
    label: 'Bagaimana kamu menanggapinya?',
    helper: 'Apa yang kamu pikirkan atau lakukan saat itu?',
    placeholder: 'Tuliskan tanggapanmu saat itu... (opsional)',
  },
  {
    id: 'needs',
    label: 'Apa yang kamu butuhkan saat ini?',
    helper: 'Misalnya waktu istirahat, didengarkan, kejelasan, atau hal sederhana lainnya.',
    placeholder: 'Tuliskan kebutuhanmu saat ini... (opsional)',
  },
  {
    id: 'smallAction',
    label: 'Satu hal baik untuk dirimu',
    helper: 'Satu langkah kecil yang ramah untuk dirimu hari ini.',
    placeholder:
      'Contoh: Minum air, istirahat sejenak, atau berbicara dengan orang tepercaya... (opsional)',
  },
];
