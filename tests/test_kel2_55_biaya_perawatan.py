"""
Skrip Otomasi Selenium + Pytest
PBI   : KEL2-55 (Estimasi Biaya Perawatan Kendaraan Berbahan Bakar Fosil)
Teknik: Equivalence Partitioning (EP) + Boundary Value Analysis (BVA)
Subtask:
  - KEL2-94: Membuat Form Input Kendaraan dan Periode Kepemilikan
  - KEL2-95: Mengimplementasikan Perhitungan Estimasi Biaya Perawatan
  - KEL2-96: Menampilkan Rincian Biaya dan Menguji Perubahan Parameter
URL   : http://localhost:3000

Cara Menjalankan:
  pytest tests/test_kel2_55_biaya_perawatan.py -v
"""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

BASE_URL     = "http://localhost:3000"
WAIT_TIMEOUT = 10

# data-testid untuk komponen PBI KEL2-55
TID_TAB_STANDAR              = "tab-estimasi-standar"
TID_SELECT_VEHICLE           = "maint-select-vehicle"
TID_SELECT_FUEL_TYPE         = "maint-select-fuel-type"
TID_RANGE_EFFICIENCY         = "maint-range-efficiency"
TID_RANGE_DISTANCE           = "maint-range-distance"
TID_BTN_PERIOD_1             = "maint-btn-period-1"
TID_BTN_PERIOD_3             = "maint-btn-period-3"
TID_BTN_PERIOD_5             = "maint-btn-period-5"
TID_VAL_FUEL_COST            = "maint-val-fuel-cost"
TID_VAL_MAINTENANCE_COST     = "maint-val-maintenance-cost"
TID_VAL_TOTAL_COST           = "maint-val-total-cost"
TID_SECTION_BREAKDOWN        = "maint-section-breakdown"
TID_BADGE_EV_SAVINGS         = "maint-badge-ev-savings"


