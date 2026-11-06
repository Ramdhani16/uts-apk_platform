/* Rental Mobil Legenda 019 - Interaktivitas dengan JavaScript (Vanilla JS)
   Satu file untuk dua halaman:
   - katalog_019.html   : pencarian mobil + tombol Sewa (dibuat otomatis jika belum ada)
   - form_sewa_019.html : validasi per kolom, pratinjau nama, ringkasan biaya
   Pesan error, pesan sukses, dan CSS pendukung dibuat otomatis oleh script.
   Catatan: semua teks ditampilkan dengan textContent, bukan innerHTML. */

console.log('JavaScript Rental Mobil Legenda 019 aktif');

/* ========== 0. Aturan validasi dan data (ubah di sini bila perlu) ========== */
const NAMA_MIN = 3;
const LAMA_MIN = 1;
const LAMA_MAX = 30;

const DATA_MOBIL = [
  { nama: 'Kijang Kapsul 019', harga: 500019 },
  { nama: 'Suzuki Carry 019', harga: 350019 },
  { nama: 'Suzuki Katana 019', harga: 450019 },
  { nama: 'Toyota Corolla DX 019', harga: 400019 },
  { nama: 'Daihatsu Taft 019', harga: 550019 },
  { nama: 'VW Kodok 019', harga: 600019 }
];

/* ========== 1. Fungsi bantu DOM ========== */
function buatElemen(tag, atribut, teks) {
  const el = document.createElement(tag);
  if (atribut) {
    Object.keys(atribut).forEach(function (key) {
      el.setAttribute(key, atribut[key]);
    });
  }
  if (teks !== undefined) el.textContent = teks;
  return el;
}

function rupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

function cariHarga(namaMobil) {
  const data = DATA_MOBIL.find(function (m) { return m.nama === namaMobil; });
  return data ? data.harga : 0;
}

function pasangCss() {
  if (document.getElementById('rental-style')) return;
  const style = buatElemen('style', { id: 'rental-style' });
  style.textContent =
    '.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;}' +
    '.kartu-mobil[hidden]{display:none;}' +
    '.bar-cari{display:flex;gap:8px;max-width:600px;margin:16px auto 0;}' +
    '.bar-cari input{flex:1;padding:12px 14px;border:1px solid #b9b3a3;border-radius:8px;font-size:1rem;}' +
    '.info-hasil{text-align:center;color:#5b5b5b;margin-top:10px;min-height:1.6em;}' +
    '.kosong{text-align:center;background:#fff;padding:24px;border-radius:12px;margin-top:20px;color:#5b5b5b;font-style:italic;}' +
    '.error-teks{display:block;min-height:1.2rem;margin-top:.25rem;color:#b3261e;font-size:.875rem;}' +
    '.input-error{border-color:#b3261e !important;background-color:#fdf3f2;}' +
    '.input-ok{border-color:#1e6b34 !important;}' +
    '.preview-nama{color:#5b6676;font-size:.9rem;}' +
    '.ringkasan{background:#f4f1ea;border-left:4px solid #c8922b;border-radius:8px;padding:14px 16px;}' +
    '.ringkasan h3{color:#1f3a5f;margin-bottom:8px;}' +
    '.ringkasan dl > div{display:flex;justify-content:space-between;padding:4px 0;}' +
    '.ringkasan .total{border-top:1px dashed #b9b3a3;margin-top:6px;padding-top:8px;font-weight:700;color:#1f3a5f;}' +
    '.pesan{border-radius:8px;font-weight:600;}' +
    '.pesan.error{background:#fdecea;color:#b3261e;border:1px solid #b3261e;padding:10px;}' +
    '.pesan.sukses{background:#e6f4ea;color:#1e6b34;border:1px solid #1e6b34;padding:10px;}';
  document.head.appendChild(style);
}

