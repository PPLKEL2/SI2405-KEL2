"""
Skrip Otomasi Selenium + Pytest
Fitur : Kalkulator Biaya BBM & Perawatan Kendaraan Konvensional (PBI KEL2-54)
Teknik: Equivalence Partitioning (EP) + Boundary Value Analysis (BVA)
URL   : http://localhost:3000

Cara menjalankan:
  1. Pastikan server Next.js berjalan  : cd mobilitiq-next && npm run dev
  2. Aktifkan virtual environment      : source .venv/bin/activate   (atau .venv\\Scripts\\activate di Windows)
  3. Install dependensi                : pip install pytest selenium
  4. Jalankan pengujian                : pytest tests/test_kalkulator.py -v
"""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

# ─────────────────────────── Konstanta ────────────────────────────
BASE_URL          = "http://localhost:3000"
WAIT_TIMEOUT      = 10   # batas waktu maksimal tunggu elemen (detik)

# data-testid elemen antarmuka (UI)
TID_TAB_MANUAL         = "tab-formulir-manual"
TID_TAB_STANDAR        = "tab-estimasi-standar"
TID_INPUT_DISTANCE     = "fuelform-input-daily-distance"
TID_INPUT_EFFICIENCY   = "fuelform-input-vehicle-efficiency"
TID_SELECT_FUEL        = "fuelform-select-fuel-type"
TID_INPUT_PRICE        = "fuelform-input-fuel-price"
TID_BTN_SUBMIT         = "fuelform-btn-submit"
TID_BTN_RESET          = "fuelform-btn-reset"
TID_BTN_LOAD_EXAMPLE   = "fuelform-btn-load-example"
TID_ERR_DISTANCE       = "fuelform-error-daily-distance"
TID_ERR_EFFICIENCY     = "fuelform-error-vehicle-efficiency"
TID_ERR_PRICE          = "fuelform-error-fuel-price"
TID_RESULT_SECTION     = "result-section"
TID_DAILY_COST         = "result-daily-cost"
TID_MONTHLY_COST       = "result-monthly-cost"
TID_YEARLY_COST        = "result-yearly-cost"
TID_DAILY_LITERS       = "result-daily-liters"
TID_MONTHLY_LITERS     = "result-monthly-liters"
TID_YEARLY_LITERS      = "result-yearly-liters"


