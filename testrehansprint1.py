import os

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    # Hapus baris berikut kalau mau browser terlihat saat tes berjalan.
    options.add_argument("--headless=new")

    browser = webdriver.Chrome(options=options)
    browser.set_window_size(1440, 1000)
    yield browser
    browser.quit()


def field(driver, test_id):
    return driver.find_element(By.CSS_SELECTOR, f'[data-testid="{test_id}"]')


def enter(driver, test_id, value):
    element = field(driver, test_id)
    element.clear()
    if value != "":
        element.send_keys(str(value))


def calculate(driver):
    field(driver, "calculate-button").click()


def visible_text(driver, test_id):
    element = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, f'[data-testid="{test_id}"]')
        )
    )
    return element.text


def digits_only(text):
    """Mengubah 'Rp 1.500.000' menjadi '1500000'."""
    return "".join(character for character in text if character.isdigit())


# ============================================================
# KEL2-109 — Membuat Form Input Jarak Perjalanan dan Efisiensi
# ============================================================

def test_109_form_jarak_dan_konsumsi_tampil(driver):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    assert field(driver, "distance-input").is_displayed()
    assert field(driver, "consumption-input").is_displayed()
    assert field(driver, "calculate-button").is_displayed()


@pytest.mark.parametrize("distance,consumption", [
    ("", "15"),       # jarak kosong
    ("0", "15"),      # jarak nol
    ("-10", "15"),    # jarak negatif
    ("250", ""),      # konsumsi kosong
    ("250", "0"),     # konsumsi nol
    ("250", "-5"),    # konsumsi negatif
])
def test_109_form_menolak_input_tidak_valid(driver, distance, consumption):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    enter(driver, "distance-input", distance)
    enter(driver, "consumption-input", consumption)
    calculate(driver)

    assert visible_text(driver, "validation-message").strip() != ""


# ============================================================
# KEL2-110 — Mengimplementasikan Perhitungan Kebutuhan Energi
# ============================================================

def test_110_menghitung_kebutuhan_kwh(driver):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    enter(driver, "distance-input", "250")
    enter(driver, "consumption-input", "15")
    calculate(driver)

    result = visible_text(driver, "energy-result")
    # 250 km × 15 kWh/100 km = 37,5 kWh
    assert "37,5" in result or "37.5" in result
    assert "kWh" in result


def test_110_perhitungan_berubah_saat_jarak_diubah(driver):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    enter(driver, "distance-input", "250")
    enter(driver, "consumption-input", "15")
    calculate(driver)
    first_result = visible_text(driver, "energy-result")

    enter(driver, "distance-input", "500")
    calculate(driver)
    second_result = visible_text(driver, "energy-result")

    assert "37,5" in first_result or "37.5" in first_result
    assert "75" in second_result
    assert first_result != second_result


# ============================================================
# KEL2-111 — Menampilkan Hasil Simulasi dan Menguji Validasi
# ============================================================

def test_111_hasil_menampilkan_satuan_kwh(driver):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    enter(driver, "distance-input", "250")
    enter(driver, "consumption-input", "15")
    calculate(driver)

    result = visible_text(driver, "energy-result")
    assert result.strip() != ""
    assert "kWh" in result


def test_111_input_invalid_menampilkan_validasi(driver):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    enter(driver, "distance-input", "")
    enter(driver, "consumption-input", "15")
    calculate(driver)

    message = visible_text(driver, "validation-message")
    assert message.strip() != ""


# ============================================================
# KEL2-112 — Membuat Form Input Parameter Kedua Kendaraan
# ============================================================

def test_112_form_parameter_bbm_dan_ev_tampil(driver):
    driver.get(f"{BASE_URL}/kalkulator/komparasi-biaya")

    required_fields = [
        "distance-input",
        "bbm-efficiency-input",
        "bbm-price-input",
        "ev-consumption-input",
        "home-tariff-input",
    ]

    for test_id in required_fields:
        assert field(driver, test_id).is_displayed()