function pastikanElemenError(input, id) {
  let el = document.getElementById(id);
  if (!el) {
    el = buatElemen('small', { id: id, class: 'error-teks', 'aria-live': 'polite' });
    input.insertAdjacentElement('afterend', el);
  }
  return el;
}

function setError(input, errorEl, pesan) {
  errorEl.textContent = pesan;
  input.classList.add('input-error');
  input.classList.remove('input-ok');
  input.setAttribute('aria-invalid', 'true');
}

function clearError(input, errorEl) {
  errorEl.textContent = '';
  input.classList.remove('input-error');
  input.removeAttribute('aria-invalid');
}

/* ========== 2. Halaman katalog_019.html ========== */
function initKatalog() {
  const daftar = document.querySelector('.daftar-mobil');
  if (!daftar) return;   // bukan halaman katalog

  const semuaKartu = daftar.querySelectorAll('.kartu-mobil');

  // Tombol "Sewa" di tiap kartu (dibuat otomatis jika belum ada)
  semuaKartu.forEach(function (kartu) {
    if (kartu.querySelector('a.tombol')) return;
    const namaMobil = kartu.querySelector('h3').textContent.trim();
    kartu.appendChild(buatElemen('a', {
      href: 'form_sewa_019.html?mobil=' + encodeURIComponent(namaMobil),
      class: 'tombol'
    }, 'Sewa'));
  });

  // Kolom pencarian (dibuat otomatis jika belum ada)
  let cari = document.getElementById('cari');
  let btnHapus = document.getElementById('hapus-cari');
  let info = document.getElementById('info-hasil');
  let kosong = document.getElementById('kosong');

  if (!cari) {
    const bar = buatElemen('div', { class: 'bar-cari' });
    bar.appendChild(buatElemen('label', { for: 'cari', class: 'sr-only' }, 'Cari mobil'));
    cari = buatElemen('input', {
      type: 'search', id: 'cari', autocomplete: 'off',
      placeholder: 'Cari mobil... (contoh: Kijang, Carry, Katana)'
    });
    btnHapus = buatElemen('button', { type: 'button', id: 'hapus-cari', hidden: '' }, 'Hapus');
    bar.appendChild(cari);
    bar.appendChild(btnHapus);
    daftar.insertAdjacentElement('beforebegin', bar);
  }
  if (!info) {
    info = buatElemen('p', { id: 'info-hasil', class: 'info-hasil', 'aria-live': 'polite' });
    daftar.insertAdjacentElement('beforebegin', info);
  }
  if (!kosong) {
    kosong = buatElemen('p', { id: 'kosong', class: 'kosong', hidden: '' }, 'Mobil tidak ditemukan. Coba kata kunci lain.');
    daftar.insertAdjacentElement('afterend', kosong);
  }

  function cariMobil() {
    const keyword = cari.value.trim().toLowerCase();
    let tampil = 0;

    semuaKartu.forEach(function (kartu) {
      const cocok = kartu.textContent.toLowerCase().includes(keyword);
      kartu.hidden = !cocok;
      if (cocok) tampil++;
    });

    if (btnHapus) btnHapus.hidden = keyword === '';
    kosong.hidden = tampil > 0;
    info.textContent = keyword === ''
      ? ''
      : 'Menampilkan ' + tampil + ' dari ' + semuaKartu.length + ' mobil';
  }

  cari.addEventListener('input', cariMobil);
  cari.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      cari.value = '';
      cariMobil();
    }
  });
  if (btnHapus) {
    btnHapus.addEventListener('click', function () {
      cari.value = '';
      cariMobil();
      cari.focus();
    });
  }
}

