# ✊✌️✋ Batu Gunting Kertas AI (Teachable Machine & TensorFlow.js)

Game web interaktif **Batu Gunting Kertas** yang ditenagai oleh Machine Learning menggunakan **Google Teachable Machine** dan **TensorFlow.js**. Aplikasi ini mendeteksi gestur tangan pemain melalui webcam secara real-time dan siap dideploy langsung ke **GitHub Pages**.

---

## ✨ Fitur Utama

- **Deteksi Gestur Kamera Real-Time**: Mengenali gestur Batu (✊), Gunting (✌️), dan Kertas (✋) langsung melalui webcam menggunakan model Teachable Machine berbasis TensorFlow.js.
- **Dukungan Custom Model AI**: Anda dapat memasukkan URL model Teachable Machine buatan sendiri atau menggunakan model default yang telah disediakan.
- **Mode Manual / Simulasi**: Pilihan tombol cepat untuk menguji game tanpa kamera atau ketika sedang berada di perangkat tanpa akses webcam.
- **Mode Pertandingan Fleksibel**:
  - *Endless Mode* (Bebas tanpa batas)
  - *Best of 3* (Siapa cepat menang 2 ronde)
  - *Best of 5* (Siapa cepat menang 3 ronde)
- **Sound Effects Web Audio API**: Efek suara sintetis tanpa aset eksternal (suara hitung mundur, tembakan, menang, kalah, dan seri).
- **Riwayat & Statistik**: Mencatat log pertandingan, persentase kemenangan (*win rate*), serta *win streak*.
- **Siap Deploy ke GitHub Pages**: Konfigurasi `base: './'` pada Vite dan workflow GitHub Actions siap pakai.

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repository:**
   ```bash
   git clone https://github.com/username/batu-gunting-kertas-ai.git
   cd batu-gunting-kertas-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda.

4. **Build untuk produksi:**
   ```bash
   npm run build
   ```
   File hasil build statis akan tersimpan di dalam folder `dist/`.

---

## 🌐 Cara Deploy ke GitHub Pages

Aplikasi ini adalah Static Single Page Application (SPA) murni berbasis client-side, sehingga sangat cocok dan 100% gratis dihosting di GitHub Pages.

### Metode 1: Otomatis via GitHub Actions (Sangat Disarankan)

File workflow telah tersedia di `.github/workflows/deploy.yml`:

1. Push kode ke repository GitHub Anda pada branch `main`.
2. Buka repository di GitHub, masuk ke tab **Settings** > **Pages**.
3. Pada bagian **Build and deployment** > **Source**, pilih opsi **GitHub Actions**.
4. GitHub Actions akan otomatis membuild dan mempublikasikan website ke:
   ```
   https://<username>.github.io/<nama-repo>/
   ```

### Metode 2: Deploy Cepat via `gh-pages`

1. Jalankan perintah:
   ```bash
   npm run build
   npx gh-pages -d dist
   ```
2. Pada repository GitHub, masuk ke **Settings** > **Pages**.
3. Pilih branch **gh-pages** dan folder **/(root)**, lalu klik **Save**.

---

## 🧠 Cara Melatih Model Sendiri di Google Teachable Machine

1. Buka [Teachable Machine Image Project](https://teachablemachine.withgoogle.com/train/image).
2. Buat 4 kelas:
   - **Batu**: Kepalkan tangan (ambil ~50-100 foto dari berbagai sudut).
   - **Gunting**: Acungkan dua jari telunjuk & tengah (50-100 foto).
   - **Kertas**: Buka seluruh telapak tangan (50-100 foto).
   - **Netral**: Tangan kosong / background santai (50-100 foto).
3. Klik tombol **Train Model** dan tunggu sampai proses selesai.
4. Klik **Export Model** > pilih tab **Tensorflow.js** > klik **Upload (shareable link)**.
5. Salin link URL model (contoh: `https://teachablemachine.withgoogle.com/models/xxxxxx/`).
6. Di game web ini, klik tombol **Model AI** di pojok kanan atas, tempelkan link Anda, dan klik **Terapkan Model**!

---

## 🛠️ Teknologi yang Digunakan

- **React 19 & TypeScript**
- **TensorFlow.js & Teachable Machine Image Library**
- **Tailwind CSS v4**
- **Vite**
- **Lucide Icons**
- **Web Audio API**
