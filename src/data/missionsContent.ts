import {
  ChronoEventItem,
  ClassifyBucket,
  ClassifyItem,
  DetectiveCaseItem,
  DigTile,
  HiddenObjectItem,
  MatchPair,
  NpcDialogueCard,
} from '../types/game';

// ============================================================
// MISSION 1: MAKSUD SEJARAH (Ancient Magical Library)
// ============================================================
export const M1_HIDDEN_WORDS: HiddenObjectItem[] = [
  {
    id: 'w-syajaratun',
    label: 'Syajaratun',
    badge: 'Rak Buku Ajaib',
    fact: 'Perkataan Arab yang bermaksud pokok, salasilah, riwayat, keturunan dan asal usul.',
    xPct: 18,
    yPct: 30,
    colorHex: '#f59e0b',
  },
  {
    id: 'w-historia',
    label: 'Historia',
    badge: 'Skrol Yunani',
    fact: 'Perkataan Yunani yang bermaksud penyelidikan atau penyiasatan tentang peristiwa lampau.',
    xPct: 76,
    yPct: 26,
    colorHex: '#38bdf8',
  },
  {
    id: 'w-salasilah',
    label: 'Salasilah',
    badge: 'Pohon Keturunan',
    fact: 'Menurut Kamus Dewan, sejarah bermaksud asal usul (keturunan) dan salasilah.',
    xPct: 32,
    yPct: 70,
    colorHex: '#10b981',
  },
  {
    id: 'w-lampau',
    label: 'Waktu Lampau',
    badge: 'Lilin Jam Masa',
    fact: 'Peristiwa yang benar-benar berlaku pada waktu lampau menjadi teras utama ilmu sejarah.',
    xPct: 68,
    yPct: 68,
    colorHex: '#a78bfa',
  },
];

export const M1_MATCH_PAIRS: MatchPair[] = [
  {
    id: 'm1-p1',
    leftTitle: 'Syajaratun (Bahasa Arab)',
    rightTitle: 'Pokok, salasilah, riwayat, keturunan dan asal usul',
    explanation: 'Istilah Arab syajaratun menjadi akar kata kepada perkataan "sejarah" dalam Bahasa Melayu.',
  },
  {
    id: 'm1-p2',
    leftTitle: 'Historia (Bahasa Yunani)',
    rightTitle: 'Penyelidikan atau penyiasatan',
    explanation: 'Historia merujuk kepada proses menyelidik peristiwa dan tindakan manusia pada masa lalu.',
  },
  {
    id: 'm1-p3',
    leftTitle: 'History (Bahasa Inggeris)',
    rightTitle: 'Cerita tentang seseorang',
    explanation: 'Dalam Bahasa Inggeris, history membawa maksud cerita tentang seseorang yang pernah berlaku.',
  },
];