/* ========== 3. Halaman form_sewa_019.html ========== */
function initForm() {
  const form = document.getElementById('form-sewa');
  const nama = document.getElementById('nama');
  const mobil = document.getElementById('mobil');
  const lama = document.getElementById('lama');

  // Hanya jalan di halaman yang benar-benar punya semua field ini
  if (!form || !nama || !mobil || !lama) return;

  form.noValidate = true;   // matikan balon validasi bawaan browser agar pesan kustom tampil

  // Isi pilihan mobil dari data jika select masih kosong
  if (mobil.options.length < 2) {
    mobil.innerHTML = '';
    mobil.appendChild(buatElemen('option', { value: '' }, '-- Pilih Mobil --'));
    DATA_MOBIL.forEach(function (m) {
      mobil.appendChild(buatElemen('option', { value: m.nama }, m.nama + ' - ' + rupiah(m.harga) + '/hari'));
    });
  }

  const errorNama = pastikanElemenError(nama, 'err-nama');
  const errorMobil = pastikanElemenError(mobil, 'err-mobil');
  const errorLama = pastikanElemenError(lama, 'err-lama');

  // Pratinjau nama (membuktikan input tampil sebagai teks, bukan HTML)
  let previewNama = document.getElementById('previewNama');
  if (!previewNama) {
    const p = buatElemen('p', { class: 'preview-nama' }, 'Pratinjau nama: ');
    previewNama = buatElemen('strong', { id: 'previewNama' });
    p.appendChild(previewNama);
    errorNama.insertAdjacentElement('afterend', p);
  }

  // Kolom pesan umum (dibuat otomatis jika belum ada)
  const tombolKirim = form.querySelector('[type="submit"]');
  const jangkar = tombolKirim.parentElement === form ? tombolKirim : tombolKirim.parentElement;

  let pesan = document.getElementById('pesan');
  if (!pesan) {
    pesan = buatElemen('div', { id: 'pesan', class: 'pesan', role: 'status', 'aria-live': 'polite' });
    jangkar.insertAdjacentElement('beforebegin', pesan);
  }

  // Ringkasan biaya (dibuat otomatis jika belum ada)
  if (!document.getElementById('rg-total')) {
    const box = buatElemen('div', { class: 'ringkasan' });
    box.appendChild(buatElemen('h3', null, 'Ringkasan Biaya'));
    const dl = buatElemen('dl');
    [['Harga per hari', 'rg-harga'], ['Lama sewa', 'rg-lama'], ['Total', 'rg-total']].forEach(function (b) {
      const baris = buatElemen('div', b[1] === 'rg-total' ? { class: 'total' } : null);
      baris.appendChild(buatElemen('dt', null, b[0]));
      baris.appendChild(buatElemen('dd', { id: b[1] }, '-'));
      dl.appendChild(baris);
    });
    box.appendChild(dl);
    pesan.insertAdjacentElement('beforebegin', box);
  }
  const elHarga = document.getElementById('rg-harga');
  const elLama = document.getElementById('rg-lama');
  const elTotal = document.getElementById('rg-total');

  /* --- Fungsi validasi: true = valid --- */
  function validateNama() {
    const isi = nama.value.trim();
    if (isi === '') {
      setError(nama, errorNama, 'Nama lengkap wajib diisi.');
      return false;
    }
    if (isi.length < NAMA_MIN) {
      setError(nama, errorNama, 'Nama minimal ' + NAMA_MIN + ' karakter.');
      return false;
    }
    clearError(nama, errorNama);
    nama.classList.add('input-ok');
    return true;
  }

  function validateMobil() {
    if (mobil.value === '') {
      setError(mobil, errorMobil, 'Silakan pilih mobil terlebih dahulu.');
      return false;
    }
    clearError(mobil, errorMobil);
    mobil.classList.add('input-ok');
    return true;
  }

  function validateLama() {
    const nilai = lama.value.trim();
    const hari = Number(nilai);
    if (nilai === '') {
      setError(lama, errorLama, 'Lama sewa wajib diisi.');
      return false;
    }
    if (!Number.isInteger(hari)) {
      setError(lama, errorLama, 'Lama sewa harus berupa bilangan bulat.');
      return false;
    }
    if (hari < LAMA_MIN) {
      setError(lama, errorLama, 'Lama sewa minimal ' + LAMA_MIN + ' hari.');
      return false;
    }
    if (hari > LAMA_MAX) {
      setError(lama, errorLama, 'Lama sewa maksimal ' + LAMA_MAX + ' hari.');
      return false;
    }
    clearError(lama, errorLama);
    lama.classList.add('input-ok');
    return true;
  }

  /* --- Ringkasan biaya otomatis --- */
  function perbaruiRingkasan() {
    const harga = cariHarga(mobil.value);
    const hari = Number(lama.value);
    const hariValid = Number.isInteger(hari) && hari >= LAMA_MIN;

    elHarga.textContent = harga ? rupiah(harga) + '/hari' : '-';
    elLama.textContent = hariValid ? hari + ' hari' : '-';
    elTotal.textContent = harga && hariValid ? rupiah(harga * hari) : '-';
  }

  /* --- Pesan umum di DOM (bukan alert) --- */
  function tampilkanPesan(jenis, teks) {
    pesan.className = 'pesan ' + jenis;
    pesan.textContent = teks;
  }

  function hapusPesan() {
    pesan.className = 'pesan';
    pesan.textContent = '';
  }

  function resetFeedback() {
    [[nama, errorNama], [mobil, errorMobil], [lama, errorLama]].forEach(function (p) {
      clearError(p[0], p[1]);
      p[0].classList.remove('input-ok');
    });
    previewNama.textContent = '';
    hapusPesan();
    setTimeout(perbaruiRingkasan, 0);
  }

  /* --- Event: validasi saat selesai mengisi --- */
  nama.addEventListener('blur', validateNama);
  mobil.addEventListener('change', function () { validateMobil(); perbaruiRingkasan(); hapusPesan(); });
  lama.addEventListener('blur', validateLama);

  /* --- Event: pesan error hilang begitu input diperbaiki --- */
  nama.addEventListener('input', function () {
    if (errorNama.textContent) validateNama();
    previewNama.textContent = nama.value;
    hapusPesan();
  });
  lama.addEventListener('input', function () {
    if (errorLama.textContent) validateLama();
    perbaruiRingkasan();
    hapusPesan();
  });

  form.addEventListener('reset', resetFeedback);

  /* --- Pilih mobil otomatis dari tombol "Sewa" di katalog --- */
  const mobilDariKatalog = new URLSearchParams(window.location.search).get('mobil');
  if (mobilDariKatalog) mobil.value = mobilDariKatalog;
  perbaruiRingkasan();

  /* --- Event: submit --- */
  form.addEventListener('submit', function (event) {
    event.preventDefault();   // mencegah form terkirim / halaman reload
    hapusPesan();

    // Jalankan semua validasi (tidak berhenti di error pertama)
    const namaValid = validateNama();
    const mobilValid = validateMobil();
    const lamaValid = validateLama();

    if (!namaValid || !mobilValid || !lamaValid) {
      tampilkanPesan('error', 'Error: Pesanan gagal dikirim, periksa isian yang bertanda merah.');
      // Arahkan fokus ke kolom pertama yang salah
      if (!namaValid) nama.focus();
      else if (!mobilValid) mobil.focus();
      else lama.focus();
      return;
    }

    const hari = Number(lama.value);
    const total = cariHarga(mobil.value) * hari;

    tombolKirim.disabled = true;
    tombolKirim.textContent = 'Memproses...';

    setTimeout(function () {
      const kode = 'RM019-' + Date.now().toString().slice(-6);
      tampilkanPesan(
        'sukses',
        'Berhasil! Pesanan ' + kode + ' atas nama ' + nama.value.trim() + ': ' +
        mobil.value + ' selama ' + hari + ' hari, total ' + rupiah(total) + '.'
      );
      tombolKirim.disabled = false;
      tombolKirim.textContent = 'Kirim Pesanan';
    }, 900);
  });
}

/* ========== 4. Jalankan setelah HTML siap ========== */
function mulai() {
  pasangCss();
  initKatalog();
  initForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mulai);
} else {
  mulai();
}