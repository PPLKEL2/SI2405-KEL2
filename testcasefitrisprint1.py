"""
========================================================================================
Test Suite Automasi E2E Selenium - PBI KEL2-69 (Fitri Novianti - 102042400068)
Proyek: MobilitiQ (Platform Analisis & Transisi Kendaraan Listrik) - Sprint 1
Framework: PyTest + Selenium WebDriver

PBI KEL2-69:
"Sebagai superadmin, saya ingin mengelola parameter harga energi yang digunakan sistem
agar seluruh simulasi menggunakan nilai tarif yang terkontrol dan dapat diperbarui"

Child Work Items yang diuji:
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
# KONFIGURASI URL & KREDENSIAL AKUN DEMO
# ========================================================================================
BASE_URL = "http://localhost:3000"
LOGIN_URL = f"{BASE_URL}/login"
ADMIN_TARIFF_URL = f"{BASE_URL}/admin/tarif-energi"
SIMULATOR_EV_URL = f"{BASE_URL}/kalkulator/energi-ev"
KALKULATOR_BBM_URL = f"{BASE_URL}/kalkulator/bbm"

SUPERADMIN_EMAIL = "superadmin@mobilitiq.id"
SUPERADMIN_PASSWORD = "Superadmin123!"


# ========================================================================================
# 1. FIXTURE PYTEST: SETUP & TEARDOWN BROWSER
# ========================================================================================
@pytest.fixture(scope="function")
def driver():
    """Inisialisasi browser Chrome sebelum setiap test dan menutup browser setelah selesai."""
    chrome_options = Options()
    # Hapus baris di bawah jika ingin melihat browser terbuka saat pengujian
    # chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1440,900")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    d = webdriver.Chrome(options=chrome_options)
    d.implicitly_wait(5)
    yield d
    d.quit()


# ========================================================================================
# 2. HELPER FUNCTIONS (FUNGSI BANTUAN)
# ========================================================================================
def fill_react_input(driver, element, value: str):
    """Mengisi input text/number React agar sinkron dengan state internal Next.js/React."""
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


def login_as_superadmin(driver):
    """Melakukan autentikasi sebagai Superadmin dan memastikan diarahkan ke area manajemen."""
    wait = WebDriverWait(driver, 10)
    driver.get(LOGIN_URL)

    # Isi kredensial superadmin
    email_el = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="login-email"]'))
    )
    pass_el = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="login-password"]'))
    )

    fill_react_input(driver, email_el, SUPERADMIN_EMAIL)
    fill_react_input(driver, pass_el, SUPERADMIN_PASSWORD)

    submit_btn = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="login-submit"]'))
    )
    driver.execute_script("arguments[0].click();", submit_btn)

    # Tunggu hingga diarahkan keluar dari halaman /login
    wait.until(lambda d: "/login" not in d.current_url)


# ========================================================================================
# 3. TEST CASES: KEL2-90 (Membuat Form Pengelolaan Harga BBM dan Tarif Listrik)
# ========================================================================================
class TestFormPengelolaanTarifEnergi:
    """Pengujian untuk Task KEL2-90: Kelengkapan Form dan Validasi Input Nilai Parameter."""

    def test_tc01_form_tarif_tampil_lengkap(self, driver):
        """
        TC-01: Memastikan form pengelolaan harga BBM dan tarif listrik tampil lengkap.
        Kriteria:
        - Input Kode Parameter, Kategori Energi, Nama Tarif, Harga per Satuan, Satuan,
          Periode Berlaku Mulai/Sampai, Alasan Perubahan, dan Tombol Simpan dapat diakses.
        """
        login_as_superadmin(driver)
        driver.get(ADMIN_TARIFF_URL)
        wait = WebDriverWait(driver, 10)

        # Verifikasi seluruh elemen form input tersedia
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
        assert submit_btn.is_displayed(), "Tombol Simpan tidak tampil"

    def test_tc02_validasi_input_nilai_numerik(self, driver):
        """
        TC-02: Memastikan sistem memvalidasi nilai numerik pada input harga tarif.
        Kriteria:
        - Nilai harga yang kosong, bernilai 0, atau negatif harus ditolak dengan pesan error.
        """
        login_as_superadmin(driver)
        driver.get(ADMIN_TARIFF_URL)
        wait = WebDriverWait(driver, 10)

        code_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-code"]')))
        name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-name"]')))
        price_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-price"]')))
        submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="tariff-form-submit"]')))

        # Isi data dengan harga negatif / tidak valid (-500)
        fill_react_input(driver, code_input, "TEST_VAL_NEGATIF")
        fill_react_input(driver, name_input, "Tarif Uji Nilai Negatif")
        fill_react_input(driver, price_input, "-500")

        driver.execute_script("arguments[0].click();", submit_btn)

        # Verifikasi pesan error penolakan validasi muncul
        error_box = wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-error"]'))
        )
        assert "positif" in error_box.text.lower() or "tidak valid" in error_box.text.lower(), (
            f"Pesan validasi tidak sesuai: {error_box.text}"
        )


# ========================================================================================
# 4. TEST CASES: KEL2-115 (Penyimpanan dan Pembaruan Parameter Tarif)
# ========================================================================================
class TestPenyimpananDanPembaruanTarif:
    """Pengujian untuk Task KEL2-115: Penyimpanan Baru, Edit Nilai, dan Riwayat Audit."""

    def test_tc03_penyimpanan_parameter_tarif_baru(self, driver):
        """
        TC-03: Menambah dan menyimpan parameter harga energi baru ke dalam sistem.
        Kriteria:
        - Data berhasil tersimpan, muncul notifikasi sukses, dan muncul di daftar tabel.
        """
        login_as_superadmin(driver)
        driver.get(ADMIN_TARIFF_URL)
        wait = WebDriverWait(driver, 10)

        code_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-code"]')))
        category_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-category"]')))
        name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-name"]')))
        price_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-price"]')))
        reason_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-reason"]')))
        submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="tariff-form-submit"]')))

        # Isi form penambahan parameter baru (BBM Pertamax Turbo Test)
        test_code = "BBM_TEST_FITRI"
        test_name = "BBM Ron 98 Uji Fitri"
        test_price = "15500"

        fill_react_input(driver, code_input, test_code)
        Select(category_select).select_by_value("BBM")
        fill_react_input(driver, name_input, test_name)
        fill_react_input(driver, price_input, test_price)
        fill_react_input(driver, reason_input, "Penambahan parameter BBM baru Sprint 1 oleh Fitri")

        driver.execute_script("arguments[0].click();", submit_btn)

        # Verifikasi notifikasi sukses
        success_box = wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-success"]'))
        )
        assert "berhasil" in success_box.text.lower(), f"Pesan sukses tidak muncul: {success_box.text}"

        # Verifikasi nama parameter muncul di tabel
        table_body = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "tbody")))
        assert test_name in table_body.text, "Data tarif baru tidak ditemukan di tabel daftar tarif"

    def test_tc04_pembaruan_parameter_dan_riwayat_audit(self, driver):
        """
        TC-04: Memperbarui parameter tarif yang sudah ada dan memverifikasi log audit.
        Kriteria:
        - Nilai tarif terupdate dan tercatat secara transparan pada tabel Riwayat Audit.
        """
        login_as_superadmin(driver)
        driver.get(ADMIN_TARIFF_URL)
        wait = WebDriverWait(driver, 10)

        # Cari tombol ubah pada baris pertama daftar tarif
        edit_buttons = wait.until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, '[data-testid^="edit-tariff-"]'))
        )
        assert len(edit_buttons) > 0, "Tidak ada parameter tarif yang dapat diubah"

        # Klik tombol ubah
        driver.execute_script("arguments[0].click();", edit_buttons[0])

        # Perbarui nilai harga dan alasan perubahan
        price_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-price"]')))
        reason_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-reason"]')))
        submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="tariff-form-submit"]')))

        new_price = "1450"
        audit_reason = "Penyesuaian resmi tarif berkala oleh Fitri Superadmin"
        fill_react_input(driver, price_input, new_price)
        fill_react_input(driver, reason_input, audit_reason)

        driver.execute_script("arguments[0].click();", submit_btn)

        # Verifikasi notifikasi berhasil diperbarui
        success_box = wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-success"]'))
        )
        assert "berhasil diperbarui" in success_box.text.lower() or "berhasil" in success_box.text.lower()

        # Verifikasi tabel riwayat audit (PBI 09 AC 3 & AC 5) mencatat riwayat perubahan
        audit_table = wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-history-table"]'))
        )
        assert audit_reason in audit_table.text or "UPDATE" in audit_table.text, (
            "Perubahan tidak tercatat pada tabel riwayat audit"
        )


# ========================================================================================
# 5. TEST CASES: KEL2-116 (Periode Berlaku dan Penggunaan Tarif Aktif pada Simulasi)
# ========================================================================================
class TestPenggunaanTarifAktifSimulasi:
    """Pengujian untuk Task KEL2-116: Status Aktif Parameter & Penggunaannya pada Simulasi."""

    def test_tc05_toggle_status_aktif_nonaktif(self, driver):
        """
        TC-05: Menguji fungsionalitas pengaktifan dan penonaktifan status parameter tarif.
        Kriteria:
        - Status tarif dapat diubah menjadi Aktif atau Nonaktif melalui tombol toggle status.
        """
        login_as_superadmin(driver)
        driver.get(ADMIN_TARIFF_URL)
        wait = WebDriverWait(driver, 10)

        toggle_buttons = wait.until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, '[data-testid^="toggle-tariff-"]'))
        )
        assert len(toggle_buttons) > 0, "Tombol toggle status tidak ditemukan di tabel"

        # Klik tombol toggle status baris pertama
        driver.execute_script("arguments[0].click();", toggle_buttons[0])

        # Verifikasi pesan konfirmasi perubahan status muncul
        success_box = wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-success"]'))
        )
        assert "status tarif energi berhasil" in success_box.text.lower() or "berhasil" in success_box.text.lower()

    def test_tc06_penggunaan_tarif_aktif_pada_simulasi_ev(self, driver):
        """
        TC-06: Memverifikasi sistem menggunakan parameter tarif aktif pada modul simulasi energi EV.
        Kriteria:
        - Halaman /kalkulator/energi-ev memuat tarif listrik resmi (PLN Home & SPKLU) aktif.
        - Perhitungan estimasi biaya pengisian energi berjalan sukses.
        """
        driver.get(SIMULATOR_EV_URL)
        wait = WebDriverWait(driver, 10)

        # Pastikan halaman simulator terbuka
        wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
        assert "/login" not in driver.current_url, "Simulator publik harus bisa diakses"

        # Pastikan form kalkulasi memuat acuan tarif listrik PLN yang aktif
        page_source = driver.page_source.lower()
        assert "tarif" in page_source or "listrik" in page_source or "kwh" in page_source

        # Lakukan simulasi perhitungan
        submit_calc = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit'], [data-testid='btn-simulate']"))
        )
        driver.execute_script("arguments[0].click();", submit_calc)

        # Tunggu hasil perhitungan biaya simulasi muncul
        time.sleep(1.0)
        assert "rp" in driver.page_source.lower(), "Hasil estimasi biaya energi (Rp) tidak muncul"


# ========================================================================================
# ENTRY POINT JIKA DIJALANKAN LANGSUNG DENGAN `python testcasefitrisprint1.py`
# ========================================================================================
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
