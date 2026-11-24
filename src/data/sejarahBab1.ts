import { AvatarConfig, MissionTopic, PortalId, PlayerProgress } from '../types/game';

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  gender: 'boy',
  skinTone: '#f7c59f',
  hairStyle: 'spiky',
  hairColor: '#1e293b',
  shirtStyle: 'explorer',
  shirtColor: '#10b981',
  pantsColor: '#334155',
  shoeStyle: 'boots',
  shoeColor: '#5c3a21',
  accessory: 'safari-hat',
  backpack: 'explorer-pack',
};

export const SKIN_TONES = [
  { name: 'Cerah', hex: '#fde2c8' },
  { name: 'Pic Hangat', hex: '#f7c59f' },
  { name: 'Sawo Matang', hex: '#e5a97c' },
  { name: 'Karamel', hex: '#c68642' },
  { name: 'Perang Manis', hex: '#8d5524' },
  { name: 'Gelap', hex: '#5c3818' },
];

export const HAIR_COLORS = [
  { name: 'Hitam Arang', hex: '#1e293b' },
  { name: 'Coklat Gelap', hex: '#5c3a21' },
  { name: 'Perang Emas', hex: '#b45309' },
  { name: 'Merah Delima', hex: '#9f1239' },
  { name: 'Biru Laut', hex: '#0369a1' },
  { name: 'Ungu Mistis', hex: '#6d28d9' },
];

export const PANTS_COLORS = [
  { name: 'Kelabu Batu', hex: '#334155' },
  { name: 'Biru Denim', hex: '#1e3a8a' },
  { name: 'Khaki', hex: '#785a3a' },
  { name: 'Hitam Malam', hex: '#0f172a' },
  { name: 'Hijau Zaitun', hex: '#365314' },
];

export const SHOE_COLORS = [
  { name: 'Kulit Perang', hex: '#5c3a21' },
  { name: 'Putih Sukan', hex: '#e2e8f0' },
  { name: 'Hitam Klasik', hex: '#1e293b' },
  { name: 'Merah Terang', hex: '#dc2626' },
  { name: 'Emas Diraja', hex: '#d97706' },
];

export const AVATAR_COLORS = [
  { name: 'Zamrud', hex: '#10b981' },
  { name: 'Biru Laut', hex: '#0ea5e9' },
  { name: 'Emas Diraja', hex: '#f59e0b' },
  { name: 'Delima', hex: '#f43f5e' },
  { name: 'Ungu Mistis', hex: '#8b5cf6' },
  { name: 'Nilam', hex: '#4f46e5' },
];

