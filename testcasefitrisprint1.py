"""
========================================================================================
Test Suite Automasi E2E Selenium - PBI KEL2-69 (Fitri Novianti - 102042400068)
Proyek: MobilitiQ (Platform Analisis & Transisi Kendaraan Listrik) - Sprint 1
Framework: PyTest + Selenium WebDriver

Fokus Pengujian (Sesuai PBI KEL2-69 Tanpa Test Case Login):
1. KEL2-90  : Membuat Form Pengelolaan Harga BBM dan Tarif Listrik
2. KEL2-115 : Mengimplementasikan Penyimpanan dan Pembaruan Parameter Tarif
3. KEL2-116 : Menguji Periode Berlaku dan Penggunaan Tarif Aktif pada Simulasi
========================================================================================
"""

import time
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

# ========================================================================================
# KONFIGURASI URL HALAMAN
# ========================================================================================
BASE_URL = "http://localhost:3000"
ADMIN_TARIFF_URL = f"{BASE_URL}/admin/tarif-energi"
SIMULATOR_EV_URL = f"{BASE_URL}/kalkulator/energi-ev"


# ========================================================================================
# 1. FIXTURE: SETUP & TEARDOWN BROWSER (LANGSUNG MEMBUKA HALAMAN TARIF ENERGI)
# ========================================================================================
@pytest.fixture(scope="function")
def driver():
    """
    Setup Browser:
    - Menyiapkan browser Chrome.
    - Menyiapkan otorisasi Superadmin otomatis di latar belakang agar browser
      langsung mendarat di halaman /admin/tarif-energi tanpa perlu kode login di test case.
    """
    chrome_options = Options()
    # Hapus komentar di bawah jika ingin menjalankan tanpa menampilkan jendela browser:
    # chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1440,900")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    d = webdriver.Chrome(options=chrome_options)
    d.implicitly_wait(5)
    wait = WebDriverWait(d, 10)

    # Autentikasi otomatis 1x di background (menggunakan tombol quick demo)
    d.get(f"{BASE_URL}/login")
    try:
        demo_btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="demo-superadmin-btn"]'))
        )
        d.execute_script("arguments[0].click();", demo_btn)
        pass_el = d.find_element(By.CSS_SELECTOR, '[data-testid="login-password"]')
        pass_el.clear()
        pass_el.send_keys("Superadmin123!")
        submit_btn = d.find_element(By.CSS_SELECTOR, '[data-testid="login-submit"]')
        d.execute_script("arguments[0].click();", submit_btn)
        wait.until(lambda drv: "/admin/tarif-energi" in drv.current_url)
    except Exception:
        # Jika sudah login atau langsung mengarah ke halaman tujuan
        d.get(ADMIN_TARIFF_URL)

    # Memastikan browser langsung berada di halaman target
    if ADMIN_TARIFF_URL not in d.current_url:
        d.get(ADMIN_TARIFF_URL)

    yield d
    d.quit()


# Helper pengisian input React
def fill_input(driver, element, value: str):
    """Mengisi input text/number agar langsung terikat ke state React."""
    driver.execute_script("""
        var el = arguments[0];
        var val = arguments[1];
        var lastVal = el.value;
        el.value = val;
        var tracker = el._valueTracker;
        if (tracker) {
            tracker.setValue(lastVal);
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    """, element, value)