@pytest.fixture(scope="function")
def driver():
    """Chrome headless WebDriver fixture."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1440,900")

    drv = webdriver.Chrome(options=chrome_options)
    yield drv
    drv.quit()


def tunggu_elemen(driver, testid, timeout=WAIT_TIMEOUT):
    return WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, f'[data-testid="{testid}"]'))
    )


def buka_tab_perawatan(driver):
    driver.get(BASE_URL)
    tombol_standar = tunggu_elemen(driver, TID_TAB_STANDAR)
    tombol_standar.click()
    tunggu_elemen(driver, TID_SELECT_VEHICLE)


def atur_slider(driver, testid, nilai):
    """Mengatur posisi slider range HTML5 dan memicu event input React."""
    el = tunggu_elemen(driver, testid)
    driver.execute_script(
        """
        var nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeSetter.call(arguments[0], arguments[1]);
        arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
        arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
        """,
        el,
        str(nilai),
    )


def pilih_kendaraan(driver, nama_kendaraan):
    select_el = tunggu_elemen(driver, TID_SELECT_VEHICLE)
    Select(select_el).select_by_value(nama_kendaraan)


def pilih_bbm(driver, nama_bbm):
    select_el = tunggu_elemen(driver, TID_SELECT_FUEL_TYPE)
    Select(select_el).select_by_value(nama_bbm)


# ═══════════════════════════════════════════════════════════════════
#  DAFTAR KASUS UJI KEL2-55 (EQUIVALENCE PARTITIONING & BVA)
# ═══════════════════════════════════════════════════════════════════

# KASUS UJI PARTISI KENDARAAN (EP: MOTOR VS MOBIL)
KASUS_UJI_EP_KENDARAAN = [
    # Format: (label_tc, kendaraan, biaya_perawatan_diharapkan, bbm_diharapkan, total_diharapkan)
    (
        "TC-01: [EP] Motor Honda Vario 125 (Rp47/km, 45 km/L)",
        "Honda Vario 125",
        "Rp 84.600", "Rp 400.000", "Rp 517.933"
    ),
    (
        "TC-02: [EP] Mobil Toyota Avanza (Rp230/km, 12.5 km/L)",
        "Toyota Avanza",
        "Rp 414.000", "Rp 1.440.000", "Rp 2.145.667"
    ),
    (
        "TC-03: [EP] Motor Yamaha NMAX (Rp47/km, 40 km/L)",
        "Yamaha NMAX",
        "Rp 84.600", "Rp 450.000", "Rp 567.933"
    ),
    (
        "TC-04: [EP] Motor Honda Beat (Rp47/km, 52 km/L)",
        "Honda Beat",
        "Rp 84.600", "Rp 346.154", "Rp 464.087"
    ),
    (
        "TC-05: [EP] Mobil Honda Brio (Rp230/km, 15 km/L)",
        "Honda Brio",
        "Rp 414.000", "Rp 1.200.000", "Rp 1.905.667"
    ),
    (
        "TC-06: [EP] Mobil Mitsubishi Xpander (Rp230/km, 12 km/L)",
        "Mitsubishi Xpander",
        "Rp 414.000", "Rp 1.500.000", "Rp 2.205.667"
    ),
]

# KASUS UJI BATAS JARAK TEMPUH (BVA: MIN 5 KM & MAX 150 KM)
KASUS_UJI_BVA_JARAK = [
    # Format: (label_tc, kendaraan, jarak_km, biaya_perawatan_diharapkan)
    (
        "TC-07: [BVA] Batas Bawah Jarak 5 km/hari pada Motor Vario 125",
        "Honda Vario 125", 5, "Rp 7.050"
    ),
    (
        "TC-08: [BVA] Batas Atas Jarak 150 km/hari pada Motor Vario 125",
        "Honda Vario 125", 150, "Rp 211.500"
    ),
    (
        "TC-09: [BVA] Batas Bawah Jarak 5 km/hari pada Mobil Avanza",
        "Toyota Avanza", 5, "Rp 34.500"
    ),
    (
        "TC-10: [BVA] Batas Atas Jarak 150 km/hari pada Mobil Avanza",
        "Toyota Avanza", 150, "Rp 1.035.000"
    ),
]


# ════════════════════════════════════════════════════════════════════
#  1. PENGUJIAN PARTISI KENDARAAN (EQUIVALENCE PARTITIONING)
# ════════════════════════════════════════════════════════════════════
class TestKategoriKendaraanEP:
    """Menguji partisi kategori kendaraan motor (Rp47/km) vs mobil (Rp230/km)."""

    @pytest.mark.parametrize(
        "label_tc, kendaraan, biaya_maint_exp, biaya_bbm_exp, total_exp",
        KASUS_UJI_EP_KENDARAAN,
        ids=[k[0] for k in KASUS_UJI_EP_KENDARAAN],
    )
    def test_kalkulasi_kategori_kendaraan(
        self, driver, label_tc, kendaraan, biaya_maint_exp, biaya_bbm_exp, total_exp
    ):
        buka_tab_perawatan(driver)
        pilih_kendaraan(driver, kendaraan)

        el_maint = tunggu_elemen(driver, TID_VAL_MAINTENANCE_COST)
        el_fuel = tunggu_elemen(driver, TID_VAL_FUEL_COST)
        el_total = tunggu_elemen(driver, TID_VAL_TOTAL_COST)

        assert biaya_maint_exp in el_maint.text, (
            f"[{label_tc}] Biaya perawatan salah. Expected: '{biaya_maint_exp}', Got: '{el_maint.text}'"
        )
        assert biaya_bbm_exp in el_fuel.text, (
            f"[{label_tc}] Biaya BBM salah. Expected: '{biaya_bbm_exp}', Got: '{el_fuel.text}'"
        )
        assert total_exp in el_total.text, (
            f"[{label_tc}] Total biaya salah. Expected: '{total_exp}', Got: '{el_total.text}'"
        )


# ════════════════════════════════════════════════════════════════════
#  2. PENGUJIAN BATAS JARAK TEMPUH (BOUNDARY VALUE ANALYSIS)
# ════════════════════════════════════════════════════════════════════
class TestBatasNilaiJarakBVA:
    """Menguji nilai batas bawah (5 km) dan batas atas (150 km) pada slider jarak."""

    @pytest.mark.parametrize(
        "label_tc, kendaraan, jarak_km, biaya_maint_exp",
        KASUS_UJI_BVA_JARAK,
        ids=[k[0] for k in KASUS_UJI_BVA_JARAK],
    )
    def test_batas_slider_jarak(
        self, driver, label_tc, kendaraan, jarak_km, biaya_maint_exp
    ):
        buka_tab_perawatan(driver)
        pilih_kendaraan(driver, kendaraan)
        atur_slider(driver, TID_RANGE_DISTANCE, jarak_km)

        el_maint = tunggu_elemen(driver, TID_VAL_MAINTENANCE_COST)
        assert biaya_maint_exp in el_maint.text, (
            f"[{label_tc}] Biaya perawatan pada jarak {jarak_km} km salah. Expected: '{biaya_maint_exp}', Got: '{el_maint.text}'"
        )


# ════════════════════════════════════════════════════════════════════
#  3. PENGUJIAN PERIODE KEPEMILIKAN (BVA) & FITUR INTERAKTIF
# ════════════════════════════════════════════════════════════════════
class TestPeriodeDanFiturTambahan:
    """Menguji batas periode kepemilikan (1, 3, 5 tahun), pilihan BBM, dan rincian."""

    def test_tc11_bva_periode_kepemilikan_1_tahun(self, driver):
        """TC-11: [BVA] Batas bawah periode kepemilikan (1 Tahun)."""
        buka_tab_perawatan(driver)
        btn_period_1 = tunggu_elemen(driver, TID_BTN_PERIOD_1)
        btn_period_1.click()

        el_total = tunggu_elemen(driver, TID_VAL_TOTAL_COST)
        assert "Rp 517.933" in el_total.text

    def test_tc12_bva_periode_kepemilikan_3_tahun(self, driver):
        """TC-12: [BVA] Nilai tengah periode kepemilikan (3 Tahun)."""
        buka_tab_perawatan(driver)
        btn_period_3 = tunggu_elemen(driver, TID_BTN_PERIOD_3)
        btn_period_3.click()

        el_total = tunggu_elemen(driver, TID_VAL_TOTAL_COST)
        assert "Rp 517.933" in el_total.text

    def test_tc13_bva_periode_kepemilikan_5_tahun(self, driver):
        """TC-13: [BVA] Batas atas periode kepemilikan (5 Tahun)."""
        buka_tab_perawatan(driver)
        btn_period_5 = tunggu_elemen(driver, TID_BTN_PERIOD_5)
        btn_period_5.click()

        el_total = tunggu_elemen(driver, TID_VAL_TOTAL_COST)
        assert "Rp 517.933" in el_total.text

    def test_tc14_ep_perubahan_jenis_bbm_pertamax(self, driver):
        """TC-14: [EP] Memilih BBM Pertamax (Rp12.500) menaikkan biaya BBM bulanan."""
        buka_tab_perawatan(driver)
        pilih_bbm(driver, "Pertamax")

        # 60 km/hari * 30 hari = 1800 km / 45 km/L = 40 L * 12.500 = Rp 500.000
        el_fuel = tunggu_elemen(driver, TID_VAL_FUEL_COST)
        assert "Rp 500.000" in el_fuel.text, (
            f"BBM Pertamax salah, expected: 'Rp 500.000', got: '{el_fuel.text}'"
        )

    def test_tc15_verifikasi_rincian_komponen_dan_komparasi_ev(self, driver):
        """TC-15: Verifikasi tampilan tabel rincian servis dan badge penghematan EV (~70%)."""
        buka_tab_perawatan(driver)

        # Cek bagian rincian perawatan bulanan tampil
        section_breakdown = tunggu_elemen(driver, TID_SECTION_BREAKDOWN)
        assert section_breakdown.is_displayed()

        # Cek badge hemat EV
        badge_ev = tunggu_elemen(driver, TID_BADGE_EV_SAVINGS)
        assert "Hemat ~" in badge_ev.text
