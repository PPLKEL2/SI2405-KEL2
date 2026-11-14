"""
========================================================================================
Test Suite Automasi E2E Selenium - Sprint 1 (Fitri Novianti - 102042400068)
Proyek: MobilitiQ (Platform Analisis & Transisi Kendaraan Listrik)
Framework: PyTest + Selenium WebDriver

PBI 1 (KEL2-69): Pengelolaan Parameter Harga Energi (Superadmin)
- KEL2-90  : Membuat Form Pengelolaan Harga BBM dan Tarif Listrik
- KEL2-115 : Mengimplementasikan Penyimpanan dan Pembaruan Parameter Tarif
- KEL2-116 : Menguji Periode Berlaku dan Penggunaan Tarif Aktif pada Simulasi

PBI 2 (KEL2-68): Pengelolaan Parameter Insentif dan Pajak EV (Superadmin)
- Task 1 : Membuat Form Input Parameter Insentif dan Pajak EV
- Task 2 : Mengimplementasikan CRUD Data Kebijakan dan Periode Berlaku
- Task 3 : Menguji Validasi Kebijakan dan Penggunaan Parameter Aktif
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
ADMIN_INCENTIVE_URL = f"{BASE_URL}/admin/insentif-pajak"
SIMULATOR_EV_URL = f"{BASE_URL}/kalkulator/energi-ev"


# ========================================================================================
# 1. FIXTURE: SETUP & TEARDOWN BROWSER (AUTENTIKASI OTOMATIS 1X DI BACKGROUND)
# ========================================================================================
@pytest.fixture(scope="function")
def driver():
    """
    Setup Browser:
    - Inisialisasi browser Chrome.
    - Autentikasi sesi Superadmin otomatis 1x di background (menggunakan quick demo).
    - Memungkinkan test case langsung mengakses halaman admin tanpa perlu kode login.
    """
    chrome_options = Options()
    # Hapus komentar di bawah jika ingin menjalankan dalam mode headless (tanpa GUI browser):
    # chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1440,900")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    d = webdriver.Chrome(options=chrome_options)
    d.implicitly_wait(5)
    wait = WebDriverWait(d, 10)

    # Login otomatis 1x di latar belakang
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
        wait.until(lambda drv: "/admin" in drv.current_url)
    except Exception:
        pass

    yield d
    d.quit()


# Helper untuk mengikat value input ke state internal React
def fill_input(driver, element, value: str):
    """Mengisi elemen input text/number agar langsung terikat ke state React."""
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
# PBI 1: KEL2-69 (PENGELOLAAN PARAMETER HARGA ENERGI)
# ========================================================================================

# --- Task KEL2-90: Membuat Form Pengelolaan Harga BBM dan Tarif Listrik ---
def test_tc01_kelengkapan_form_pengelolaan_tarif(driver):
    """
    TC-01: Memastikan form pengelolaan harga BBM dan tarif listrik tampil lengkap.
    """
    driver.get(ADMIN_TARIFF_URL)
    wait = WebDriverWait(driver, 10)

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
    TC-02: Memastikan sistem memvalidasi nilai numerik pada input harga tarif (menolak nilai negatif).
    """
    driver.get(ADMIN_TARIFF_URL)
    wait = WebDriverWait(driver, 10)

    code_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-code"]')))
    name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-name"]')))
    price_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-price"]')))
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="tariff-form-submit"]')))

    fill_input(driver, code_input, "TEST_HARGA_INVALID")
    fill_input(driver, name_input, "Tarif Uji Nilai Negatif")
    fill_input(driver, price_input, "-500")

    driver.execute_script("arguments[0].click();", submit_btn)

    error_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-error"]'))
    )
    assert len(error_box.text) > 0, "Pesan error validasi tidak muncul"
    assert "positif" in error_box.text.lower() or "tidak valid" in error_box.text.lower()