@pytest.mark.parametrize("test_id,value", [
    ("distance-input", ""),
    ("bbm-efficiency-input", "0"),
    ("bbm-price-input", "-1000"),
    ("ev-consumption-input", ""),
    ("home-tariff-input", "0"),
])
def test_112_form_menolak_parameter_tidak_valid(driver, test_id, value):
    driver.get(f"{BASE_URL}/kalkulator/komparasi-biaya")

    enter(driver, "distance-input", "60")
    enter(driver, "bbm-efficiency-input", "12")
    enter(driver, "bbm-price-input", "10000")
    enter(driver, "ev-consumption-input", "15")
    enter(driver, "home-tariff-input", "1444.7")

    # Ganti parameter yang diuji dengan nilai tidak valid.
    enter(driver, test_id, value)
    calculate(driver)

    assert visible_text(driver, "validation-message").strip() != ""


# ============================================================
# KEL2-113 — Mengimplementasikan Perhitungan Biaya Energi
# ============================================================

def isi_parameter_perbandingan(driver, distance="60", bbm_price="10000"):
    enter(driver, "distance-input", distance)
    enter(driver, "bbm-efficiency-input", "12")
    enter(driver, "bbm-price-input", bbm_price)
    enter(driver, "ev-consumption-input", "15")
    enter(driver, "home-tariff-input", "1444.7")

    # Jika UI punya input persentase charging rumah, set 100%.
    # Hapus bagian ini jika komponen tersebut tidak ada.
    home_share = driver.find_elements(
        By.CSS_SELECTOR, '[data-testid="home-charging-share-input"]'
    )
    if home_share:
        enter(driver, "home-charging-share-input", "100")


def test_113_menghitung_biaya_bbm_dan_ev_bulanan(driver):
    driver.get(f"{BASE_URL}/kalkulator/komparasi-biaya")
    isi_parameter_perbandingan(driver)
    calculate(driver)

    bbm_cost = visible_text(driver, "bbm-monthly-cost")
    ev_cost = visible_text(driver, "ev-monthly-cost")

    # Periode: 30 hari
    # BBM: (60 × 30 ÷ 12) × 10.000 = Rp1.500.000
    # EV: (60 × 30 × 15 ÷ 100) × 1.444,7 = Rp390.069
    assert digits_only(bbm_cost) == "1500000"
    assert digits_only(ev_cost) == "390069"


def test_113_perubahan_harga_bbm_hanya_mengubah_biaya_bbm(driver):
    driver.get(f"{BASE_URL}/kalkulator/komparasi-biaya")

    isi_parameter_perbandingan(driver, bbm_price="10000")
    calculate(driver)
    bbm_before = visible_text(driver, "bbm-monthly-cost")
    ev_before = visible_text(driver, "ev-monthly-cost")

    enter(driver, "bbm-price-input", "12000")
    calculate(driver)
    bbm_after = visible_text(driver, "bbm-monthly-cost")
    ev_after = visible_text(driver, "ev-monthly-cost")

    assert bbm_before != bbm_after
    assert ev_before == ev_after


# ============================================================
# KEL2-114 — Menampilkan Perbandingan dan Persentase Penghematan
# ============================================================

def test_114_menampilkan_selisih_dan_persentase_penghematan(driver):
    driver.get(f"{BASE_URL}/kalkulator/komparasi-biaya")
    isi_parameter_perbandingan(driver)
    calculate(driver)

    savings = visible_text(driver, "monthly-savings")
    percentage = visible_text(driver, "savings-percentage")

    # Rp1.500.000 - Rp390.069 = Rp1.109.931
    assert digits_only(savings) == "1109931"
    assert "74" in percentage


def test_114_hasil_perbandingan_diperbarui_setelah_jarak_diubah(driver):
    driver.get(f"{BASE_URL}/kalkulator/komparasi-biaya")
    isi_parameter_perbandingan(driver, distance="60")
    calculate(driver)

    bbm_before = visible_text(driver, "bbm-monthly-cost")
    ev_before = visible_text(driver, "ev-monthly-cost")
    savings_before = visible_text(driver, "monthly-savings")

    enter(driver, "distance-input", "120")
    calculate(driver)

    assert visible_text(driver, "bbm-monthly-cost") != bbm_before
    assert visible_text(driver, "ev-monthly-cost") != ev_before
    assert visible_text(driver, "monthly-savings") != savings_before