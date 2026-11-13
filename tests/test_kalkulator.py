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
from selenium.webdriver.common.keys import Keys

# ─────────────────────────── Konstanta ────────────────────────────
BASE_URL          = "http://localhost:3000"
WAIT_TIMEOUT      = 10   # detik maksimum untuk setiap WebDriverWait

# data-testid yang dipakai di seluruh skrip
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


# ───────────────────────── Fixture WebDriver ──────────────────────
@pytest.fixture(scope="function")
def driver():
    """
    Menyediakan Chrome WebDriver headless untuk setiap fungsi uji.
    Driver ditutup otomatis setelah fungsi uji selesai.
    """
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1440,900")

    drv = webdriver.Chrome(options=chrome_options)
    yield drv
    drv.quit()


# ───────────────────────── Helper Functions ───────────────────────
def wait_for(driver, testid, timeout=WAIT_TIMEOUT):
    """Tunggu elemen dengan data-testid muncul dan terlihat."""
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, f'[data-testid="{testid}"]'))
    )


def clear_and_type(driver, testid, value, timeout=WAIT_TIMEOUT):
    """Kosongkan dan ketik nilai baru ke input dengan data-testid tertentu."""
    el = wait_for(driver, testid, timeout)
    el.clear()
    # Pastikan clear berhasil (beberapa browser perlu triple-click)
    el.send_keys(Keys.CONTROL + "a")
    el.send_keys(Keys.DELETE)
    el.send_keys(str(value))
    return el


def open_manual_tab(driver):
    """Buka halaman dan navigasikan ke tab Formulir Manual Bebas."""
    driver.get(BASE_URL)
    # Klik tab manual
    btn = wait_for(driver, TID_TAB_MANUAL)
    btn.click()
    # Pastikan form sudah muncul
    wait_for(driver, TID_INPUT_DISTANCE)


def fill_and_submit(driver, distance, efficiency, fuel_value="pertalite", price="10000"):
    """
    Isi form kalkulator BBM dan klik Hitung.
    fuel_value: value dari <option> pada <select> (id BBM preset).
    """
    clear_and_type(driver, TID_INPUT_DISTANCE, distance)
    clear_and_type(driver, TID_INPUT_EFFICIENCY, efficiency)

    select_el = wait_for(driver, TID_SELECT_FUEL)
    Select(select_el).select_by_value(fuel_value)

    clear_and_type(driver, TID_INPUT_PRICE, price)

    btn = wait_for(driver, TID_BTN_SUBMIT)
    btn.click()


# ═══════════════════════════════════════════════════════════════════
#  TABEL KASUS UJI – PARAMETRIZE
#  Format tuple: (case_id, distance, efficiency, fuel_value, price,
#                 expect_error_distance, expect_error_efficiency,
#                 expect_error_price, expect_daily_cost_contains,
#                 description)
# ═══════════════════════════════════════════════════════════════════
POSITIVE_CASES = [
    # (case_id, distance, efficiency, fuel_value, price, daily_cost_substr, monthly_liters_substr, yearly_cost_substr)
    # TC-01 EP-Positive: nilai normal (60 km, 12 km/L, Pertalite Rp10.000)
    # Harian: 60/12 = 5 L × 10000 = Rp 50.000
    # Bulanan: 5 × 30 = 150 L
    # Tahunan: 5 × 365 = 1.825 L × 10.000 = Rp 18.250.000
    ("TC-01", "60", "12", "pertalite", "10000",
     "Rp 50.000", "150 L", "Rp 18.250.000"),

    # TC-02 EP-Positive: Motor hemat (30 km, 45 km/L, Pertalite Rp10.000)
    # Harian: 30/45 = 0,667 L → Rp 6.667
    # Bulanan: 0,667 × 30 = 20 L → Rp 200.000
    ("TC-02", "30", "45", "pertalite", "10000",
     "Rp 6.667", "20 L", "Rp 2.433.333"),

    # TC-03 BVA-Boundary bawah distance: 0 km (valid, hasil 0)
    # Semua = 0 L, Rp 0
    ("TC-03", "0", "12", "pertalite", "10000",
     "Rp 0", "0 L", "Rp 0"),

    # TC-04 BVA-Boundary atas distance chip: 100 km, SUV 8 km/L, Rp12.500
    # Harian: 100/8 = 12,5 L × 12.500 = Rp 156.250
    # Bulanan: 12,5 × 30 = 375 L
    ("TC-04", "100", "8", "pertamax", "12500",
     "Rp 156.250", "375 L", "Rp 57.031.250"),

    # TC-05 BVA-Boundary bawah efficiency: 0.1 km/L (nilai minimum valid)
    # Harian: 60/0.1 = 600 L × 10.000 = Rp 6.000.000
    ("TC-05", "60", "0.1", "pertalite", "10000",
     "Rp 6.000.000", "18.000 L", "Rp 2.190.000.000"),

    # TC-06 EP-Positive custom fuel: harga kustom Rp 15.000
    ("TC-06", "60", "12", "custom", "15000",
     "Rp 75.000", "150 L", "Rp 27.375.000"),
]