# --- Task KEL2-115: Mengimplementasikan Penyimpanan dan Pembaruan Parameter Tarif ---
def test_tc03_penyimpanan_parameter_tarif_baru(driver):
    """
    TC-03: Menambah dan menyimpan parameter harga energi baru ke dalam sistem.
    """
    driver.get(ADMIN_TARIFF_URL)
    wait = WebDriverWait(driver, 10)

    code_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-code"]')))
    category_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-category"]')))
    name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-name"]')))
    price_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-price"]')))
    reason_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-reason"]')))
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="tariff-form-submit"]')))

    test_code = "BBM_TEST_FITRI"
    test_name = "BBM Ron 98 Uji Fitri"
    test_price = "15500"

    fill_input(driver, code_input, test_code)
    Select(category_select).select_by_value("BBM")
    fill_input(driver, name_input, test_name)
    fill_input(driver, price_input, test_price)
    fill_input(driver, reason_input, "Penambahan parameter BBM baru oleh Fitri")

    driver.execute_script("arguments[0].click();", submit_btn)

    success_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-success"]'))
    )
    assert "berhasil" in success_box.text.lower()

    table_body = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "tbody")))
    assert test_name in table_body.text, "Data tarif baru tidak ditemukan pada tabel"


def test_tc04_pembaruan_parameter_dan_riwayat_audit(driver):
    """
    TC-04: Memperbarui parameter tarif yang sudah ada dan memverifikasi pencatatan log audit.
    """
    driver.get(ADMIN_TARIFF_URL)
    wait = WebDriverWait(driver, 10)

    edit_buttons = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, '[data-testid^="edit-tariff-"]'))
    )
    assert len(edit_buttons) > 0, "Tidak ada data tarif untuk diubah"
    driver.execute_script("arguments[0].click();", edit_buttons[0])

    price_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-price"]')))
    reason_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-form-reason"]')))
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="tariff-form-submit"]')))

    audit_reason = "Penyesuaian resmi tarif berkala oleh Fitri"
    fill_input(driver, price_input, "1450")
    fill_input(driver, reason_input, audit_reason)

    driver.execute_script("arguments[0].click();", submit_btn)

    success_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-success"]'))
    )
    assert "berhasil" in success_box.text.lower()

    audit_table = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-history-table"]'))
    )
    assert audit_reason in audit_table.text or "UPDATE" in audit_table.text, (
        "Perubahan tidak tercatat pada tabel riwayat audit"
    )


# --- Task KEL2-116: Menguji Periode Berlaku dan Penggunaan Tarif Aktif pada Simulasi ---
def test_tc05_toggle_status_aktif_nonaktif(driver):
    """
    TC-05: Menguji fungsi pengaktifan dan penonaktifan status parameter tarif.
    """
    driver.get(ADMIN_TARIFF_URL)
    wait = WebDriverWait(driver, 10)

    toggle_buttons = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, '[data-testid^="toggle-tariff-"]'))
    )
    assert len(toggle_buttons) > 0, "Tombol toggle status tidak ditemukan"

    driver.execute_script("arguments[0].click();", toggle_buttons[0])

    success_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-tariff-success"]'))
    )
    assert "status tarif energi berhasil" in success_box.text.lower() or "berhasil" in success_box.text.lower()


def test_tc06_penggunaan_tarif_aktif_pada_simulasi_ev(driver):
    """
    TC-06: Memverifikasi sistem menggunakan parameter tarif aktif pada modul simulasi energi EV.
    """
    driver.get(SIMULATOR_EV_URL)
    wait = WebDriverWait(driver, 10)

    wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
    page_source = driver.page_source.lower()
    assert "tarif" in page_source or "listrik" in page_source or "kwh" in page_source

    calc_button = wait.until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit'], [data-testid='btn-simulate']"))
    )
    driver.execute_script("arguments[0].click();", calc_button)

    time.sleep(1.0)
    assert "rp" in driver.page_source.lower(), "Hasil perhitungan biaya simulasi energi tidak muncul"


# ========================================================================================
# PBI 2: KEL2-68 (PENGELOLAAN PARAMETER INSENTIF DAN PAJAK EV)
# ========================================================================================