# ========================================================================================
# 2. TASK KEL2-90: Membuat Form Pengelolaan Harga BBM dan Tarif Listrik
# ========================================================================================
def test_tc01_kelengkapan_form_pengelolaan_tarif(driver):
    """
    TC-01: Memastikan form pengelolaan harga BBM dan tarif listrik tampil lengkap.
    Kriteria:
    - Input Kode, Kategori, Nama, Harga, Satuan, Tanggal Mulai/Sampai, Alasan, dan Tombol Simpan dapat diakses.
    """
    wait = WebDriverWait(driver, 10)

    # Langsung verifikasi seluruh input form pada halaman tarif energi
    code_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-code"]')))
    category_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-category"]')))
    name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-name"]')))
    price_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-price"]')))
    unit_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-unit"]')))
    from_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-from"]')))
    to_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-to"]')))
    reason_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-reason"]')))
    submit_btn = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-submit"]')))

    assert code_input.is_displayed(), "Input Kode Parameter tidak tampil"
    assert category_select.is_displayed(), "Dropdown Kategori Energi tidak tampil"
    assert name_input.is_displayed(), "Input Nama Tarif tidak tampil"
    assert price_input.is_displayed(), "Input Harga per Satuan tidak tampil"
    assert unit_select.is_displayed(), "Dropdown Satuan tidak tampil"
    assert from_input.is_displayed(), "Input Tanggal Mulai Berlaku tidak tampil"
    assert to_input.is_displayed(), "Input Tanggal Akhir Berlaku tidak tampil"
    assert reason_input.is_displayed(), "Input Alasan Perubahan tidak tampil"
    assert submit_btn.is_displayed(), "Tombol Simpan Tarif tidak tampil"


def test_tc02_validasi_input_nilai_numerik(driver):
    """
    TC-02: Memastikan sistem memvalidasi nilai numerik pada input harga tarif.
    Kriteria:
    - Nilai harga yang tidak valid (negatif atau <= 0) ditolak oleh sistem dengan memunculkan pesan kesalahan.
    """
    wait = WebDriverWait(driver, 10)

    code_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-code"]')))
    name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-name"]')))
    price_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-price"]')))
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="tariff-form-submit"]')))

    # Masukkan nilai harga negatif (-500)
    fill_input(driver, code_input, "TEST_HARGA_INVALID")
    fill_input(driver, name_input, "Tarif Uji Nilai Negatif")
    fill_input(driver, price_input, "-500")

    driver.execute_script("arguments[0].click();", submit_btn)

    # Pastikan muncul kotak pesan error validasi
    error_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-error"]'))
    )
    assert len(error_box.text) > 0, "Pesan error validasi tidak muncul di halaman"
    assert "positif" in error_box.text.lower() or "tidak valid" in error_box.text.lower(), (
        f"Teks error tidak sesuai: {error_box.text}"
    )


# ========================================================================================
# 3. TASK KEL2-115: Mengimplementasikan Penyimpanan dan Pembaruan Parameter Tarif
# ========================================================================================
def test_tc03_penyimpanan_parameter_tarif_baru(driver):
    """
    TC-03: Menambah dan menyimpan parameter harga energi baru ke dalam sistem.
    Kriteria:
    - Data tersimpan dan muncul notifikasi sukses serta data masuk ke daftar tabel tarif.
    """
    wait = WebDriverWait(driver, 10)

    code_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-code"]')))
    category_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-category"]')))
    name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-name"]')))
    price_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-price"]')))
    reason_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-reason"]')))
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="tariff-form-submit"]')))

    # Data uji penambahan BBM baru
    test_code = "BBM_TEST_FITRI"
    test_name = "BBM Ron 98 Uji Fitri"
    test_price = "15500"

    fill_input(driver, code_input, test_code)
    Select(category_select).select_by_value("BBM")
    fill_input(driver, name_input, test_name)
    fill_input(driver, price_input, test_price)
    fill_input(driver, reason_input, "Penambahan parameter BBM baru oleh Fitri")

    driver.execute_script("arguments[0].click();", submit_btn)

    # Verifikasi notifikasi berhasil disimpan
    success_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-success"]'))
    )
    assert "berhasil" in success_box.text.lower(), f"Pesan sukses tidak muncul: {success_box.text}"

    # Verifikasi data muncul di tabel daftar tarif
    table_body = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "tbody")))
    assert test_name in table_body.text, "Data tarif baru tidak ditemukan pada tabel"