// ============================================================
// MISSION 2: SEJARAH MENURUT TOKOH (Ancient Historians' City)
// ============================================================
export const M2_HISTORIANS: NpcDialogueCard[] = [
  {
    id: 'herodotus',
    name: 'Herodotus',
    era: 'Sejarawan Yunani Purba',
    colorHex: '#10b981',
    quote: 'Salam penjelajah! Aku menulis tentang peristiwa besar tamadun Yunani dan Parsi.',
    definition:
      'Penceritaan tentang tindakan manusia yang penting dan mengagumkan serta sebab berlakunya sesuatu peristiwa.',
  },
  {
    id: 'eh-carr',
    name: 'E.H. Carr',
    era: 'Sejarawan Moden (What is History?)',
    colorHex: '#0ea5e9',
    quote: 'Fakta sejarah tidak bercakap sendiri tanpa pertanyaan daripada ahli sejarah!',
    definition:
      'Suatu proses interaksi berterusan antara ahli sejarah dengan fakta-faktanya; dialog yang tidak berkesudahan antara masa kini dengan masa lampau.',
  },
  {
    id: 'ibn-khaldun',
    name: 'Ibn Khaldun',
    era: 'Cendekiawan Islam (Muqaddimah)',
    colorHex: '#f59e0b',
    quote: 'Lihatlah bagaimana masyarakat dan peradaban manusia berubah mengikut peredaran zaman.',
    definition:
      'Membicarakan perkara tentang masyarakat manusia, atau peradaban dunia, dan perubahan-perubahan yang berlaku pada sifat-sifat masyarakat itu.',
  },
  {
    id: 'muhd-yusof',
    name: 'Muhd. Yusof Ibrahim',
    era: 'Sejarawan Malaysia',
    colorHex: '#a78bfa',
    quote: 'Rekod bertulis membolehkan kita menjejaki peristiwa masa lalu dengan tepat.',
    definition:
      'Masa lalu itu sendiri dan catatan ataupun rekod tentang sesuatu peristiwa yang berlaku pada suatu masa yang lalu.',
  },
  {
    id: 'khoo-kay-kim',
    name: 'Khoo Kay Kim',
    era: 'Sejarawan Negara Malaysia',
    colorHex: '#f43f5e',
    quote: 'Belajarlah daripada masa lalu supaya kita memahami masa kini dan tidak mengulangi kesilapan!',
    definition:
      'Merujuk kepada apa-apa yang pernah atau sudah berlaku; mendorong kita lebih memahami apa yang berlaku pada masa kini serta memastikan kesilapan tidak berulang.',
  },
];

export const M2_MATCH_PAIRS: MatchPair[] = M2_HISTORIANS.map((h) => ({
  id: `m2-${h.id}`,
  leftTitle: h.name,
  rightTitle: h.definition,
  explanation: `${h.name} (${h.era}) mentakrifkan sejarah sedemikian.`,
}));

// ============================================================
// MISSION 3: RUANG DAN MASA (Magical Time-Travel World)
// ============================================================
export const M3_CHRONO_EVENTS: ChronoEventItem[] = [
  {
    id: 'c-prasejarah',
    title: 'Zaman Prasejarah & Kerajaan Alam Melayu Awal',
    timeLabel: 'Sebelum Masihi (SM) – Abad Pertama M',
    detail: 'Penempatan awal manusia di Lembah Lenggong serta kemunculan kerajaan awal di Alam Melayu.',
    order: 1,
  },
  {
    id: 'c-melaka',
    title: 'Pengasasan Kesultanan Melayu Melaka',
    timeLabel: 'Sekitar Tahun 1400 Masihi',
    detail: 'Parameswara mengasaskan Melaka yang berkembang menjadi pusat perdagangan antarabangsa.',
    order: 2,
  },
  {
    id: 'c-merdeka',
    title: 'Pengisytiharan Kemerdekaan Tanah Melayu',
    timeLabel: '31 Ogos 1957 Masihi',
    detail: 'Tunku Abdul Rahman mengisytiharkan kemerdekaan Persekutuan Tanah Melayu di Stadium Merdeka.',
    order: 3,
  },
  {
    id: 'c-malaysia',
    title: 'Pembentukan Gagasan Malaysia',
    timeLabel: '16 September 1963 Masihi',
    detail: 'Persekutuan Tanah Melayu bergabung bersama Sabah, Sarawak dan Singapura membentuk Malaysia.',
    order: 4,
  },
];

export const M3_MATCH_PAIRS: MatchPair[] = [
  {
    id: 'm3-p1',
    leftTitle: 'Dekad',
    rightTitle: 'Tempoh masa 10 tahun',
    explanation: 'Satu dekad bersamaan dengan sepuluh tahun.',
  },
  {
    id: 'm3-p2',
    leftTitle: 'Abad',
    rightTitle: 'Tempoh masa 100 tahun',
    explanation: 'Satu abad bersamaan dengan seratus tahun.',
  },
  {
    id: 'm3-p3',
    leftTitle: 'Alaf',
    rightTitle: 'Tempoh masa 1,000 tahun',
    explanation: 'Satu alaf bersamaan dengan seribu tahun.',
  },
  {
    id: 'm3-p4',
    leftTitle: 'Ruang dalam Sejarah',
    rightTitle: 'Tempat berlakunya peristiwa (cth: tempatan, negara, rantau)',
    explanation: 'Pembahagian ruang memudahkan ahli sejarah memfokuskan kajian mengikut kawasan geografi.',
  },
];

