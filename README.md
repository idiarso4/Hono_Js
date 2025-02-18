# Sistem Manajemen Kehadiran dan Administrasi Sekolah

Aplikasi web komprehensif untuk manajemen kehadiran dan administrasi sekolah dengan berbagai fitur untuk siswa, guru, dan staf administrasi.

## Fitur Utama

### 1. Dashboard & Navigasi
- Interface yang intuitif dan responsif
- Menu yang disesuaikan berdasarkan role pengguna
- Statistik dan grafik real-time
- Notifikasi dan pengumuman penting

### 2. Manajemen Kehadiran
- Multiple metode kehadiran:
  * Face Recognition
  * QR Code
  * Photo-based
- Tracking lokasi kehadiran
- Workflow persetujuan kehadiran siswa
- Laporan kehadiran real-time
- Notifikasi keterlambatan
- Export laporan dalam berbagai format

### 3. Sistem Jurnal

#### PKL Jurnal
- Input kegiatan harian PKL
- Upload dokumentasi kegiatan
- Approval pembimbing PKL
- Laporan progress PKL
- Evaluasi dan penilaian
- Template jurnal standar
- Monitoring aktivitas PKL

#### Teacher Jurnal
- Pencatatan aktivitas mengajar
- Dokumentasi materi pembelajaran
- Catatan perkembangan siswa
- Evaluasi pembelajaran
- Laporan performa kelas
- Rencana pembelajaran
- Sharing resource pembelajaran

### 4. Kegiatan Ekstrakurikuler
- Pendaftaran ekstrakurikuler
- Jadwal kegiatan
- Presensi peserta
- Pencatatan prestasi
- Laporan perkembangan
- Dokumentasi kegiatan
- Manajemen kompetisi
- Evaluasi kegiatan

### 5. Prayer Management
- Jadwal sholat
- Tracking kehadiran sholat berjamaah
- Laporan keaktifan ibadah
- Monitoring wudhu
- Pencatatan imam dan muadzin
- Jadwal kultum
- Manajemen kegiatan keagamaan

### 6. Administrasi Perizinan
- Izin masuk/keluar sekolah
- Workflow persetujuan bertingkat
- Notifikasi otomatis
- Tracking durasi izin
- Laporan perizinan
- Kategorisasi izin
- Histori perizinan
- Template surat izin

### 7. Manajemen Inventaris
- Pelaporan kerusakan barang
- Status perbaikan
- Tracking inventaris
- Riwayat maintenance
- Estimasi biaya perbaikan
- Barcode scanning
- Kategorisasi aset
- Laporan kondisi aset

### 8. Administrasi BK
- Pencatatan home visit
- Dokumentasi konseling
- Laporan perkembangan siswa
- Catatan tindak lanjut
- Jadwal konseling
- Riwayat kasus
- Template laporan BK
- Koordinasi dengan wali kelas
- Notifikasi untuk orang tua
- Tracking perkembangan siswa

### 9. Backup & Restore
- Backup otomatis terjadwal
- Download backup dalam format ZIP
- Restore dari file backup
- Versioning backup
- Enkripsi data sensitif
- Cloud storage integration
- Notifikasi status backup
- Log aktivitas backup/restore

### 10. User Management
- Multi-role (Admin, Guru, Siswa, BK)
- Autentikasi JWT
- Role-based access control
- Manajemen profil
- Reset password
- Two-factor authentication
- Session management
- Audit log aktivitas

## Development Timeline

### 18 February 2025

#### Teacher Journal Management (16:50)
- Created Pinia store for teacher journal management (`src/frontend/src/stores/teacherJournal.ts`)
  - CRUD operations for journal entries
  - Material file uploads
  - Journal statistics
  - Loading and error state management
- Implemented teacher journal Vue component (`src/frontend/src/views/teacher/TeacherJournal.vue`)
  - Modern and responsive UI
  - Create, edit, delete journal entries
  - Filter by date range and subject
  - Upload teaching materials
  - Monthly statistics view

#### Counseling Management (16:59)
- Created Pinia store for counseling management (`src/frontend/src/stores/counseling.ts`)
  - CRUD operations for counseling sessions
  - Student search functionality
  - File attachments handling
  - Counseling statistics
- Implemented counseling session Vue component (`src/frontend/src/views/counselor/CounselingSession.vue`)
  - Comprehensive counseling session management
  - Student search with auto-complete
  - Session filtering and status tracking
  - File attachments support
  - Monthly statistics dashboard

#### Home Visit Management (17:00)
- Created Pinia store for home visit management (`src/frontend/src/stores/homeVisit.ts`)
  - CRUD operations for home visits
  - Photo and document uploads
  - Visit statistics
  - Student search integration
  - Pending: Home visit Vue component implementation

### Upcoming Tasks
1. Complete Home Visit Vue component
2. Implement damage report management
3. Create comprehensive admin dashboard
4. Add advanced reporting features
5. Enhance security measures
6. Implement production database migration

## Tech Stack

### Backend
- Hono (TypeScript)
- Prisma ORM
- SQLite (development)
- PostgreSQL (production)
- JWT Authentication
- Zod Validation
- WebSocket untuk real-time features

### Frontend
- Vue.js 3
- TypeScript
- Pinia State Management
- Vue Router
- Axios
- DayJS
- TailwindCSS
- Face-api.js
- QR Scanner

### Security Features
- Data encryption at rest
- Secure password hashing
- CSRF protection
- Rate limiting
- Input sanitization
- SQL injection prevention
- XSS protection

## Instalasi

1. Clone repository
```bash
git clone [repository-url]
cd [project-directory]
```

2. Install dependencies
```bash
npm install
```

3. Setup environment
```bash
cp .env.example .env
```

4. Setup database
```bash
npx prisma migrate dev
```

5. Run development server
```bash
npm run dev
```

## Environment Variables

Buat file `.env` dengan variabel berikut:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=3000
BACKUP_PATH="./backups"
UPLOAD_PATH="./uploads"
FACE_API_KEY="your-face-api-key"
```

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Attendance System
![Attendance](screenshots/attendance.png)

### Student Portal
![Student Portal](screenshots/student-portal.png)

### Teacher Portal
![Teacher Portal](screenshots/teacher-portal.png)

## Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## Tim Pengembang

- Project Manager: [Nama]
- Lead Developer: [Nama]
- UI/UX Designer: [Nama]
- Backend Developer: [Nama]
- Frontend Developer: [Nama]
- Quality Assurance: [Nama]

## Kontak

Email: support@sekolah-system.com
Website: https://sekolah-system.com
GitHub: [repository-url]

## Acknowledgments

- [Vue.js](https://vuejs.org/)
- [Hono](https://honojs.dev/)
- [Prisma](https://www.prisma.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [Face-api.js](https://github.com/justadudewhohacks/face-api.js/)
