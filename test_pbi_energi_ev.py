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
    # Dinonaktifkan agar browser Chrome terbuka dan terlihat langsung saat kamu jalankan tes sendiri:
    # options.add_argument("--headless=new")

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