NEGATIVE_CASES = [
    # (case_id, distance, efficiency, fuel_value, price,
    #  expect_err_distance_msg, expect_err_efficiency_msg, expect_err_price_msg)
    # TC-07 Negative: semua field kosong
    ("TC-07", "", "", "pertalite", "",
     "Jarak tempuh harian wajib diisi",
     "Efisiensi kendaraan wajib diisi",
     "Harga BBM per liter wajib diisi"),

    # TC-08 Negative EP: jarak negatif
    ("TC-08", "-5", "12", "pertalite", "10000",
     "Jarak tempuh tidak boleh bernilai negatif",
     None, None),

    # TC-09 Negative EP: efisiensi = 0 (harus > 0)
    ("TC-09", "60", "0", "pertalite", "10000",
     None,
     "Efisiensi kendaraan harus lebih dari 0",
     None),

    # TC-10 Negative EP: harga negatif
    ("TC-10", "60", "12", "pertalite", "-1",
     None, None,
     "Harga BBM per liter harus lebih dari Rp0"),
]


# ════════════════════════════════════════════════════════════════════
#  TEST CLASS 1: Kasus Positif (EP + BVA)
# ════════════════════════════════════════════════════════════════════
class TestPositiveCases:
    """TC-01 s/d TC-06 — perhitungan valid menghasilkan nilai benar."""

    @pytest.mark.parametrize(
        "case_id, distance, efficiency, fuel_value, price, "
        "daily_cost_substr, monthly_liters_substr, yearly_cost_substr",
        POSITIVE_CASES,
        ids=[c[0] for c in POSITIVE_CASES],
    )
    def test_positive_calculation(
        self,
        driver,
        case_id,
        distance,
        efficiency,
        fuel_value,
        price,
        daily_cost_substr,
        monthly_liters_substr,
        yearly_cost_substr,
    ):
        """
        Verifikasi bahwa form menghasilkan biaya harian, liter bulanan,
        dan biaya tahunan yang sesuai dengan expected result.
        """
        open_manual_tab(driver)
        fill_and_submit(driver, distance, efficiency, fuel_value, price)

        # Tunggu hasil muncul
        daily_cost_el = wait_for(driver, TID_DAILY_COST)
        monthly_liters_el = wait_for(driver, TID_MONTHLY_LITERS)
        yearly_cost_el = wait_for(driver, TID_YEARLY_COST)

        assert daily_cost_substr in daily_cost_el.text, (
            f"[{case_id}] Biaya harian: expected '{daily_cost_substr}', "
            f"got '{daily_cost_el.text}'"
        )
        assert monthly_liters_substr in monthly_liters_el.text, (
            f"[{case_id}] Liter bulanan: expected '{monthly_liters_substr}', "
            f"got '{monthly_liters_el.text}'"
        )
        assert yearly_cost_substr in yearly_cost_el.text, (
            f"[{case_id}] Biaya tahunan: expected '{yearly_cost_substr}', "
            f"got '{yearly_cost_el.text}'"
        )


# ════════════════════════════════════════════════════════════════════
#  TEST CLASS 2: Kasus Negatif (EP Validasi Error)
# ════════════════════════════════════════════════════════════════════
class TestNegativeCases:
    """TC-07 s/d TC-10 — validasi error message muncul untuk input tidak valid."""

    @pytest.mark.parametrize(
        "case_id, distance, efficiency, fuel_value, price, "
        "err_distance, err_efficiency, err_price",
        NEGATIVE_CASES,
        ids=[c[0] for c in NEGATIVE_CASES],
    )
    def test_negative_validation(
        self,
        driver,
        case_id,
        distance,
        efficiency,
        fuel_value,
        price,
        err_distance,
        err_efficiency,
        err_price,
    ):
        """
        Verifikasi bahwa pesan error yang sesuai muncul ketika input tidak valid.
        """
        open_manual_tab(driver)
        fill_and_submit(driver, distance, efficiency, fuel_value, price)

        if err_distance:
            err_el = wait_for(driver, TID_ERR_DISTANCE)
            assert err_distance in err_el.text, (
                f"[{case_id}] Error jarak: expected '{err_distance}', "
                f"got '{err_el.text}'"
            )

        if err_efficiency:
            err_el = wait_for(driver, TID_ERR_EFFICIENCY)
            assert err_efficiency in err_el.text, (
                f"[{case_id}] Error efisiensi: expected '{err_efficiency}', "
                f"got '{err_el.text}'"
            )

        if err_price:
            err_el = wait_for(driver, TID_ERR_PRICE)
            assert err_price in err_el.text, (
                f"[{case_id}] Error harga: expected '{err_price}', "
                f"got '{err_el.text}'"
            )

        # Pastikan hasil TIDAK muncul
        result_els = driver.find_elements(
            By.CSS_SELECTOR, f'[data-testid="{TID_RESULT_SECTION}"]'
        )
        assert len(result_els) == 0 or not result_els[0].is_displayed(), (
            f"[{case_id}] Result section seharusnya tidak tampil untuk input tidak valid"
        )


