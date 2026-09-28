# Resonance Protocol

Blog statis bertema gabungan **Wuthering Waves** dan **Punishing: Gray Raven**, dibuat untuk **Ryuto Kazuma**.

## Struktur folder

```text
wuthering-pgr-blog/
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── index.html
├── ryuto.html
├── game.html
├── gameplay.html
├── skill.html
└── assets/
    └── audio/
        ├── wuthering-echoes.mp3
        ├── gray-raven-signal.mp3
        └── terminal-horizon.mp3
```

## Fitur

- Beranda dengan hero foto Rover dan karakter Punishing: Gray Raven
- Halaman khusus Ryuto Kazuma
- Database game dan galeri karakter lokal
- Galeri foto gameplay
- Intro animation dengan JavaScript
- Music player melayang, responsif, rounded, dan bergaya vinyl
- Playlist **auto-detect MP3** tanpa perlu mengedit HTML

## Cara menambah musik tanpa coding

Cukup salin file musik `.mp3` ke folder berikut:

```text
assets/audio/
```

Contoh:

```text
assets/audio/
├── wuthering-echoes.mp3
├── gray-raven-signal.mp3
├── terminal-horizon.mp3
└── lagu-baru.mp3
```

Setelah itu jalankan ulang server lokal dan refresh halaman. `js/script.js` akan membaca semua file `.mp3` dari folder tersebut, membuat playlist otomatis, memberi judul berdasarkan nama file, dan memilih album art berdasarkan nama file.

Gunakan nama file yang rapi, misalnya:

```text
lucia-crimson-weave.mp3
jinshi-resonator-theme.mp3
```

Nama file yang mengandung `gray`, `raven`, `pgr`, atau `punishing` akan mendapat album art PGR. Nama lainnya akan mendapat album art Wuthering Waves secara default.

## Menjalankan

Auto-detect folder membutuhkan server lokal. Dari folder proyek, jalankan:

```bash
python3 -m http.server 8000
```

Lalu akses `http://localhost:8000`.

> Catatan: audio contoh di proyek ini adalah audio ambient fan-made. Gunakan musik yang kamu miliki atau yang memiliki izin penggunaan agar aman dari copyright.

### Jika memakai Acode atau membuka file langsung

Karena browser tidak memberi JavaScript izin membaca daftar folder secara langsung dari `file://`, tekan tombol **Muat MP3 dari folder audio** pada widget. Pilih semua file MP3 yang ingin diputar dari folder `assets/audio/`. Playlist akan langsung berganti ke file-file yang dipilih tanpa perlu mengubah kode. Daftar yang dipilih berlaku selama halaman sedang terbuka.
