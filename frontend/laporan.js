document.getElementById('formLaporan').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const statusEl = document.getElementById('status');

  // Definisikan URL API lengkap dengan protokol HTTPS
  const apiUrl = 'https://laporan-kehilangan-app-production.up.railway.app/api/laporan.php';

  console.log('📤 Mengirim data ke:', apiUrl);
  console.log('📝 Isi FormData:', [...formData.entries()]);

  statusEl.textContent = 'Mengirim laporan...';
  statusEl.style.color = 'orange';

  try {
    const response = await fetch(apiUrl, { // Menggunakan variabel apiUrl yang sudah benar
      method: 'POST',
      body: formData
    });

    console.log('📥 Status response:', response.status);
    console.log('📥 Headers:', response.headers);

    const contentType = response.headers.get('content-type');
    let rawResponse = await response.text(); // Baca semua dulu sebagai teks
    console.log('📄 Isi response mentah:', rawResponse);

    if (!response.ok) {
      console.error('❌ Server mengembalikan status error:', response.status);
      statusEl.textContent = `Error dari server: ${response.status}. Cek console untuk detail.`;
      statusEl.style.color = 'red';
      throw new Error('Server error: ' + response.status);
    }

    if (!contentType || !contentType.includes('application/json')) {
      console.warn('⚠️ Format response bukan JSON, melainkan:', contentType);
      statusEl.textContent = 'Gagal memproses response dari server. Format tidak sesuai.';
      statusEl.style.color = 'red';
      throw new Error('Invalid response format. Expecting JSON.');
    }

    let result;
    try {
      result = JSON.parse(rawResponse);
    } catch (jsonErr) {
      console.error('❌ Gagal parse JSON:', jsonErr);
      statusEl.textContent = 'Gagal membaca response dari server.';
      statusEl.style.color = 'red';
      throw new Error('Response is not valid JSON');
    }

    console.log('✅ JSON Parsed:', result);

    if (result.success) {
      statusEl.textContent = 'Laporan berhasil dikirim! Terima kasih.';
      statusEl.style.color = 'green';
      this.reset();
    } else {
      // Menampilkan pesan error dari backend jika ada
      const errorMessage = result.message || 'Terjadi kesalahan di server.';
      statusEl.textContent = `Gagal mengirim laporan: ${errorMessage}`;
      statusEl.style.color = 'red';
      console.error('❗ Response JSON error:', result);
    }

  } catch (error) {
    statusEl.textContent = 'Terjadi kesalahan koneksi. Periksa internet Anda.';
    statusEl.style.color = 'red';
    console.error('❌ Kesalahan pada Fetch:', error);
  }
});