// ============================================================
// MISSION 4: SUMBER SEJARAH (Archaeological Museum)
// ============================================================
export const M4_HIDDEN_OBJECTS: HiddenObjectItem[] = [
  {
    id: 'art-fosil',
    label: 'Fosil Tumbuhan Purba',
    badge: 'Sudut Geologi',
    fact: 'Tinggalan haiwan atau tumbuhan yang wujud pada zaman lampau — tergolong dalam Sumber Primer.',
    xPct: 16,
    yPct: 35,
    colorHex: '#10b981',
  },
  {
    id: 'art-batu',
    label: 'Batu Bersurat Terengganu',
    badge: 'Astaka Tengah',
    fact: 'Bukti bertulis asli bertarikh 1303 M yang terpahat pada batu — Sumber Primer.',
    xPct: 50,
    yPct: 26,
    colorHex: '#8b5cf6',
  },
  {
    id: 'art-kapak',
    label: 'Kapak Batu Neolitik',
    badge: 'Almari Artifak',
    fact: 'Peralatan ciptaan manusia yang boleh dialihkan — contoh Artifak (Sumber Primer).',
    xPct: 82,
    yPct: 38,
    colorHex: '#f59e0b',
  },
  {
    id: 'art-buku',
    label: 'Buku Sejarah Moden',
    badge: 'Meja Rujukan',
    fact: 'Bahan yang telah diolah dan diterbitkan berdasarkan kajian sumber primer — Sumber Sekunder.',
    xPct: 28,
    yPct: 72,
    colorHex: '#0ea5e9',
  },
  {
    id: 'art-akhbar',
    label: 'Akhbar & Risalah Lama',
    badge: 'Rak Arkib Akhbar',
    fact: 'Bahan terbitan bercetak untuk bacaan umum — Sumber Sekunder.',
    xPct: 72,
    yPct: 70,
    colorHex: '#f43f5e',
  },
];

export const M4_BUCKETS: ClassifyBucket[] = [
  {
    id: 'primer',
    title: 'Sumber Primer (Sumber Pertama)',
    subtitle: 'Belum diolah/diterbitkan · Bersifat asli',
    colorHex: '#8b5cf6',
  },
  {
    id: 'sekunder',
    title: 'Sumber Sekunder (Sumber Kedua)',
    subtitle: 'Telah diolah, ditulis & diterbitkan',
    colorHex: '#0ea5e9',
  },
];

export const M4_CLASSIFY_ITEMS: ClassifyItem[] = [
  {
    id: 's-1',
    label: 'Fosil & Artifak Tembikar Purba',
    bucketId: 'primer',
    hint: 'Adakah ia bahan asli yang belum diolah oleh penulis?',
    explanation: 'Fosil dan artifak adalah tinggalan asli yang belum diolah — Sumber Primer.',
  },
  {
    id: 's-2',
    label: 'Batu Bersurat & Manuskrip Asli',
    bucketId: 'primer',
    hint: 'Ia ditulis terus pada zaman peristiwa tersebut berlaku.',
    explanation: 'Batu bersurat dan manuskrip asli merupakan Sumber Primer.',
  },
  {
    id: 's-3',
    label: 'Buku Teks & Ensiklopedia Sejarah',
    bucketId: 'sekunder',
    hint: 'Bahan ini disusun dan dicetak selepas kajian dibuat.',
    explanation: 'Buku dan ensiklopedia ialah bahan olahan terbitan umum — Sumber Sekunder.',
  },
  {
    id: 's-4',
    label: 'Majalah, Akhbar & Jurnal Penyelidikan',
    bucketId: 'sekunder',
    hint: 'Diterbitkan kepada pembaca umum oleh penulis atau wartawan.',
    explanation: 'Majalah, akhbar dan jurnal tergolong dalam Sumber Sekunder.',
  },
  {
    id: 's-5',
    label: 'Tapak Candi Lembah Bujang (Bukan Artifak)',
    bucketId: 'primer',
    hint: 'Struktur binaan asli di tapak arkeologi.',
    explanation: 'Tapak binaan purba (bukan artifak) adalah bukti asli Sumber Primer.',
  },
  {
    id: 's-6',
    label: 'Risalah Pameran Muzium',
    bucketId: 'sekunder',
    hint: 'Risalah ialah bahan cetak ringkas yang telah diolah.',
    explanation: 'Risalah disediakan berdasarkan sumber primer untuk bacaan pelawat — Sumber Sekunder.',
  },
];