# ════════════════════════════════════════════════════════════════════
#  TEST CLASS 3: Fitur Tombol (Load Example, Reset, Tab Switch)
# ════════════════════════════════════════════════════════════════════
class TestButtonFeatures:
    """Pengujian fungsional tombol Muat Contoh, Reset, dan perpindahan tab."""

    def test_load_example_fills_and_calculates(self, driver):
        """
        TC-11 — Tombol 'Muat Contoh' harus mengisi form dengan
        60 km, 12 km/L, Rp10.000 dan langsung menampilkan hasil.
        """
        open_manual_tab(driver)

        btn = wait_for(driver, TID_BTN_LOAD_EXAMPLE)
        btn.click()

        # Pastikan hasil tampil (Rp 50.000 harian)
        daily_cost_el = wait_for(driver, TID_DAILY_COST)
        assert "Rp 50.000" in daily_cost_el.text, (
            f"TC-11: expected 'Rp 50.000' di biaya harian, got '{daily_cost_el.text}'"
        )

        # Pastikan input distance terisi 60
        dist_input = wait_for(driver, TID_INPUT_DISTANCE)
        assert dist_input.get_attribute("value") == "60", (
            f"TC-11: expected distance=60, got '{dist_input.get_attribute('value')}'"
        )

    def test_reset_clears_form_and_result(self, driver):
        """
        TC-12 — Tombol Reset harus mengosongkan input jarak dan efisiensi,
        serta menghilangkan hasil perhitungan.
        """
        open_manual_tab(driver)

        # Isi dulu dengan contoh
        btn_example = wait_for(driver, TID_BTN_LOAD_EXAMPLE)
        btn_example.click()
        wait_for(driver, TID_DAILY_COST)   # pastikan hasil ada

        # Klik reset
        btn_reset = wait_for(driver, TID_BTN_RESET)
        btn_reset.click()

        # Setelah reset, input distance harus kosong
        dist_input = wait_for(driver, TID_INPUT_DISTANCE)
        WebDriverWait(driver, WAIT_TIMEOUT).until(
            lambda d: d.find_element(
                By.CSS_SELECTOR, f'[data-testid="{TID_INPUT_DISTANCE}"]'
            ).get_attribute("value") == ""
        )
        assert dist_input.get_attribute("value") == "", (
            f"TC-12: Setelah reset, distance harus kosong, "
            f"got '{dist_input.get_attribute('value')}'"
        )

        # Hasil tidak boleh tampil
        result_els = driver.find_elements(
            By.CSS_SELECTOR, f'[data-testid="{TID_RESULT_SECTION}"]'
        )
        assert len(result_els) == 0 or not result_els[0].is_displayed(), (
            "TC-12: Result section masih tampil setelah reset"
        )

    def test_tab_switch_estimasi_standar(self, driver):
        """
        TC-13 — Klik tab 'Estimasi Standar & Perawatan' harus menyembunyikan
        form manual dan menampilkan view MaintenanceCalculatorView.
        """
        open_manual_tab(driver)

        # Klik balik ke tab Estimasi Standar
        btn_standar = wait_for(driver, TID_TAB_STANDAR)
        btn_standar.click()

        # Form manual tidak boleh terlihat lagi
        WebDriverWait(driver, WAIT_TIMEOUT).until(
            EC.invisibility_of_element_located(
                (By.CSS_SELECTOR, f'[data-testid="{TID_INPUT_DISTANCE}"]')
            )
        )
        form_els = driver.find_elements(
            By.CSS_SELECTOR, f'[data-testid="{TID_INPUT_DISTANCE}"]'
        )
        assert len(form_els) == 0 or not form_els[0].is_displayed(), (
            "TC-13: Form manual masih tampil setelah pindah ke tab Estimasi Standar"
        )

    def test_chip_distance_sets_input(self, driver):
        """
        TC-14 — Klik chip '60 km (Contoh)' harus mengisi input jarak dengan 60.
        """
        open_manual_tab(driver)

        chip = wait_for(driver, "fuelform-chip-distance-60")
        chip.click()

        dist_input = wait_for(driver, TID_INPUT_DISTANCE)
        assert dist_input.get_attribute("value") == "60", (
            f"TC-14: Chip distance-60 harus set nilai 60, "
            f"got '{dist_input.get_attribute('value')}'"
        )

    def test_chip_efficiency_sets_input(self, driver):
        """
        TC-15 — Klik chip 'Motor (45 km/L)' harus mengisi input efisiensi dengan 45.
        """
        open_manual_tab(driver)

        chip = wait_for(driver, "fuelform-chip-efficiency-45")
        chip.click()

        eff_input = wait_for(driver, TID_INPUT_EFFICIENCY)
        assert eff_input.get_attribute("value") == "45", (
            f"TC-15: Chip efficiency-45 harus set nilai 45, "
            f"got '{eff_input.get_attribute('value')}'"
        )
