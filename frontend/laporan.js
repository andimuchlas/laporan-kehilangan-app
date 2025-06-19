document.getElementById('formLaporan').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const statusEl = document.getElementById('status');

  // Pastikan URL ini sudah benar menunjuk ke backend Anda
  const apiUrl = 'http://54.169.187.82:8080/backend/api/laporan.php';

  console.log('📤 Mengirim data ke:', apiUrl);
  console.log('📝 Isi FormData:', [...formData.entries()]);

  statusEl.textContent = 'Mengirim laporan...';
  statusEl.style.color = 'orange';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData
    });

    console.log('📥 Status response:', response.status);
    console.log('📥 Headers:', response.headers);

    const contentType = response.headers.get('content-type');
    let rawResponse = await response.text();
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
      const errorMessage = result.message || 'Terjadi kesalahan di server.';
      statusEl.textContent = `Gagal mengirim laporan: ${errorMessage}`;
      statusEl.style.color = 'red';
      console.error('❗ Response JSON error:', result);
    }

  } catch (error) {
    statusEl.textContent = 'Terjadi kesalahan koneksi. Cek console browser (F12).';
    statusEl.style.color = 'red';
    console.error('❌ Kesalahan pada Fetch:', error);
  }
}); // <-- Mungkin error ada di sekitar sini, pastikan kurung dan titik koma sudah benar.
