<p align="center">
  <img src="public/img/logo.png" width="120" height="120" style="border-radius: 50%; box-shadow: 0 0 25px rgba(59, 130, 246, 0.5);" alt="HS15 Logo" />
</p>

<h1 align="center">HS15 - Web Gallery & Archive</h1>

<p align="center">
  <strong>Pusat galeri dan arsip digital foto serta rekaman video kegiatan Komunitas Keliling Banjar didukung Google Drive API.</strong>
</p>

<div align="center">
  <a href="https://github.com/zerabyte88/web-komunitas-hs15"><img src="https://img.shields.io/static/v1?label=Version&message=v2.0.0&color=2563eb&style=flat-square&logo=github&logoColor=white" alt="Version" /></a>
  <img src="https://img.shields.io/static/v1?label=Framework&message=Nuxt%203%20(Vue%203)&color=00DC82&style=flat-square&logo=nuxtdotjs&logoColor=white" alt="Framework" />
  <img src="https://img.shields.io/static/v1?label=Styling&message=Tailwind%20CSS%20%2B%20DaisyUI&color=38bdf8&style=flat-square&logo=tailwindcss&logoColor=white" alt="Styling" />
  <img src="https://img.shields.io/static/v1?label=Lightbox&message=Fancybox%20v5&color=a855f7&style=flat-square" alt="Lightbox" />
  <img src="https://img.shields.io/static/v1?label=Storage&message=Google%20Drive%20API&color=ea4335&style=flat-square&logo=googledrive&logoColor=white" alt="Storage" />
  <a href="LICENSE"><img src="https://img.shields.io/static/v1?label=License&message=MIT&color=334155&style=flat-square" alt="License" /></a>

  <p>
    <a href="#overview">Overview</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#license">License</a>
  </p>
</div>

---

## Overview

Website galeri dan arsip digital dokumentasi **HS15 - Komunitas Keliling Banjar**. Dibangun dengan **Nuxt 3 Fullstack (SSR + Vue 3)**, antarmuka bertema gelap (*dark mode*) **Tailwind CSS + DaisyUI**, serta terhubung langsung ke **Google Drive API v3** untuk menyajikan foto dan video tanpa database SQL konvensional.

---

## Features

* **Galeri Foto & Fancybox v5:** Lightbox interaktif resolusi penuh dengan fitur *zoom*, *pan*, *thumbnail strip*, rotasi, tayangan *slideshow*, dan unduh foto asli.
* **Galeri Video:** Pemutar video modal responsif dengan poster sampul, penanda durasi, dan pemutaran lancar.
* **Google Drive API v3:** Pengambilan media langsung dari folder Google Drive tanpa database server, dilengkapi *in-memory cache* 5 menit untuk kecepatan dan penghematan kuota API.
* **Filter & Pencarian:** Navigasi media per album/kegiatan serta pencarian judul dan opsi sortir (*Terbaru*, *Terlama*, *A-Z*, *Z-A*).
* **Desain Khas HS15:** Tema gelap kustom `hs15dark` dengan *glassmorphism*, tata letak responsif, dan *slideshow* crossfade latar belakang 5 foto asli komunitas.
* **Modal Pengaturan Drive:** Antarmuka praktis untuk mengatur dan menguji koneksi Folder ID dan API Key Google Drive langsung dari web, lengkap dengan fallback data lokal.

---

## Tech Stack

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | [Nuxt 3](https://nuxt.com/) (Vue 3 + Vite) | Fullstack SSR & Nitro Server Engine |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI 4](https://daisyui.com/) | Tema gelap kustom `hs15dark` |
| **Lightbox** | [Fancyapps UI v5](https://fancyapps.com/fancybox/) | Viewer foto interaktif & modal video |
| **Storage Backend** | [Google Drive API v3](https://developers.google.com/drive) | Arsip media awan terpusat (Read-Only) |
| **Language** | TypeScript | Tipisasi data untuk media dan album |

---

## License

Proyek ini dilisensikan di bawah **MIT License**. Silakan lihat berkas [LICENSE](LICENSE) untuk ketentuan dan informasi hak cipta selengkapnya.

---

<div align="center">
  <br/>
  <a href="https://github.com/zerabyte88">
    <img src="https://github.com/zerabyte88.png" width="48" height="48" style="border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);" alt="zerabyte88" />
  </a>
  <br/>
  <sub>Developed with ❤️ for <strong>HS15 - Komunitas Keliling Banjar</strong> by <a href="https://github.com/zerabyte88">zerabyte88</a></sub>
</div>