// ============================================================
// MISSION 5: KAEDAH PENYELIDIKAN (Archaeological Adventure Site)
// ============================================================
export const M5_EXPEDITION_ZONES: DigTile[] = [
  {
    id: 'z-bertulis',
    zoneLabel: 'Perpustakaan Purba (Kaedah Bertulis)',
    methodTag: 'Bertulis',
    discoveryTitle: 'Manuskrip Daun Lontar & Dokumen Arkib',
    discoveryText:
      'Penyelidik mengkaji catatan tulisan pada dinding gua, kayu, batu, kulit haiwan, daun lontar serta fail rasmi di arkib.',
  },
  {
    id: 'z-lisan',
    zoneLabel: 'Kem Temu Bual Orang Sumber (Kaedah Lisan)',
    methodTag: 'Lisan',
    discoveryTitle: 'Temu Bual Pak Ali (Saksi Zaman 1957)',
    discoveryText:
      'Melibatkan 3 tahap: Tahap 1 (Persediaan soalan), Tahap 2 (Rakaman temu bual), dan Tahap 3 (Memproses rakaman menjadi teks).',
  },
  {
    id: 'z-arkeologi-darat',
    zoneLabel: 'Tapak Ekskavasi Darat (Kaedah Arkeologi)',
    methodTag: 'Arkeologi',
    discoveryTitle: 'Serpihan Tembikar Zaman Prasejarah',
    discoveryText:
      'Ahli arkeologi menanda grid petak gali cari, menggali dengan berhati-hati menggunakan sudip dan berus, lalu menguji usia di makmal.',
  },
  {
    id: 'z-arkeologi-air',
    zoneLabel: 'Zon Kapal Karam (Arkeologi Bawah Air)',
    methodTag: 'Arkeologi',
    discoveryTitle: 'Porselin Dinasti Ming di Dasar Selat Melaka',
    discoveryText:
      'Penyelam arkeologi merekod kedudukan kapal karam menggunakan fotografi dasar laut sebelum mengangkat artifak.',
  },
];

export const M5_BUCKETS: ClassifyBucket[] = [
  {
    id: 'bertulis',
    title: 'Kaedah Bertulis',
    subtitle: 'Rekod, dokumen, batu & manuskrip',
    colorHex: '#f59e0b',
  },
  {
    id: 'lisan',
    title: 'Kaedah Lisan',
    subtitle: 'Temu bual orang sumber / saksi',
    colorHex: '#10b981',
  },
  {
    id: 'arkeologi',
    title: 'Kaedah Arkeologi',
    subtitle: 'Gali cari (ekskavasi) darat & air',
    colorHex: '#f43f5e',
  },
];