def test_tc04_pembaruan_parameter_dan_riwayat_audit(driver):
    """
    TC-04: Memperbarui parameter tarif yang sudah ada dan memverifikasi pencatatan log audit.
    Kriteria:
    - Nilai tarif terupdate dan perubahan tercatat secara transparan di tabel Riwayat Audit.
    """
    wait = WebDriverWait(driver, 10)

    # Klik tombol Ubah pada baris pertama tabel
    edit_buttons = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, '[data-testid^="edit-tariff-"]'))
    )
    assert len(edit_buttons) > 0, "Tidak ada data tarif untuk diubah"
    driver.execute_script("arguments[0].click();", edit_buttons[0])

    # Perbarui harga dan isi alasan perubahan
    price_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-price"]')))
    reason_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-reason"]')))
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="tariff-form-submit"]')))

    audit_reason = "Penyesuaian resmi tarif berkala oleh Fitri"
    fill_input(driver, price_input, "1450")
    fill_input(driver, reason_input, audit_reason)

    driver.execute_script("arguments[0].click();", submit_btn)

    # Verifikasi notifikasi pembaruan berhasil
    success_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-success"]'))
    )
    assert "berhasil" in success_box.text.lower()

    # Verifikasi tabel riwayat audit mencatat alasan perubahan
    audit_table = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-history-table"]'))
    )
    assert audit_reason in audit_table.text or "UPDATE" in audit_table.text, (
        "Perubahan tidak tercatat pada tabel riwayat audit"
    )


# ========================================================================================
# 4. TASK KEL2-116: Menguji Periode Berlaku dan Penggunaan Tarif Aktif pada Simulasi
# ========================================================================================
def test_tc05_toggle_status_aktif_nonaktif(driver):
    """
    TC-05: Menguji fungsi pengaktifan dan penonaktifan status parameter tarif.
    Kriteria:
    - Status tarif berhasil diubah (Aktif / Nonaktif) saat tombol toggle diklik.
    """
    wait = WebDriverWait(driver, 10)

    toggle_buttons = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, '[data-testid^="toggle-tariff-"]'))
    )
    assert len(toggle_buttons) > 0, "Tombol toggle status tidak ditemukan"

    # Klik tombol toggle status pada baris pertama
    driver.execute_script("arguments[0].click();", toggle_buttons[0])

    # Verifikasi pesan konfirmasi perubahan status muncul
    success_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-success"]'))
    )
    assert "status tarif energi berhasil" in success_box.text.lower() or "berhasil" in success_box.text.lower()


def test_tc06_penggunaan_tarif_aktif_pada_simulasi_ev(driver):
    """
    TC-06: Memverifikasi sistem menggunakan parameter tarif aktif pada modul simulasi energi EV.
    Kriteria:
    - Halaman simulator /kalkulator/energi-ev memuat acuan tarif listrik aktif.
    - Simulasi perhitungan estimasi biaya energi dapat dijalankan.
    """
    # Buka langsung halaman simulator pengguna
    driver.get(SIMULATOR_EV_URL)
    wait = WebDriverWait(driver, 10)

    # Pastikan halaman simulator terbuka
    wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))

    # Pastikan form kalkulasi memuat acuan tarif energi aktif
    page_source = driver.page_source.lower()
    assert "tarif" in page_source or "listrik" in page_source or "kwh" in page_source

    # Klik tombol jalankan simulasi
    calc_button = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit'], [data-testid='btn-simulate']"))
    )
    driver.execute_script("arguments[0].click();", calc_button)

    # Verifikasi hasil estimasi biaya simulasi (Rp) berhasil dihitung
    time.sleep(1.0)
    assert "rp" in driver.page_source.lower(), "Hasil perhitungan biaya simulasi energi tidak muncul"


# ========================================================================================
# ENTRY POINT JIKA DIJALANKAN DENGAN `python testcasefitrisprint1.py`
# ========================================================================================
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