# --- Task 1: Membuat Form Input Parameter Insentif dan Pajak EV ---
def test_tc07_kelengkapan_form_insentif_pajak(driver):
    """
    TC-07: Memastikan form input parameter insentif dan pajak EV tampil lengkap di /admin/insentif-pajak.
    Kriteria:
    - Input Kode, Kategori, Nama, Jenis Kendaraan, Tipe Nilai, Besaran Nilai,
      Dasar Perhitungan, Tanggal Berlaku Mulai/Sampai, dan Tombol Simpan dapat diakses.
    """
    driver.get(ADMIN_INCENTIVE_URL)
    wait = WebDriverWait(driver, 10)

    code_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-code"]')))
    cat_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-category"]')))
    name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-name"]')))
    veh_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-vehicle"]')))
    valtype_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-valuetype"]')))
    val_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-value"]')))
    basis_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-basis"]')))
    from_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-from"]')))
    to_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-to"]')))
    submit_btn = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-submit"]')))

    assert code_input.is_displayed(), "Input Kode Kebijakan tidak tampil"
    assert cat_select.is_displayed(), "Dropdown Kategori Regulasi tidak tampil"
    assert name_input.is_displayed(), "Input Nama Kebijakan tidak tampil"
    assert veh_select.is_displayed(), "Dropdown Jenis Kendaraan tidak tampil"
    assert valtype_select.is_displayed(), "Dropdown Tipe Nilai tidak tampil"
    assert val_input.is_displayed(), "Input Besaran Nilai tidak tampil"
    assert basis_input.is_displayed(), "Input Dasar Perhitungan tidak tampil"
    assert from_input.is_displayed(), "Input Berlaku Mulai tidak tampil"
    assert to_input.is_displayed(), "Input Berlaku Sampai tidak tampil"
    assert submit_btn.is_displayed(), "Tombol Simpan Kebijakan tidak tampil"


# --- Task 2: Mengimplementasikan CRUD Data Kebijakan dan Periode Berlaku ---
def test_tc08_crud_tambah_kebijakan_insentif(driver):
    """
    TC-08: [Create] Menambah kebijakan insentif/pajak EV baru beserta periode berlakunya.
    Kriteria:
    - Kebijakan baru berhasil disimpan dan muncul pada tabel daftar kebijakan.
    """
    driver.get(ADMIN_INCENTIVE_URL)
    wait = WebDriverWait(driver, 10)

    code_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-code"]')))
    cat_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-category"]')))
    name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-name"]')))
    veh_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-vehicle"]')))
    valtype_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-valuetype"]')))
    val_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-value"]')))
    basis_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-basis"]')))
    from_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-from"]')))
    to_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-to"]')))
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="incentive-form-submit"]')))

    test_code = "INS_SUBSIDI_FITRI"
    test_name = "Subsidi Khusus Konversi EV Fitri"
    test_val = "8000000"

    fill_input(driver, code_input, test_code)
    Select(cat_select).select_by_value("SUBSIDY")
    fill_input(driver, name_input, test_name)
    Select(veh_select).select_by_value("Motor")
    Select(valtype_select).select_by_value("FIXED_AMOUNT")
    fill_input(driver, val_input, test_val)
    fill_input(driver, basis_input, "Potongan harga konversi unit motor listrik")
    fill_input(driver, from_input, "2026-01-01")
    fill_input(driver, to_input, "2026-12-31")

    driver.execute_script("arguments[0].click();", submit_btn)

    success_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-incentive-success"]'))
    )
    assert "berhasil disimpan" in success_box.text.lower() or "berhasil" in success_box.text.lower()

    table_body = wait.until(EC.visibility_of_element_located((By.TAG_NAME, "tbody")))
    assert test_name in table_body.text, "Data kebijakan baru tidak ditemukan pada tabel"