export const M5_CLASSIFY_ITEMS: ClassifyItem[] = [
  {
    id: 'k-1',
    label: 'Mengkaji catatan pada daun lontar dan dokumen Arkib Negara',
    bucketId: 'bertulis',
    hint: 'Melibatkan sumber teks atau tulisan purba.',
    explanation: 'Mengkaji catatan bertulis pada batu, daun lontar atau dokumen ialah Kaedah Bertulis.',
  },
  {
    id: 'k-2',
    label: 'Menemubual tokoh veteran dan merakam perbualan (3 tahap)',
    bucketId: 'lisan',
    hint: 'Mendapatkan keterangan terus daripada orang sumber secara lisan.',
    explanation: 'Temu bual dan rakaman orang sumber ialah Kaedah Lisan.',
  },
  {
    id: 'k-3',
    label: 'Menggali tapak penempatan purba di Gua Niah menggunakan berus',
    bucketId: 'arkeologi',
    hint: 'Proses gali cari bahan tinggalan di dalam tanah.',
    explanation: 'Aktiviti ekskavasi di tapak penempatan purba ialah Kaedah Arkeologi.',
  },
  {
    id: 'k-4',
    label: 'Menyelam ke dasar laut mengkaji kapal dagang karam',
    bucketId: 'arkeologi',
    hint: 'Ini dikenali sebagai arkeologi bawah air.',
    explanation: 'Kajian kapal karam di dasar laut tergolong dalam Kaedah Arkeologi.',
  },
  {
    id: 'k-5',
    label: 'Menyalin dan memproses rakaman pita audio orang sumber',
    bucketId: 'lisan',
    hint: 'Ini ialah Tahap 3 dalam satu kaedah penyelidikan.',
    explanation: 'Memproses rakaman temu bual ialah tahap ketiga dalam Kaedah Lisan.',
  },
  {
    id: 'k-6',
    label: 'Mentafsir tulisan Jawi pada Batu Bersurat',
    bucketId: 'bertulis',
    hint: 'Fokusnya ialah menganalisis tulisan yang terpahat.',
    explanation: 'Mengkaji tulisan terpahat pada batu ialah Kaedah Bertulis.',
  },
];

// ============================================================
// MISSION 6: SEBAB DAN AKIBAT (Fantasy Kingdom Domino)
// ============================================================
export const M6_CAUSE_EFFECT_PAIRS: MatchPair[] = [
  {
    id: 'ce-1',
    leftTitle: 'Sebab: Pelabuhan Melaka terlindung daripada angin monsun',
    rightTitle: 'Akibat: Melaka menjadi pusat perdagangan entrepot yang makmur',
    explanation: 'Keselamatan pelabuhan menarik pedagang dari India, China dan Arab.',
  },
  {
    id: 'ce-2',
    leftTitle: 'Sebab: Perpaduan erat pelbagai kaum menuntut kebebasan',
    rightTitle: 'Akibat: Kemerdekaan Tanah Melayu dicapai pada 31 Ogos 1957',
    explanation: 'Kesepakatan rakyat merupakan faktor utama kejayaan rundingan kemerdekaan.',
  },
  {
    id: 'ce-3',
    leftTitle: 'Sebab: Penemuan kawasan lombong bijih timah yang luas',
    rightTitle: 'Akibat: Pembinaan jalan kereta api dan bandar baharu seperti Ipoh',
    explanation: 'Pengeluaran bijih timah memerlukan sistem pengangkutan yang cekap.',
  },
  {
    id: 'ce-4',
    leftTitle: 'Sebab: Kemasukan kuasa penjajah menggunakan dasar pecah dan perintah',
    rightTitle: 'Akibat: Pengasingan petempatan dan jurang ekonomi antara kaum',
    explanation: 'Dasar penjajah menyebabkan masyarakat terpisah mengikut kegiatan ekonomi.',
  },
];

export const M6_DOMINO_CHAIN: ChronoEventItem[] = [
  {
    id: 'dom-1',
    title: 'Domino 1 (Sebab): Kedudukan strategik Melaka di tengah laluan Selat Melaka',
    timeLabel: 'Punca Awal',
    detail: 'Kapal pedagang Timur dan Barat mudah singgah untuk mendapatkan bekalan dan berteduh.',
    order: 1,
  },
  {
    id: 'dom-2',
    title: 'Domino 2 (Peristiwa): Pedagang asing berdagang serta menyebarkan budaya dan agama Islam',
    timeLabel: 'Tindak Balas',
    detail: 'Golongan ulama dan pedagang berinteraksi dengan pembesar serta penduduk tempatan.',
    order: 2,
  },
  {
    id: 'dom-3',
    title: 'Domino 3 (Akibat): Melaka muncul sebagai empayar maritim dan pusat penyebaran Islam terunggul',
    timeLabel: 'Kesan Akhir',
    detail: 'Undang-undang Laut Melaka dan pentadbiran sistematik menjamin kemakmuran kerajaan.',
    order: 3,
  },
];

