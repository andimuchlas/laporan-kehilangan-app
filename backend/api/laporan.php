<?php
require '../../vendor/autoload.php';
use Aws\S3\S3Client;

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

$conn = new PDO("pgsql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']}", $_ENV['DB_USER'], $_ENV['DB_PASS']);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Upload file ke S3
function uploadToS3($file, $folder) {
  $s3 = new S3Client([
    'region' => $_ENV['AWS_REGION'],
    'version' => 'latest',
    'credentials' => [
      'key' => $_ENV['AWS_ACCESS_KEY_ID'],
      'secret' => $_ENV['AWS_SECRET_ACCESS_KEY'],
    ],
  ]);

  $key = $folder . '/' . time() . '_' . basename($file['name']);
  $s3->putObject([
    'Bucket' => $_ENV['AWS_BUCKET'],
    'Key' => $key,
    'SourceFile' => $file['tmp_name'],
  ]);

  return $s3->getObjectUrl($_ENV['AWS_BUCKET'], $key);
}

try {
  $foto_url = null;
  if (isset($_FILES['foto_barang']) && $_FILES['foto_barang']['error'] === UPLOAD_ERR_OK) {
    $foto_url = uploadToS3($_FILES['foto_barang'], 'foto');
  }

  $bukti_urls = [];
  if (isset($_FILES['bukti_tambahan']) && is_array($_FILES['bukti_tambahan']['tmp_name'])) {
    foreach ($_FILES['bukti_tambahan']['tmp_name'] as $i => $tmp) {
      if ($tmp) {
        $file = [
          'name' => $_FILES['bukti_tambahan']['name'][$i],
          'tmp_name' => $tmp
        ];
        $bukti_urls[] = uploadToS3($file, 'bukti');
      }
    }
  }

  $stmt = $conn->prepare("INSERT INTO laporan_kehilangan (
    nama_barang, merek_model, warna, kode_unik, ciri_khusus, nilai_estimasi, 
    foto_url, waktu_terakhir, tempat_terakhir, lokasi_dugaan, kronologi,
    nama_pelapor, identitas, no_hp, email, alamat, bukti_url
  ) VALUES (
    :nama_barang, :merek_model, :warna, :kode_unik, :ciri_khusus, :nilai_estimasi, 
    :foto_url, :waktu_terakhir, :tempat_terakhir, :lokasi_dugaan, :kronologi,
    :nama_pelapor, :identitas, :no_hp, :email, :alamat, :bukti_url
  )");

  $stmt->execute([
    ':nama_barang' => $_POST['nama_barang'],
    ':merek_model' => $_POST['merek_model'],
    ':warna' => $_POST['warna'],
    ':kode_unik' => $_POST['kode_unik'],
    ':ciri_khusus' => $_POST['ciri_khusus'],
    ':nilai_estimasi' => $_POST['nilai_estimasi'],
    ':foto_url' => $foto_url,
    ':waktu_terakhir' => $_POST['waktu_terakhir'],
    ':tempat_terakhir' => $_POST['tempat_terakhir'],
    ':lokasi_dugaan' => $_POST['lokasi_dugaan'],
    ':kronologi' => $_POST['kronologi'],
    ':nama_pelapor' => $_POST['nama'],
    ':identitas' => $_POST['identitas'],
    ':no_hp' => $_POST['no_hp'],
    ':email' => $_POST['email'],
    ':alamat' => $_POST['alamat'],
    ':bukti_url' => json_encode($bukti_urls),
  ]);

  echo json_encode(['success' => true]);
} catch (Exception $e) {
  echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