def test_tc09_crud_ubah_kebijakan_insentif(driver):
    """
    TC-09: [Update] Mengubah data kebijakan insentif/pajak EV yang sudah ada.
    Kriteria:
    - Data kebijakan berhasil diperbarui setelah mengisi perubahan dan submit form.
    """
    driver.get(ADMIN_INCENTIVE_URL)
    wait = WebDriverWait(driver, 10)

    edit_buttons = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, '[data-testid^="edit-incentive-"]'))
    )
    assert len(edit_buttons) > 0, "Tidak ada data kebijakan untuk diubah"
    driver.execute_script("arguments[0].click();", edit_buttons[0])

    val_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-value"]')))
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="incentive-form-submit"]')))

    fill_input(driver, val_input, "11")
    driver.execute_script("arguments[0].click();", submit_btn)

    success_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-incentive-success"]'))
    )
    assert "berhasil diperbarui" in success_box.text.lower() or "berhasil" in success_box.text.lower()


def test_tc10_crud_hapus_kebijakan_insentif(driver):
    """
    TC-10: [Delete] Menghapus salah satu data kebijakan insentif/pajak EV dari sistem.
    Kriteria:
    - Kebijakan berhasil dihapus dan muncul notifikasi sukses penghapusan.
    """
    driver.get(ADMIN_INCENTIVE_URL)
    wait = WebDriverWait(driver, 10)

    delete_buttons = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, '[data-testid^="delete-incentive-"]'))
    )
    assert len(delete_buttons) > 0, "Tidak ada data kebijakan untuk dihapus"

    driver.execute_script("arguments[0].click();", delete_buttons[-1])

    success_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-incentive-success"]'))
    )
    assert "dihapus" in success_box.text.lower() or "berhasil" in success_box.text.lower()


# --- Task 3: Menguji Validasi Kebijakan dan Penggunaan Parameter Aktif ---
def test_tc11_validasi_kebijakan_nilai_persentase(driver):
    """
    TC-11: Menguji validasi form kebijakan (menolak nilai persentase > 100%).
    Kriteria:
    - Sistem menolak nilai persentase > 100% dan menampilkan pesan error validasi.
    """
    driver.get(ADMIN_INCENTIVE_URL)
    wait = WebDriverWait(driver, 10)

    code_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-code"]')))
    name_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-name"]')))
    valtype_select = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-valuetype"]')))
    val_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-value"]')))
    submit_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="incentive-form-submit"]')))

    fill_input(driver, code_input, "TEST_VAL_PERSEN_MAX")
    fill_input(driver, name_input, "Insentif Uji Persen Lebih dari 100")
    Select(valtype_select).select_by_value("PERCENTAGE")
    fill_input(driver, val_input, "150")  # Nilai tidak valid (> 100%)

    driver.execute_script("arguments[0].click();", submit_btn)

    error_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-incentive-error"]'))
    )
    assert len(error_box.text) > 0, "Pesan error validasi tidak muncul"
    assert "100" in error_box.text or "tidak valid" in error_box.text.lower() or "melebihi" in error_box.text.lower()


def test_tc12_toggle_status_dan_parameter_aktif(driver):
    """
    TC-12: Menguji pengubahan status aktif/nonaktif kebijakan insentif EV.
    Kriteria:
    - Status kebijakan dapat dialihkan (Aktif / Nonaktif) dan tersimpan di sistem.
    """
    driver.get(ADMIN_INCENTIVE_URL)
    wait = WebDriverWait(driver, 10)

    toggle_buttons = wait.until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, '[data-testid^="toggle-incentive-"]'))
    )
    assert len(toggle_buttons) > 0, "Tombol toggle status kebijakan tidak ditemukan"

    driver.execute_script("arguments[0].click();", toggle_buttons[0])

    success_box = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="admin-incentive-success"]'))
    )
    assert "status kebijakan" in success_box.text.lower() or "berhasil" in success_box.text.lower()


# ========================================================================================
# ENTRY POINT JIKA DIJALANKAN DENGAN `python testcasefitrisprint1.py`
# ========================================================================================
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