# ───────────────────────── Fixture Driver Browser ─────────────────
@pytest.fixture(scope="function")
def driver():
    """Menyiapkan browser Chrome tanpa tampilan (headless) untuk setiap pengujian."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1440,900")

    drv = webdriver.Chrome(options=chrome_options)
    yield drv
    drv.quit()


# ───────────────────────── Fungsi Bantuan ─────────────────────────
def tunggu_elemen(driver, testid, timeout=WAIT_TIMEOUT):
    """Menunggu hingga elemen dengan data-testid terlihat di layar."""
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, f'[data-testid="{testid}"]'))
    )


def kosongkan_dan_ketik(driver, testid, nilai, timeout=WAIT_TIMEOUT):
    """
    Mengosongkan input React lalu mengetikkan nilai baru.
    Menggunakan setter JavaScript agar state React terpicu secara akurat.
    """
    el = tunggu_elemen(driver, testid, timeout)

    driver.execute_script(
        """
        var nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeSetter.call(arguments[0], '');
        arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
        arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
        """,
        el,
    )

    if str(nilai) != "":
        el.send_keys(str(nilai))

    return el


def buka_tab_formulir_manual(driver):
    """Membuka halaman web dan masuk ke tab 'Formulir Manual Bebas'."""
    driver.get(BASE_URL)
    tombol_manual = tunggu_elemen(driver, TID_TAB_MANUAL)
    tombol_manual.click()
    tunggu_elemen(driver, TID_INPUT_DISTANCE)


def isi_formulir_dan_hitung(driver, jarak, efisiensi, jenis_bbm="pertalite", harga="10000"):
    """Mengisi seluruh data pada formulir lalu menekan tombol 'Hitung Estimasi BBM'."""
    kosongkan_dan_ketik(driver, TID_INPUT_DISTANCE, jarak)
    kosongkan_dan_ketik(driver, TID_INPUT_EFFICIENCY, efisiensi)

    pilihan_bbm = tunggu_elemen(driver, TID_SELECT_FUEL)
    Select(pilihan_bbm).select_by_value(jenis_bbm)

    kosongkan_dan_ketik(driver, TID_INPUT_PRICE, harga)

    tombol_hitung = tunggu_elemen(driver, TID_BTN_SUBMIT)
    tombol_hitung.click()


# ═══════════════════════════════════════════════════════════════════
#  DAFTAR DATA KASUS UJI (TEST CASES)
# ═══════════════════════════════════════════════════════════════════

# KASUS UJI POSITIF (Perhitungan Normal & Batas Nilai Valid)
KASUS_UJI_POSITIF = [
    # Format: (label_tc, jarak, efisiensi, jenis_bbm, harga, perkiraan_biaya_harian, perkiraan_liter_bulanan, perkiraan_biaya_tahunan)
    (
        "TC-01: Hitung Normal Mobil Standar (60 km, 12 km/L, Pertalite Rp10.000)",
        "60", "12", "pertalite", "10000",
        "Rp 50.000", "150 L", "Rp 18.250.000"
    ),
    (
        "TC-02: Hitung Motor Hemat (30 km, 45 km/L, Pertalite Rp10.000)",
        "30", "45", "pertalite", "10000",
        "Rp 6.667", "20 L", "Rp 2.433.333"
    ),
    (
        "TC-03: Batas Bawah Jarak 0 km (Hasil Harus Rp0 dan 0 Liter)",
        "0", "12", "pertalite", "10000",
        "Rp 0", "0 L", "Rp 0"
    ),
    (
        "TC-04: Batas Atas Chip Jarak 100 km (SUV & Pertamax Rp12.500)",
        "100", "8", "pertamax", "12500",
        "Rp 156.250", "375 L", "Rp 57.031.250"
    ),
    (
        "TC-05: Batas Bawah Efisiensi Terkecil 0.1 km/L",
        "60", "0.1", "pertalite", "10000",
        "Rp 6.000.000", "18.000 L", "Rp 2.190.000.000"
    ),
    (
        "TC-06: BBM Kustom dengan Harga Manual Rp15.000",
        "60", "12", "custom", "15000",
        "Rp 75.000", "150 L", "Rp 27.375.000"
    ),
]

# KASUS UJI NEGATIF (Validasi Error Input Kosong / Tidak Sah)
KASUS_UJI_NEGATIF = [
    # Format: (label_tc, jarak, efisiensi, jenis_bbm, harga, pesan_error_jarak, pesan_error_efisiensi, pesan_error_harga)
    (
        "TC-07: Validasi Semua Input Dikosongkan",
        "", "", "pertalite", "",
        "Jarak tempuh harian wajib diisi",
        "Efisiensi kendaraan wajib diisi",
        "Harga BBM per liter wajib diisi"
    ),
    (
        "TC-08: Validasi Nilai Jarak Tempuh Negatif",
        "-5", "12", "pertalite", "10000",
        "Jarak tempuh tidak boleh bernilai negatif",
        None, None
    ),
    (
        "TC-09: Validasi Nilai Efisiensi Nol (Tidak Boleh Nol/Negatif)",
        "60", "0", "pertalite", "10000",
        None,
        "Efisiensi kendaraan harus lebih dari 0",
        None
    ),
    (
        "TC-10: Validasi Nilai Harga BBM Negatif",
        "60", "12", "pertalite", "-1",
        None, None,
        "Harga BBM per liter harus lebih dari Rp0"
    ),
]


# ════════════════════════════════════════════════════════════════════
#  1. PENGUJIAN KASUS POSITIF (PERHITUNGAN VALID)
# ════════════════════════════════════════════════════════════════════
class TestKasusPositif:
    """Menguji bahwa input yang valid menghasilkan estimasi biaya dan volume BBM yang benar."""

    @pytest.mark.parametrize(
        "label_tc, jarak, efisiensi, jenis_bbm, harga, "
        "biaya_harian_diharapkan, liter_bulanan_diharapkan, biaya_tahunan_diharapkan",
        KASUS_UJI_POSITIF,
        ids=[kasus[0] for kasus in KASUS_UJI_POSITIF],
    )
    def test_hitung_biaya_bbm(
        self,
        driver,
        label_tc,
        jarak,
        efisiensi,
        jenis_bbm,
        harga,
        biaya_harian_diharapkan,
        liter_bulanan_diharapkan,
        biaya_tahunan_diharapkan,
    ):
        """Memverifikasi tampilan biaya harian, liter bulanan, dan biaya tahunan."""
        buka_tab_formulir_manual(driver)
        isi_formulir_dan_hitung(driver, jarak, efisiensi, jenis_bbm, harga)

        el_biaya_harian = tunggu_elemen(driver, TID_DAILY_COST)
        el_liter_bulanan = tunggu_elemen(driver, TID_MONTHLY_LITERS)
        el_biaya_tahunan = tunggu_elemen(driver, TID_YEARLY_COST)

        assert biaya_harian_diharapkan in el_biaya_harian.text, (
            f"[{label_tc}] Biaya harian salah. Diharapkan: '{biaya_harian_diharapkan}', Didapat: '{el_biaya_harian.text}'"
        )
        assert liter_bulanan_diharapkan in el_liter_bulanan.text, (
            f"[{label_tc}] Liter bulanan salah. Diharapkan: '{liter_bulanan_diharapkan}', Didapat: '{el_liter_bulanan.text}'"
        )
        assert biaya_tahunan_diharapkan in el_biaya_tahunan.text, (
            f"[{label_tc}] Biaya tahunan salah. Diharapkan: '{biaya_tahunan_diharapkan}', Didapat: '{el_biaya_tahunan.text}'"
        )


# ════════════════════════════════════════════════════════════════════
#  2. PENGUJIAN KASUS NEGATIF (VALIDASI PESAN ERROR)
# ════════════════════════════════════════════════════════════════════
class TestKasusNegatif:
    """Menguji bahwa input yang tidak valid menampilkan pesan error dan menyembunyikan hasil."""

    @pytest.mark.parametrize(
        "label_tc, jarak, efisiensi, jenis_bbm, harga, "
        "pesan_error_jarak, pesan_error_efisiensi, pesan_error_harga",
        KASUS_UJI_NEGATIF,
        ids=[kasus[0] for kasus in KASUS_UJI_NEGATIF],
    )
    def test_validasi_input_salah(
        self,
        driver,
        label_tc,
        jarak,
        efisiensi,
        jenis_bbm,
        harga,
        pesan_error_jarak,
        pesan_error_efisiensi,
        pesan_error_harga,
    ):
        """Memverifikasi pesan peringatan error muncul dan area hasil kalkulasi disembunyikan."""
        buka_tab_formulir_manual(driver)
        isi_formulir_dan_hitung(driver, jarak, efisiensi, jenis_bbm, harga)

        if pesan_error_jarak:
            el_error = tunggu_elemen(driver, TID_ERR_DISTANCE)
            assert pesan_error_jarak in el_error.text, (
                f"[{label_tc}] Pesan error jarak salah. Diharapkan: '{pesan_error_jarak}', Didapat: '{el_error.text}'"
            )

        if pesan_error_efisiensi:
            el_error = tunggu_elemen(driver, TID_ERR_EFFICIENCY)
            assert pesan_error_efisiensi in el_error.text, (
                f"[{label_tc}] Pesan error efisiensi salah. Diharapkan: '{pesan_error_efisiensi}', Didapat: '{el_error.text}'"
            )

        if pesan_error_harga:
            el_error = tunggu_elemen(driver, TID_ERR_PRICE)
            assert pesan_error_harga in el_error.text, (
                f"[{label_tc}] Pesan error harga salah. Diharapkan: '{pesan_error_harga}', Didapat: '{el_error.text}'"
            )

        # Memastikan kotak hasil tidak tampil saat validasi gagal
        try:
            WebDriverWait(driver, 3).until(
                EC.invisibility_of_element_located(
                    (By.CSS_SELECTOR, f'[data-testid="{TID_RESULT_SECTION}"]')
                )
            )
        except Exception:
            pass

        elemen_hasil = driver.find_elements(
            By.CSS_SELECTOR, f'[data-testid="{TID_RESULT_SECTION}"]'
        )
        assert len(elemen_hasil) == 0 or not elemen_hasil[0].is_displayed(), (
            f"[{label_tc}] Kotak hasil seharusnya tidak ditampilkan ketika ada input yang salah!"
        )


# ════════════════════════════════════════════════════════════════════
#  3. PENGUJIAN FITUR TOMBOL & INTERAKSI UI
# ════════════════════════════════════════════════════════════════════
class TestFiturTombol:
    """Menguji fitur interaktif seperti tombol Muat Contoh, Reset, Tab Switcher, dan Chip Pintas."""

    def test_tombol_muat_contoh_otomatis_isi_dan_hitung(self, driver):
        """TC-11: Menekan tombol 'Muat Contoh' harus otomatis mengisi data (60 km, 12 km/L) dan menghitung."""
        buka_tab_formulir_manual(driver)

        tombol_contoh = tunggu_elemen(driver, TID_BTN_LOAD_EXAMPLE)
        tombol_contoh.click()

        el_biaya_harian = tunggu_elemen(driver, TID_DAILY_COST)
        assert "Rp 50.000" in el_biaya_harian.text, (
            f"TC-11: Biaya harian contoh salah, didapat: '{el_biaya_harian.text}'"
        )

        input_jarak = tunggu_elemen(driver, TID_INPUT_DISTANCE)
        assert input_jarak.get_attribute("value") == "60", (
            f"TC-11: Nilai jarak contoh seharusnya 60, didapat: '{input_jarak.get_attribute('value')}'"
        )

    def test_tombol_reset_membersihkan_form_dan_hasil(self, driver):
        """TC-12: Menekan tombol 'Reset' harus mengosongkan input dan menghapus hasil dari layar."""
        buka_tab_formulir_manual(driver)

        # Isi terlebih dahulu lewat tombol contoh
        tombol_contoh = tunggu_elemen(driver, TID_BTN_LOAD_EXAMPLE)
        tombol_contoh.click()
        tunggu_elemen(driver, TID_DAILY_COST)

        # Klik tombol reset
        tombol_reset = tunggu_elemen(driver, TID_BTN_RESET)
        tombol_reset.click()

        # Input jarak harus menjadi kosong
        input_jarak = tunggu_elemen(driver, TID_INPUT_DISTANCE)
        WebDriverWait(driver, WAIT_TIMEOUT).until(
            lambda d: d.find_element(
                By.CSS_SELECTOR, f'[data-testid="{TID_INPUT_DISTANCE}"]'
            ).get_attribute("value") == ""
        )
        assert input_jarak.get_attribute("value") == "", (
            f"TC-12: Input jarak seharusnya kosong setelah reset, didapat: '{input_jarak.get_attribute('value')}'"
        )

        # Kotak hasil tidak boleh tampil
        elemen_hasil = driver.find_elements(
            By.CSS_SELECTOR, f'[data-testid="{TID_RESULT_SECTION}"]'
        )
        assert len(elemen_hasil) == 0 or not elemen_hasil[0].is_displayed(), (
            "TC-12: Kotak hasil masih terlihat di layar setelah menekan tombol Reset!"
        )

    def test_pindah_ke_tab_estimasi_standar(self, driver):
        """TC-13: Menekan tab 'Estimasi Standar & Perawatan' harus beralih ke tampilan standar."""
        buka_tab_formulir_manual(driver)

        tombol_standar = tunggu_elemen(driver, TID_TAB_STANDAR)
        tombol_standar.click()

        # Formulir manual harus hilang dari pandangan
        WebDriverWait(driver, WAIT_TIMEOUT).until(
            EC.invisibility_of_element_located(
                (By.CSS_SELECTOR, f'[data-testid="{TID_INPUT_DISTANCE}"]')
            )
        )
        elemen_form = driver.find_elements(
            By.CSS_SELECTOR, f'[data-testid="{TID_INPUT_DISTANCE}"]'
        )
        assert len(elemen_form) == 0 or not elemen_form[0].is_displayed(), (
            "TC-13: Formulir manual masih terlihat setelah beralih ke tab Estimasi Standar!"
        )

    def test_chip_pilihan_jarak_mengisi_input(self, driver):
        """TC-14: Menekan chip pintas jarak '60 km' harus otomatis mengisi input jarak dengan 60."""
        buka_tab_formulir_manual(driver)

        chip_60 = tunggu_elemen(driver, "fuelform-chip-distance-60")
        chip_60.click()

        input_jarak = tunggu_elemen(driver, TID_INPUT_DISTANCE)
        assert input_jarak.get_attribute("value") == "60", (
            f"TC-14: Nilai input jarak setelah klik chip 60 km salah: '{input_jarak.get_attribute('value')}'"
        )

    def test_chip_pilihan_efisiensi_mengisi_input(self, driver):
        """TC-15: Menekan chip pintas efisiensi 'Motor (45 km/L)' harus otomatis mengisi nilai 45."""
        buka_tab_formulir_manual(driver)

        chip_45 = tunggu_elemen(driver, "fuelform-chip-efficiency-45")
        chip_45.click()

        input_efisiensi = tunggu_elemen(driver, TID_INPUT_EFFICIENCY)
        assert input_efisiensi.get_attribute("value") == "45", (
            f"TC-15: Nilai input efisiensi setelah klik chip 45 salah: '{input_efisiensi.get_attribute('value')}'"
        )