// ============================================================
// MISSION 7: PENTAFSIRAN SEJARAH (Historical Detective City)
// ============================================================
export const M7_HIDDEN_CLUES: HiddenObjectItem[] = [
  {
    id: 'clue-sumber',
    label: 'Pemilihan Sumber Pelbagai',
    badge: 'Lorong Arkib',
    fact: 'Sejarawan mungkin merujuk sumber berbeza (contoh: dokumen penjajah vs catatan tempatan), lalu menghasilkan tafsiran berlainan.',
    xPct: 20,
    yPct: 30,
    colorHex: '#14b8a6',
  },
  {
    id: 'clue-pandangan',
    label: 'Perbezaan Pandangan',
    badge: 'Balai Kanta',
    fact: 'Sudut pandangan penulis (pihak berkuasa vs rakyat tempatan) mempengaruhi cara sesuatu peristiwa digambarkan.',
    xPct: 78,
    yPct: 30,
    colorHex: '#38bdf8',
  },
  {
    id: 'clue-ideologi',
    label: 'Perbezaan Ideologi',
    badge: 'Papan Bukti',
    fact: 'Pegangan politik, kepercayaan atau fahaman seseorang penulis boleh mempengaruhi penekanan faktanya.',
    xPct: 25,
    yPct: 72,
    colorHex: '#f59e0b',
  },
  {
    id: 'clue-tujuan',
    label: 'Tujuan Penulisan',
    badge: 'Menara Jam Kota',
    fact: 'Sama ada laporan ditulis untuk pentadbiran penjajah atau untuk membangkitkan semangat patriotik rakyat.',
    xPct: 75,
    yPct: 70,
    colorHex: '#f43f5e',
  },
];

export const M7_DETECTIVE_CASES: DetectiveCaseItem[] = [
  {
    id: 'case-1',
    caseTitle: 'Kes 1: Perjuangan Tok Janggut & Dato\' Bahaman',
    sourceA: {
      label: 'Laporan Pentadbir British (1915)',
      text: '"Tindakan menentang kutipan cukai baharu dianggap sebagai penderhakaan dan gangguan ketenteraman awam."',
    },
    sourceB: {
      label: 'Kajian Sejarawan Malaysia',
      text: '"Mereka bangkit menentang campur tangan asing demi mempertahankan kedaulatan tanah air dan hak penduduk tempatan."',
    },
    question: 'Berdasarkan kedua-dua sumber di atas, apakah kesimpulan detektif sejarah yang paling tepat?',
    options: [
      'Wujud pentafsiran berbeza kerana sudut pandangan dan kepentingan pihak penulis yang berlainan',
      'Peristiwa penentangan tersebut tidak pernah berlaku sama sekali',
      'Semua sumber tempatan tidak boleh diterima pakai',
      'Pentafsiran sejarah tidak memerlukan sebarang bukti bertulis',
    ],
    correctIndex: 0,
    hint: 'Bandingkan kedudukan penulis Sumber A (penjajah) dengan Sumber B (tempatan).',
    explanation:
      'Kedua-dua sumber merujuk peristiwa yang sama, tetapi ditafsir berbeza akibat perbezaan sudut pandangan dan tujuan penulisan.',
  },
  {
    id: 'case-2',
    caseTitle: 'Kes 2: Etika Menilai Sumber Bercanggah',
    sourceA: {
      label: 'Catatan Pengembara Asing',
      text: '"Pelabuhan ini sentiasa sibuk dan penduduknya mengamalkan adat sopan yang tinggi."',
    },
    sourceB: {
      label: 'Rekod Rasmi Pelabuhan',
      text: '"Lebih 80 bahasa dipertuturkan di pelabuhan dengan kawalan Syahbandar yang teratur."',
    },
    question: 'Bagaimanakah seorang detektif sejarah memastikan pentafsirannya kekal berwibawa?',
    options: [
      'Membandingkan pelbagai sumber secara jujur, objektif dan berlandaskan bukti kukuh',
      'Memilih satu ayat sahaja dan menokok tambah cerita khayalan',
      'Mengabaikan rekod rasmi pelabuhan',
      'Mengubah tarikh dokumen mengikut citarasa sendiri',
    ],
    correctIndex: 0,
    hint: 'Sejarawan yang jujur menggabungkan bukti daripada pelbagai sumber sahih.',
    explanation:
      'Kajian berlandaskan pelbagai sumber secara jujur dan objektif menghasilkan pentafsiran sejarah yang adil serta tepat.',
  },
];