export const MISSION_TOPICS: MissionTopic[] = [
  {
    id: 1,
    title: 'Maksud Sejarah',
    islandName: 'Pulau Asal Usul',
    worldTitle: 'Perpustakaan Sihir Purba',
    subtitle: 'Pengertian sejarah daripada akar bahasa Arab, Yunani, Inggeris dan Kamus Dewan.',
    colorHex: '#f59e0b',
    accentBg: 'bg-amber-500',
    crystalName: 'Kristal Syajaratun',
    iconName: 'book',
    position: { x: 0, z: -26 },
    mapCoords: { x: 400, y: 86 },
    facts: [
      {
        title: 'Asal Usul Perkataan Sejarah',
        summary:
          'Sejarah berasal daripada perkataan Arab iaitu syajaratun yang bermaksud pokok, salasilah, riwayat, keturunan dan asal usul.',
        keyPoints: [
          'Bahasa Melayu: Peristiwa yang benar-benar berlaku pada waktu lampau.',
          'Bahasa Inggeris (History): Cerita tentang seseorang, berasal daripada perkataan Yunani, historia yang bermaksud penyelidikan.',
          'Kamus Dewan: Asal usul (keturunan), salasilah, peristiwa yang benar-benar berlaku pada waktu lampau.',
        ],
      },
    ],
    questions: [
      {
        id: 'm1-q1',
        prompt: 'Perkataan "sejarah" berasal daripada perkataan Arab iaitu syajaratun. Apakah maksudnya?',
        illustrationLabel: 'Pohon Salasilah Purba',
        options: [
          'Batu dan sungai yang mengalir',
          'Pokok, salasilah, riwayat, keturunan dan asal usul',
          'Kerajaan dan istana purba',
          'Kisah khayalan nenek moyang',
        ],
        correctIndex: 1,
        hint: 'Ingat gambar sepohon kayu yang bercabang seperti salasilah keluarga!',
        explanation:
          'Dalam KSSM Sejarah Tingkatan 1, syajaratun bermaksud pokok, salasilah, riwayat, keturunan dan asal usul.',
      },
      {
        id: 'm1-q2',
        prompt: 'Dalam bahasa Yunani, perkataan "historia" merujuk kepada apa?',
        illustrationLabel: 'Skrol Yunani Purba',
        options: [
          'Penyelidikan atau penyiasatan tentang sesuatu peristiwa',
          'Nyanyian rakyat di istana',
          'Ramalan masa hadapan',
          'Peta pelayaran pedagang',
        ],
        correctIndex: 0,
        hint: 'Ahli sejarah seperti Herodotus melakukan penyiasatan untuk mencari fakta.',
        explanation:
          'Istilah Inggeris "History" berasal daripada perkataan Yunani "historia" yang bermaksud penyelidikan.',
      },
      {
        id: 'm1-q3',
        prompt: 'Apakah maksud perkataan "History" dalam bahasa Inggeris mengikut buku teks KSSM?',
        illustrationLabel: 'Buku Perpustakaan Sihir',
        options: [
          'Cerita tentang seseorang',
          'Ramalan cuaca purba',
          'Undang-undang pelabuhan',
          'Lukisan dinding gua',
        ],
        correctIndex: 0,
        hint: 'Ia berkait dengan kisah atau cerita kehidupan manusia pada masa lalu.',
        explanation:
          'Dalam bahasa Inggeris, "history" bermaksud cerita tentang seseorang yang berlaku pada masa lalu.',
      },
      {
        id: 'm1-q4',
        prompt: 'Mengikut Kamus Dewan, apakah takrif sejarah yang tepat?',
        illustrationLabel: 'Kamus Dewan & Manuskrip',
        options: [
          'Cerita rakyat yang diwarisi tanpa bukti',
          'Asal usul (keturunan), salasilah dan peristiwa yang benar-benar berlaku pada waktu lampau',
          'Senarai nama raja yang bakal memerintah',
          'Rekaan penulis moden tentang tamadun',
        ],
        correctIndex: 1,
        hint: 'Sejarah mestilah peristiwa yang benar-benar berlaku, bukan rekaan.',
        explanation:
          'Kamus Dewan mentakrifkan sejarah sebagai asal usul, salasilah, serta peristiwa yang benar-benar berlaku pada waktu lampau.',
      },
      {
        id: 'm1-q5',
        prompt: 'Mengapakah peristiwa sejarah berbeza daripada kisah dongeng atau mitos?',
        illustrationLabel: 'Peti Khazanah Fakta',
        options: [
          'Kerana sejarah tidak menyebut nama tokoh',
          'Kerana sejarah berdasarkan peristiwa yang benar-benar berlaku dan disokong bukti',
          'Kerana kisah dongeng sentiasa mempunyai tarikh tepat',
          'Kerana sejarah hanya berlaku di Eropah',
        ],
        correctIndex: 1,
        hint: 'Fikirkan tentang kebenaran dan bukti penyelidikan.',
        explanation:
          'Sejarah merupakan peristiwa sebenar yang disokong oleh penyelidikan dan bukti sahih, bukan cerita khayalan.',
      },
    ],
  },
  {
    id: 2,
    title: 'Sejarah Menurut Tokoh',
    islandName: 'Pulau Cendekiawan',
    worldTitle: 'Kota Para Sejarawan',
    subtitle: 'Mengenali 5 tokoh sejarawan dunia & Malaysia serta takrif sejarah menurut mereka.',
    colorHex: '#10b981',
    accentBg: 'bg-emerald-500',
    crystalName: 'Kristal Cendekiawan',
    iconName: 'users',
    position: { x: 18.5, z: -18.5 },
    mapCoords: { x: 590, y: 150 },
    facts: [
      {
        title: 'Lima Tokoh Sejarawan Penting',
        summary:
          'Kenali pandangan Herodotus, E.H. Carr, Ibn Khaldun, Muhd. Yusof Ibrahim dan Khoo Kay Kim.',
        keyPoints: [
          'Herodotus: Penceritaan tentang tindakan manusia yang penting dan mengagumkan serta sebab berlakunya sesuatu peristiwa.',
          'E.H. Carr: Suatu proses interaksi berterusan antara ahli sejarah dengan fakta-faktanya; dialog yang tidak berkesudahan antara masa kini dengan masa lampau.',
          'Ibn Khaldun: Membicarakan perkara tentang masyarakat manusia, peradaban dunia dan perubahan sifat masyarakat.',
          'Muhd. Yusof Ibrahim: Masa lalu itu sendiri dan catatan ataupun rekod tentang sesuatu peristiwa masa lalu.',
          'Khoo Kay Kim: Apa-apa yang pernah atau sudah berlaku; mendorong kita memahami masa kini agar kesilapan tidak berulang.',
        ],
      },
    ],
    questions: [
      {
        id: 'm2-q1',
        prompt:
          'Siapakah tokoh sejarawan yang menyatakan sejarah ialah "penceritaan tentang tindakan manusia yang penting dan mengagumkan serta sebab berlakunya sesuatu peristiwa"?',
        illustrationLabel: 'Tokoh Sejarawan Yunani',
        options: ['Herodotus', 'E.H. Carr', 'Ibn Khaldun', 'Khoo Kay Kim'],
        correctIndex: 0,
        hint: 'Beliau digelar Bapa Sejarah dari tamadun Yunani.',
        explanation:
          'Herodotus mentakrifkan sejarah sebagai penceritaan tentang tindakan manusia yang penting dan mengagumkan serta sebab berlakunya peristiwa.',
      },
      {
        id: 'm2-q2',
        prompt:
          'Siapakah tokoh yang menyatakan sejarah sebagai "suatu dialog yang tidak berkesudahan antara masa kini dengan masa lampau"?',
        illustrationLabel: 'Dialog Masa Kini & Lampau',
        options: ['Muhd. Yusof Ibrahim', 'E.H. Carr', 'Herodotus', 'Ibn Khaldun'],
        correctIndex: 1,
        hint: 'Pengarang buku terkenal "What is History?".',
        explanation:
          'E.H. Carr menyifatkan sejarah sebagai proses interaksi berterusan antara ahli sejarah dengan fakta serta dialog antara masa kini dengan masa lampau.',
      },
      {
        id: 'm2-q3',
        prompt:
          'Tokoh manakah yang menekankan kajian tentang "masyarakat manusia, peradaban dunia dan perubahan-perubahan yang berlaku pada sifat-sifat masyarakat itu"?',
        illustrationLabel: 'Pengarang Muqaddimah',
        options: ['Ibn Khaldun', 'E.H. Carr', 'Khoo Kay Kim', 'Herodotus'],
        correctIndex: 0,
        hint: 'Cendekiawan Islam terkemuka yang mengarang kitab Muqaddimah.',
        explanation:
          'Ibn Khaldun menyatakan sejarah membicarakan tentang masyarakat manusia, peradaban dunia dan perubahan sifat masyarakat.',
      },
      {
        id: 'm2-q4',
        prompt:
          'Siapakah sejarawan Malaysia yang menyebut "sejarah merupakan masa lalu itu sendiri dan catatan ataupun rekod tentang sesuatu peristiwa yang berlaku pada masa lalu"?',
        illustrationLabel: 'Rekod & Catatan Masa Lalu',
        options: ['Khoo Kay Kim', 'Muhd. Yusof Ibrahim', 'Ibn Khaldun', 'E.H. Carr'],
        correctIndex: 1,
        hint: 'Tokoh sejarawan tempatan yang menulis karya tentang ilmu sejarah.',
        explanation:
          'Muhd. Yusof Ibrahim mendefinisikan sejarah sebagai masa lalu itu sendiri serta catatan atau rekod peristiwa masa lalu.',
      },
      {
        id: 'm2-q5',
        prompt: 'Apakah pandangan Profesor Emeritus Tan Sri Dr. Khoo Kay Kim mengenai sejarah?',
        illustrationLabel: 'Cermin Masa Kini',
        options: [
          'Sejarah hanyalah senarai tarikh tanpa pengajaran',
          'Sejarah merujuk apa-apa yang pernah berlaku dan mendorong kita memahami masa kini agar kesilapan tidak berulang',
          'Sejarah hanya ditulis untuk raja-raja silam',
          'Sejarah merupakan ramalan bintang masa depan',
        ],
        correctIndex: 1,
        hint: 'Fokusnya ialah memahami masa kini dan menjamin kesilapan tidak berulang.',
        explanation:
          'Khoo Kay Kim menegaskan sejarah merujuk kepada apa-apa yang pernah berlaku dan membantu kita memahami masa kini.',
      },
    ],
  },
  {
    id: 3,
    title: 'Ruang dan Masa dalam Sejarah',
    islandName: 'Pulau Kronologi',
    worldTitle: 'Dunia Rentas Masa',
    subtitle: 'Memahami kronologi, dekad, abad, alaf, SM/M dan pembahagian ruang geografi sejarah.',
    colorHex: '#0ea5e9',
    accentBg: 'bg-sky-500',
    crystalName: 'Kristal Kronologi',
    iconName: 'clock',
    position: { x: 26, z: 0 },
    mapCoords: { x: 660, y: 295 },
    facts: [
      {
        title: 'Konsep Masa (Kronologi) & Ruang',
        summary:
          'Masa dalam sejarah merangkumi urutan waktu (kronologi) dan ukuran masa seperti dekad, abad, alaf, SM dan M. Ruang pula merujuk tempat berlakunya peristiwa.',
        keyPoints: [
          'Dekad = 10 tahun · Abad = 100 tahun · Alaf = 1,000 tahun.',
          'Sebelum Masihi (SM) = zaman sebelum kelahiran Nabi Isa AS; Masihi (M) = zaman selepas kelahiran Nabi Isa AS.',
          'Ruang = tempat/kawasan seperti sejarah tempatan, sejarah negara, atau sejarah rantau.',
        ],
      },
    ],
    questions: [
      {
        id: 'm3-q1',
        prompt: 'Pintu Masa 1: Berapakah tempoh masa bagi 1 Dekad, 1 Abad dan 1 Alaf secara berturutan?',
        illustrationLabel: 'Pintu Jam Pasir',
        options: [
          '10 tahun, 100 tahun, 1,000 tahun',
          '5 tahun, 50 tahun, 500 tahun',
          '100 tahun, 10 tahun, 1,000 tahun',
          '10 tahun, 1,000 tahun, 10,000 tahun',
        ],
        correctIndex: 0,
        hint: 'Mulakan dengan 10 (dekad), kemudian darab sepuluh setiap langkah.',
        explanation: '1 dekad = 10 tahun, 1 abad = 100 tahun, dan 1 alaf = 1,000 tahun.',
      },
      {
        id: 'm3-q2',
        prompt: 'Pintu Masa 2: Apakah perbezaan antara zaman Sebelum Masihi (SM) dan Masihi (M)?',
        illustrationLabel: 'Garis Masa Dunia',
        options: [
          'SM ialah zaman sebelum kelahiran Nabi Isa AS, manakala M ialah zaman selepas kelahiran Nabi Isa AS',
          'SM hanya digunakan di Asia, M di Eropah',
          'SM lebih moden daripada zaman Masihi',
          'Tiada perbezaan antara kedua-duanya',
        ],
        correctIndex: 0,
        hint: 'Titik pemisah antara SM dan M ialah kelahiran Nabi Isa AS.',
        explanation:
          'Sebelum Masihi (SM) merujuk zaman sebelum kelahiran Nabi Isa AS, manakala Masihi (M) ialah zaman selepasnya.',
      },
      {
        id: 'm3-q3',
        prompt: 'Pintu Masa 3: Mengapakah sejarawan membahagikan RUANG dalam penyelidikan sejarah?',
        illustrationLabel: 'Peta Ruang Geografi',
        options: [
          'Supaya sejarawan dapat fokus kepada kawasan tertentu seperti sejarah tempatan, negara atau rantau',
          'Untuk memendekkan saiz kapal pedagang',
          'Kerana setiap negeri menggunakan kalendar berbeza sahaja',
          'Untuk menyembunyikan nama bandar lama',
        ],
        correctIndex: 0,
        hint: 'Ruang merujuk kepada tempat atau lokasi kejadian berlaku.',
        explanation:
          'Pembahagian ruang (contoh: sejarah Malaysia, Asia Tenggara, Eropah) memudahkan penyelidikan yang lebih mendalam dan terfokus.',
      },
      {
        id: 'm3-q4',
        prompt: 'Pintu Keluar Labirin: Pengisytiharan Kemerdekaan Tanah Melayu berlaku pada 31 Ogos 1957 di Stadium Merdeka. Nyatakan RUANG dan MASA peristiwa ini.',
        illustrationLabel: 'Gerbang Keluar Labirin Masa',
        options: [
          'Ruang: Stadium Merdeka, Tanah Melayu · Masa: 31 Ogos 1957 (Abad ke-20 Masihi)',
          'Ruang: Abad ke-20 · Masa: Stadium Merdeka',
          'Ruang: Selat Melaka · Masa: 1400 SM',
          'Ruang: Pulau Pinang · Masa: 1963',
        ],
        correctIndex: 0,
        hint: 'Ruang = tempat kejadian; Masa = tarikh/tahun kejadian.',
        explanation:
          'Stadium Merdeka ialah ruang (tempat) peristiwa, manakala 31 Ogos 1957 (Abad ke-20 M) ialah masa peristiwa berlaku.',
      },
    ],
  },
  {
    id: 4,
    title: 'Sumber Sejarah',
    islandName: 'Pulau Khazanah Purba',
    worldTitle: 'Muzium Arkeologi Purba',
    subtitle: 'Membezakan Sumber Primer yang asli dan Sumber Sekunder yang telah diolah.',
    colorHex: '#8b5cf6',
    accentBg: 'bg-violet-500',
    crystalName: 'Kristal Sumber Asli',
    iconName: 'scroll',
    position: { x: 18.5, z: 18.5 },
    mapCoords: { x: 590, y: 435 },
    facts: [
      {
        title: 'Sumber Primer vs Sumber Sekunder',
        summary:
          'Sumber sejarah terbahagi kepada dua kategori utama iaitu Sumber Primer dan Sumber Sekunder.',
        keyPoints: [
          'Sumber Primer: Belum diolah atau diterbitkan, bersifat asli dan belum ditafsir (contoh: fosil, artifak, bukan artifak, batu bersurat, dokumen rasmi, diari, manuskrip).',
          'Sumber Sekunder: Bahan yang telah diolah, ditulis dan diterbitkan untuk umum (contoh: buku, akhbar, majalah, ensiklopedia, jurnal).',
        ],
      },
    ],
    questions: [
      {
        id: 'm4-q1',
        prompt: 'Peti Muzium 1: Pilih bahan yang tergolong sebagai SUMBER PRIMER untuk membuka peti ini.',
        illustrationLabel: 'Peti Batu Bersurat',
        options: [
          'Buku rujukan Sejarah Tingkatan 1',
          'Batu Bersurat Terengganu dan kapak batu purba',
          'Majalah Sejarah bulanan',
          'Ensiklopedia Tamadun Dunia',
        ],
        correctIndex: 1,
        hint: 'Cari bahan yang asli dan belum pernah diolah oleh penulis moden.',
        explanation:
          'Batu Bersurat Terengganu dan kapak batu (artifak) bersifat asli dan belum diolah, maka ia adalah sumber primer.',
      },
      {
        id: 'm4-q2',
        prompt: 'Peti Muzium 2: Apakah perbezaan antara ARTIFAK dan BUKAN ARTIFAK?',
        illustrationLabel: 'Peti Artifak & Candi',
        options: [
          'Artifak ialah peralatan ciptaan manusia yang boleh dialihkan, manakala bukan artifak ialah data arkeologi seperti tapak binaan atau struktur kekal',
          'Artifak hanya diperbuat daripada kertas',
          'Bukan artifak ialah buku cerita moden',
          'Kedua-duanya tidak termasuk dalam sumber primer',
        ],
        correctIndex: 0,
        hint: 'Contoh artifak: tembikar, senjata. Contoh bukan artifak: tapak candi, tembok kota.',
        explanation:
          'Artifak ialah barangan ciptaan manusia yang boleh dipindahkan; bukan artifak ialah struktur kekal seperti tapak penempatan dan candi.',
      },
      {
        id: 'm4-q3',
        prompt: 'Peti Muzium 3: Mengapakah akhbar, buku dan jurnal digolongkan sebagai SUMBER SEKUNDER?',
        illustrationLabel: 'Peti Arkib Terbitan',
        options: [
          'Kerana bahan tersebut telah diolah, dicetak dan disebarkan berdasarkan kajian sumber primer',
          'Kerana ia ditemui tertanam di dalam gua zaman batu',
          'Kerana ia tidak mempunyai penulis',
          'Kerana ia lebih tua daripada fosil haiwan',
        ],
        correctIndex: 0,
        hint: 'Sumber sekunder terhasil selepas bahan asal dikaji dan ditulis semula.',
        explanation:
          'Buku, akhbar, majalah dan jurnal telah melalui proses pengolahan dan penerbitan, menjadikannya sumber sekunder.',
      },
    ],
  },
  {
    id: 5,
    title: 'Kaedah Penyelidikan Sejarah',
    islandName: 'Pulau Ekskavasi',
    worldTitle: 'Tapak Pengembaraan Arkeologi',
    subtitle: 'Menguasai Kaedah Bertulis, Kaedah Lisan dan Kaedah Arkeologi (darat & bawah air).',
    colorHex: '#f43f5e',
    accentBg: 'bg-rose-500',
    crystalName: 'Kristal Ekskavasi',
    iconName: 'search',
    position: { x: 0, z: 26 },
    mapCoords: { x: 400, y: 495 },
    facts: [
      {
        title: 'Tiga Kaedah Penyelidikan Sejarah',
        summary:
          'Ahli sejarah menggunakan tiga kaedah utama untuk mendapatkan maklumat sejarah yang sahih dan tepat.',
        keyPoints: [
          'Kaedah Bertulis: Kajian terhadap sesuatu peristiwa daripada maklumat pada sumber bertulis (batu, kayu, daun lontar, dokumen arkib).',
          'Kaedah Lisan: Mendapatkan maklumat melalui temu bual bersama orang sumber melalui 3 tahap — Persediaan, Rakaman temu bual, dan Memproses rakaman.',
          'Kaedah Arkeologi: Mendapatkan maklumat daripada bahan tinggalan sejarah melalui proses gali cari (ekskavasi) di darat dan bawah air.',
        ],
      },
    ],
    questions: [
      {
        id: 'm5-q1',
        prompt: 'Apakah susunan TIGA TAHAP yang betul bagi Kaedah Lisan?',
        illustrationLabel: 'Kem Temu Bual Orang Sumber',
        options: [
          'Persediaan -> Rakaman temu bual -> Memproses rakaman',
          'Memproses rakaman -> Persediaan -> Rakaman temu bual',
          'Ekskavasi -> Menulis skrip -> Menerbitkan buku',
          'Rakaman temu bual -> Persediaan -> Membakar pita',
        ],
        correctIndex: 0,
        hint: 'Sebelum menemubual tokoh, kita mesti bersedia dahulu, kemudian merakam, dan akhirnya memproses maklumat.',
        explanation:
          'Tahap Kaedah Lisan ialah: Tahap 1 (Persediaan), Tahap 2 (Rakaman temu bual), dan Tahap 3 (Memproses rakaman).',
      },
      {
        id: 'm5-q2',
        prompt:
          'Sekumpulan ahli arkeologi menyelam ke dasar laut di perairan Melaka untuk mengkaji tinggalan kapal karam. Apakah nama kaedah ini?',
        illustrationLabel: 'Selaman Arkeologi Bawah Air',
        options: [
          'Kaedah Lisan',
          'Kaedah Arkeologi Bawah Air',
          'Kaedah Bertulis Kepustakaan',
          'Kaedah Geografi Moden',
        ],
        correctIndex: 1,
        hint: 'Kajian tinggalan sejarah di dasar laut, sungai atau tasik.',
        explanation:
          'Penyelidikan terhadap kapal karam dan artifak di dasar air ialah Kaedah Arkeologi Bawah Air.',
      },
      {
        id: 'm5-q3',
        prompt: 'Dalam Kaedah Bertulis, apakah langkah pertama yang dilakukan oleh penyelidik sejarah?',
        illustrationLabel: 'Arkib & Perpustakaan Purba',
        options: [
          'Mengenal pasti sumber bagi sesuatu peristiwa atau tokoh sejarah yang hendak dikaji',
          'Terus membuat kesimpulan tanpa membaca dokumen',
          'Menggali pasir pantai tanpa peta',
          'Menulis novel fiksyen dahulu',
        ],
        correctIndex: 0,
        hint: 'Proses kaedah bertulis bermula dengan mengenal pasti sumber yang berkaitan.',
        explanation:
          'Kaedah bertulis bermula dengan mengenal pasti sumber, diikuti mengesan, mengumpul, menilai dan mentafsir fakta.',
      },
    ],
  },
  {
    id: 6,
    title: 'Sebab dan Akibat',
    islandName: 'Pulau Rantaian Masa',
    worldTitle: 'Kerajaan Fantasi Domino',
    subtitle: 'Memahami punca tercetusnya peristiwa (sebab) dan kesannya (akibat) dalam sejarah.',
    colorHex: '#f97316',
    accentBg: 'bg-orange-500',
    crystalName: 'Kristal Rantaian Domino',
    iconName: 'git-branch',
    position: { x: -18.5, z: 18.5 },
    mapCoords: { x: 210, y: 435 },
    facts: [
      {
        title: 'Memahami Sebab dan Akibat',
        summary:
          'Setiap peristiwa sejarah mempunyai sebab (punca berlaku) dan akibat (kesan yang timbul) yang membentuk perubahan masyarakat.',
        keyPoints: [
          'Sebab menjawab soalan "Mengapa peristiwa itu berlaku?".',
          'Akibat menjawab soalan "Apakah kesan perubahan selepas peristiwa itu berlaku?".',
        ],
      },
    ],
    questions: [
      {
        id: 'm6-q1',
        prompt: 'Batu Jambatan 1: Pelabuhan Melaka terlindung daripada tiupan angin monsun. Apakah AKIBAT daripada keadaan geografi ini?',
        illustrationLabel: 'Jambatan Pelabuhan Melaka',
        options: [
          'Kapal dagang selamat berlabuh dan Melaka berkembang menjadi pusat perdagangan antarabangsa',
          'Pedagang tidak dapat belayar ke Melaka',
          'Sungai Melaka menjadi kering-kontang',
          'Penduduk meninggalkan pelabuhan',
        ],
        correctIndex: 0,
        hint: 'Pelabuhan yang selamat menarik ramai pedagang dari Timur dan Barat.',
        explanation:
          'Kedudukan pelabuhan yang terlindung (sebab) mengakibatkan Melaka muncul sebagai pusat perdagangan entrepot yang makmur (akibat).',
      },
      {
        id: 'm6-q2',
        prompt: 'Batu Jambatan 2: Rakyat pelbagai kaum bersatu padu dalam rundingan menuntut kemerdekaan. Apakah AKIBAT besar daripada peristiwa ini?',
        illustrationLabel: 'Jambatan Perpaduan 1957',
        options: [
          'Tanah Melayu mencapai kemerdekaan pada 31 Ogos 1957',
          'Penjajahan berterusan selama seribu tahun lagi',
          'Semua negeri dipisahkan sempadan laut',
          'Sistem pendidikan ditutup',
        ],
        correctIndex: 0,
        hint: 'Perpaduan rakyat membuktikan kesediaan Tanah Melayu mentadbir negara sendiri.',
        explanation:
          'Kesepaduan rakyat (sebab) membawa kepada pencapaian kemerdekaan Tanah Melayu pada tahun 1957 (akibat).',
      },
      {
        id: 'm6-q3',
        prompt: 'Batu Jambatan 3: Penemuan kawasan lombong bijih timah yang kaya di Tanah Melayu pada abad ke-19 menyebabkan apa?',
        illustrationLabel: 'Jambatan Revolusi Ekonomi',
        options: [
          'Pembinaan jalan kereta api, pelabuhan dan kemunculan bandar-bandar baharu',
          'Penghapusan semua kegiatan perdagangan',
          'Penutupan semua laluan sungai',
          'Tiada sebarang perubahan ekonomi',
        ],
        correctIndex: 0,
        hint: 'Hasil bijih timah memerlukan pengangkutan moden untuk diangkut ke pelabuhan.',
        explanation:
          'Kemajuan perlombongan bijih timah (sebab) mendorong pembinaan jalan kereta api dan pertumbuhan bandar baharu (akibat).',
      },
      {
        id: 'm6-q4',
        prompt: 'Batu Terakhir Jambatan: Mengapakah penting bagi pelajar menganalisis SEBAB dan AKIBAT sesuatu peristiwa sejarah?',
        illustrationLabel: 'Gerbang Raja Domino',
        options: [
          'Supaya dapat memahami punca kejayaan atau kegagalan masa lalu dan tidak mengulangi kesilapan',
          'Supaya hanya menghafal nombor tanpa makna',
          'Supaya melupakan peranan masyarakat silam',
          'Supaya dapat mengubah fakta sebenar',
        ],
        correctIndex: 0,
        hint: 'Kaitan sebab dan akibat melatih pemikiran kritis sejarah.',
        explanation:
          'Memahami sebab dan akibat membantu kita menilai tindakan silam secara kritis serta mengambil pengajaran bagi masa depan.',
      },
    ],
  },
  {
    id: 7,
    title: 'Pentafsiran Sejarah',
    islandName: 'Pulau Prisma Fakta',
    worldTitle: 'Kota Detektif Sejarah',
    subtitle: 'Menyiasat mengapa wujud tafsiran berbeza dan menilai bukti sejarah secara objektif.',
    colorHex: '#14b8a6',
    accentBg: 'bg-teal-500',
    crystalName: 'Kristal Kebenaran',
    iconName: 'eye',
    position: { x: -26, z: 0 },
    mapCoords: { x: 140, y: 295 },
    facts: [
      {
        title: 'Pentafsiran dalam Sejarah',
        summary:
          'Pentafsiran bermaksud menerangkan atau mengulas sesuatu fakta sejarah berdasarkan sumber-sumber yang berkaitan dengannya.',
        keyPoints: [
          'Empat sebab wujud tafsiran berbeza: Pemilihan sumber yang pelbagai, perbezaan pandangan, perbezaan ideologi, dan tujuan penulisan.',
          'Pentafsiran sejarah mesti dibuat secara jujur, tepat, objektif dan berlandaskan bukti kukuh.',
        ],
      },
    ],
    questions: [
      {
        id: 'm7-q1',
        prompt: 'Mengapakah boleh wujud pentafsiran yang berbeza terhadap sesuatu peristiwa sejarah yang sama?',
        illustrationLabel: 'Kanta Detektif Sejarah',
        options: [
          'Kerana pemilihan sumber yang pelbagai, perbezaan pandangan, perbezaan ideologi dan tujuan penulisan',
          'Kerana ahli sejarah tidak menggunakan sebarang sumber',
          'Kerana sejarah tidak mempunyai bukti',
          'Kerana semua buku dicetak pada hari yang sama',
        ],
        correctIndex: 0,
        hint: 'Terdapat 4 faktor utama dalam buku teks KSSM Bab 1.',
        explanation:
          'Empat faktor perbezaan tafsiran ialah pemilihan sumber pelbagai, perbezaan pandangan, perbezaan ideologi dan tujuan penulisan.',
      },
      {
        id: 'm7-q2',
        prompt: 'Apakah sikap wajib seorang ahli sejarah semasa membuat pentafsiran terhadap fakta sejarah?',
        illustrationLabel: 'Neraca Etika Sejarawan',
        options: [
          'Jujur, objektif, dan membuat kajian berlandaskan bukti yang sahih',
          'Menambah cerita khayalan mengikut emosi',
          'Memilih bukti yang menguntungkan diri sendiri sahaja',
          'Menolak semua sumber primer',
        ],
        correctIndex: 0,
        hint: 'Sejarawan mesti berpegang kepada integriti dan bukti.',
        explanation:
          'Ahli sejarah wajib bersikap jujur, objektif dan menggunakan bukti sahih agar tafsiran tidak terpesong.',
      },
      {
        id: 'm7-q3',
        prompt: 'Apakah kepentingan wujudnya pentafsiran sejarah yang berlandaskan penyelidikan rapi?',
        illustrationLabel: 'Arkib Kebenaran Kota',
        options: [
          'Mengajak masyarakat menilai sesuatu peristiwa dari sudut pandangan yang adil, menyeluruh dan matang',
          'Menyebabkan pelajar berhenti membaca sejarah',
          'Menghapuskan semua rekod tempatan',
          'Menjadikan sejarah sebagai cerita rekaan',
        ],
        correctIndex: 0,
        hint: 'Fikirkan bagaimana pelbagai sumber membantu kita melihat kebenaran secara lebih adil.',
        explanation:
          'Pentafsiran yang teliti membantu kita menilai sesuatu peristiwa daripada pelbagai sudut secara matang dan adil.',
      },
    ],
  },
  {
    id: 8,
    title: 'Kepentingan Mempelajari Sejarah',
    islandName: 'Pulau Mahkota Bangsa',
    worldTitle: 'Kerajaan Warisan Gemilang',
    subtitle: 'Menguasai 5 kepentingan utama mempelajari sejarah serta soalan KBAT patriotisme.',
    colorHex: '#6366f1',
    accentBg: 'bg-indigo-500',
    crystalName: 'Kristal Mahkota Warisan',
    iconName: 'award',
    position: { x: -18.5, z: -18.5 },
    mapCoords: { x: 210, y: 150 },
    facts: [
      {
        title: 'Lima Kepentingan Mempelajari Sejarah',
        summary:
          'Ilmu sejarah membina jati diri warganegara yang patriotik, mengenali warisan bangsa dan mengambil pengajaran masa lalu.',
        keyPoints: [
          '1. Menerapkan semangat patriotik.',
          '2. Mengetahui keagungan bangsa.',
          '3. Menghargai warisan.',
          '4. Mengenang jasa tokoh.',
          '5. Mengambil iktibar.',
        ],
      },
    ],
    questions: [
      {
        id: 'm8-q1',
        prompt: 'Soalan KBAT 1: Sekolah anda menganjurkan pameran artifak Kesultanan Melayu Melaka dan pakaian tradisional. Apakah nilai utama yang dipupuk melalui program ini?',
        illustrationLabel: 'Galeri Warisan Diraja',
        options: [
          'Menghargai warisan dan mengetahui keagungan bangsa',
          'Melupakan budaya tempatan demi budaya asing',
          'Menggalakkan pembaziran masa',
          'Mengasingkan murid mengikut kelas',
        ],
        correctIndex: 0,
        hint: 'Pameran artifak dan budaya tradisional berkait rapat dengan warisan bangsa.',
        explanation:
          'Program pameran sejarah memupuk rasa bangga untuk menghargai warisan dan mengetahui keagungan tamadun bangsa.',
      },
      {
        id: 'm8-q2',
        prompt: 'Soalan KBAT 2: Bagaimanakah kisah pengorbanan pejuang kemerdekaan seperti Tunku Abdul Rahman dan Leftenan Adnan memberi kesan kepada generasi muda hari ini?',
        illustrationLabel: 'Monumen Jasa Tokoh',
        options: [
          'Mendorong kita mengenang jasa tokoh serta menerapkan semangat patriotik untuk menjaga kedaulatan negara',
          'Menjadikan remaja takut mempertahankan negara',
          'Membuatkan masyarakat melupakan tarikh kemerdekaan',
          'Mengurangkan semangat kerjasama antara kaum',
        ],
        correctIndex: 0,
        hint: 'Kisah pejuang membangkitkan rasa cinta akan negara dan penghormatan kepada tokoh.',
        explanation:
          'Mempelajari perjuangan tokoh mendidik kita mengenang jasa tokoh dan menyemai semangat patriotik.',
      },
      {
        id: 'm8-q3',
        prompt: 'Soalan KBAT 3: Pada pendapat anda, mengapakah negara yang melupakan sejarah perpecahan silam berisiko mengulangi kesilapan yang sama?',
        illustrationLabel: 'Obor Iktibar Negara',
        options: [
          'Kerana masyarakat gagal mengambil iktibar daripada punca kejatuhan dan konflik masa lalu',
          'Kerana sejarah tidak ada kaitan dengan perpaduan',
          'Kerana buku teks terlalu tebal',
          'Kerana masa hadapan tidak dipengaruhi tindakan hari ini',
        ],
        correctIndex: 0,
        hint: 'Salah satu daripada 5 kepentingan: mengambil pengajaran daripada peristiwa lampau.',
        explanation:
          'Mengambil iktibar daripada sejarah membolehkan kita mengelakkan kesilapan silam dan mengekalkan keharmonian negara.',
      },
      {
        id: 'm8-q4',
        prompt: 'Cabaran Patriotik Akhir: Sebagai pelajar Tingkatan 1, apakah tindakan terbaik anda untuk membuktikan semangat patriotisme di sekolah?',
        illustrationLabel: 'Mahkota Penjelajah Negara',
        options: [
          'Menghormati lagu Negaraku, menjaga keharmonian rakan pelbagai kaum dan memelihara warisan negara',
          'Menconteng bangunan bersejarah',
          'Mengabaikan sambutan Bulan Kebangsaan',
          'Memperkecilkan adat resam kaum lain',
        ],
        correctIndex: 0,
        hint: 'Pilih tindakan positif yang memelihara keharmonian dan identiti negara.',
        explanation:
          'Semangat patriotik diterjemahkan melalui penghormatan kepada simbol negara, perpaduan antara kaum, dan pemeliharaan warisan.',
      },
    ],
  },
];

