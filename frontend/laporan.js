document.getElementById('formLaporan').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const statusEl = document.getElementById('status');

  console.log('📤 Mengirim data:', [...formData.entries()]);

  try {
    const response = await fetch('../backend/api/laporan.php', {
      method: 'POST',
      body: formData
    });

    console.log('📥 Status response:', response.status);
    console.log('📥 Headers:', response.headers);

    const contentType = response.headers.get('content-type');

    let rawResponse = await response.text(); // baca semua dulu sebagai teks
    console.log('📄 Isi response:', rawResponse);

    if (!response.ok) {
      console.error('❌ Server mengembalikan status error:', response.status);
      throw new Error('Server error: ' + response.status);
    }

    if (!contentType || !contentType.includes('application/json')) {
      console.warn('⚠️ Expected JSON but got:', contentType);
      throw new Error('Invalid response format. Expecting JSON.');
    }

    let result;
    try {
      result = JSON.parse(rawResponse);
    } catch (jsonErr) {
      console.error('❌ Gagal parse JSON:', jsonErr);
      console.log('🔍 Isi mentah:', rawResponse);
      throw new Error('Response is not valid JSON');
    }

    console.log('✅ JSON Parsed:', result);

    if (result.success) {
      statusEl.textContent = 'Laporan berhasil dikirim!';
      statusEl.style.color = 'green';
      this.reset();
    } else {
      statusEl.textContent = 'Gagal mengirim laporan. Coba lagi.';
      statusEl.style.color = 'red';
      console.error('❗ Response JSON error:', result);
    }

  } catch (error) {
    statusEl.textContent = 'Terjadi kesalahan koneksi.';
    statusEl.style.color = 'red';
    console.error('❌ Kesalahan:', error);
  }
});