// ============================================================
// MISSION 8: KEPENTINGAN MEMPELAJARI SEJARAH (Heritage Kingdom)
// ============================================================
export const M8_HIDDEN_TREASURES: HiddenObjectItem[] = [
  {
    id: 'tr-patriotik',
    label: 'Panji Merah Putih',
    badge: 'Menara Bendera',
    fact: '1. Menerapkan semangat patriotik — menumbuhkan rasa cinta, setia dan kesanggupan berkorban demi negara.',
    xPct: 16,
    yPct: 28,
    colorHex: '#f43f5e',
  },
  {
    id: 'tr-keagungan',
    label: 'Cop Mohor Kesultanan',
    badge: 'Balai Singgahsana',
    fact: '2. Mengetahui keagungan bangsa — menyedari kehebatan tamadun dan kerajaan silam negara kita.',
    xPct: 50,
    yPct: 22,
    colorHex: '#f59e0b',
  },
  {
    id: 'tr-warisan',
    label: 'Songket & Keris Diraja',
    badge: 'Balai Seni Warisan',
    fact: '3. Menghargai warisan — memelihara seni bina, adat resam, bahasa dan tinggalan budaya bangsa.',
    xPct: 84,
    yPct: 30,
    colorHex: '#8b5cf6',
  },
  {
    id: 'tr-tokoh',
    label: 'Tugu Pejuang Negara',
    badge: 'Taman Pahlawan',
    fact: '4. Mengenang jasa tokoh — menghormati sumbangan pemimpin dan perwira yang membangunkan negara.',
    xPct: 26,
    yPct: 72,
    colorHex: '#10b981',
  },
  {
    id: 'tr-iktibar',
    label: 'Lampu Obor Pedoman',
    badge: 'Pintu Gerbang Ilmu',
    fact: '5. Mengambil iktibar — menjadikan pengajaran masa lalu sebagai panduan agar kesilapan tidak berulang.',
    xPct: 74,
    yPct: 72,
    colorHex: '#0ea5e9',
  },
];

export const M8_MATCH_PAIRS: MatchPair[] = [
  {
    id: 'm8-p1',
    leftTitle: 'Mengibar Jalur Gemilang dan menghormati lagu kebangsaan',
    rightTitle: 'Menerapkan semangat patriotik',
    explanation: 'Tindakan ini menunjukkan rasa cinta dan taat setia kepada tanah air.',
  },
  {
    id: 'm8-p2',
    leftTitle: 'Mengkaji kejayaan Melaka sebagai pusat perdagangan maritim dunia',
    rightTitle: 'Mengetahui keagungan bangsa',
    explanation: 'Menyedari pencapaian gemilang nenek moyang membina keyakinan jati diri.',
  },
  {
    id: 'm8-p3',
    leftTitle: 'Memelihara bangunan bersejarah dan kesenian tradisional',
    rightTitle: 'Menghargai warisan',
    explanation: 'Warisan budaya dan monumen lama adalah khazanah berharga negara.',
  },
  {
    id: 'm8-p4',
    leftTitle: 'Menghormati pengorbanan Tunku Abdul Rahman dan Rentap',
    rightTitle: 'Mengenang jasa tokoh',
    explanation: 'Mengenang jasa tokoh mendidik kita menghargai kemerdekaan yang dinikmati.',
  },
  {
    id: 'm8-p5',
    leftTitle: 'Menjaga perpaduan supaya tragedi perpecahan silam tidak berulang',
    rightTitle: 'Mengambil iktibar',
    explanation: 'Pengajaran daripada sejarah silam menjadi pedoman kesejahteraan masa depan.',
  },
];