export const CLASS_SUGGESTIONS = [
  '1 ZETA',
  '1 SIGMA',
  '1 THETA',
  '1 ALPHA',
  '1 BETA',
  '1 GAMMA',
];

export const INITIAL_PROGRESS: PlayerProgress = {
  playerName: 'Penjelajah Muda',
  playerClass: '1 ZETA',
  avatarColor: '#10b981',
  avatarConfig: DEFAULT_AVATAR_CONFIG,
  points: 0,
  coins: 50,
  knowledgeCrystals: [],
  openedChests: [],
  collectedCrystals: [],
  achievements: [],
  missions: {
    1: { completed: false, stars: 0, bestScore: 0 },
    2: { completed: false, stars: 0, bestScore: 0 },
    3: { completed: false, stars: 0, bestScore: 0 },
    4: { completed: false, stars: 0, bestScore: 0 },
    5: { completed: false, stars: 0, bestScore: 0 },
    6: { completed: false, stars: 0, bestScore: 0 },
    7: { completed: false, stars: 0, bestScore: 0 },
    8: { completed: false, stars: 0, bestScore: 0 },
  },
};

export const TOK_GURU_DIALOGUES = [
  {
    speaker: 'Tok Guru Sejarah',
    title: 'Selamat Datang ke Lembah Ilmu Purba!',
    message:
      'Salam sejahtera, penjelajah muda! Setiap daripada 8 Portal Misi kini membuka alam cabaran tersendiri. Selesaikan kesemua 8 misi untuk mengumpulkan 8 Kristal Ilmu dan memulihkan Tamadun yang Hilang!',
  },
  {
    speaker: 'Tok Guru Sejarah',
    title: 'Cara Mengumpul Mata, Syiling & Kristal Ilmu',
    message:
      'Setiap jawapan tepat dalam misi memberikan +10 Mata Ilmu! Selesaikan aktiviti cari objek tersembunyi, padanan seret & lepas, perbualan tokoh dan kuiz untuk meraih 3 Bintang serta 1 Kristal Ilmu bagi setiap portal.',
  },
  {
    speaker: 'Tok Guru Sejarah',
    title: 'Peta Pengembaraan 8 Pulau',
    message:
      'Klik "Peta Pulau" atau tekan kekunci M pada bila-bila masa untuk melihat lapan pulau misteri dan terus merentas ke portal pilihanmu.',
  },
];

export function countCompletedMissions(progress: PlayerProgress): number {
  return (Object.keys(progress.missions) as unknown as PortalId[]).filter(
    (id) => progress.missions[id]?.completed,
  ).length;
}

export function countTotalStars(progress: PlayerProgress): number {
  return (Object.keys(progress.missions) as unknown as PortalId[]).reduce(
    (sum, id) => sum + (progress.missions[id]?.stars || 0),
    0,
  );
}

export function calculateProgressPercent(progress: PlayerProgress): number {
  const completed = countCompletedMissions(progress);
  return Math.round((completed / 8) * 100);
}
