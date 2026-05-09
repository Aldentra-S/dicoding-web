Smart Finance - Konsultasi Keuangan Online

Deskripsi Singkat Proyek
Smart Finance adalah aplikasi berbasis web yang dirancang untuk membantu pengguna mengelola kesehatan finansial mereka. Fitur utama aplikasi ini mencakup cek kesehatan keuangan dan sistem booking konsultasi dengan tenaga ahli perencanaan keuangan secara online. Proyek ini dibangun menggunakan arsitektur Full-Stack dengan React.js di sisi Frontend dan Node.js/Express di sisi Backend, serta MySQL sebagai sistem manajemen database.

Petunjuk Setup Environment
Sebelum menjalankan aplikasi, pastikan Anda telah menginstal Node.js (Versi 16 atau terbaru), XAMPP, dan Git.
Persiapan Database
1. Jalankan XAMPP Control Panel dan aktifkan modul Apache serta MySQL.
2. Buka browser dan akses http://localhost/phpmyadmin.
3. Buat database baru dengan nama smart_finance.
4. Import file smart_finance.sql yang tersedia di root folder untuk membuat tabel secara otomatis.

Konfigurasi Backend
1. Masuk ke folder backend: cd smart_finance_backend
2. Instal semua library: npm install
3. Salin file .env.example menjadi .env dan sesuaikan konfigurasi database Anda.

Konfigurasi Frontend
1. Masuk ke folder frontend: cd smart_finance_frontend
2. Instal semua library: npm install
3. Salin file .env.example menjadi .env.

Tautan Model ML
Proyek ini merupakan aplikasi manajemen data keuangan berbasis Full-Stack Web dan tidak menggunakan model Machine Learning.

Cara Menjalankan Aplikasi
Anda harus menjalankan dua terminal secara bersamaan:

Menjalankan Server (Backend)
Buka terminal baru, masuk ke folder backend, lalu jalankan:
npm run dev
Server akan berjalan di: http://localhost:3000

Menjalankan Website (Frontend)
Buka terminal satu lagi, masuk ke folder frontend, lalu jalankan:
npm run dev
Aplikasi dapat diakses melalui browser di: http://localhost:5173
