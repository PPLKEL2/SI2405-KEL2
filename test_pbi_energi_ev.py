import os

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
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
    return WebDriverWait(driver, 10).until(
        EC.presence_of_element_located(
            (By.CSS_SELECTOR, f'[data-testid="{test_id}"]')
        )
    )


def select_ev_by_id(driver, ev_id):
    select_el = field(driver, "ev-model-select")
    Select(select_el).select_by_value(ev_id)


def enter_distance(driver, value):
    element = field(driver, "distance-input")
    driver.execute_script(
        """
        const el = arguments[0];
        const val = arguments[1];
        const setter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        """,
        element,
        str(value),
    )


def visible_text(driver, test_id):
    element = WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located(
            (By.CSS_SELECTOR, f'[data-testid="{test_id}"]')
        )
    )
    return element.text


def digits_only(text):
    """Mengubah 'Rp 290.978' menjadi '290978'."""
    return "".join(character for character in text if character.isdigit())


# ============================================================
# KEL2-109 — Form Pilihan Kendaraan EV, Jarak, dan Info Efisiensi
# ============================================================

def test_109_form_kendaraan_jarak_dan_efisiensi_tampil(driver):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    assert field(driver, "ev-model-select").is_displayed()
    assert field(driver, "ev-efficiency-info").is_displayed()
    assert field(driver, "distance-input").is_displayed()
    assert field(driver, "home-charging-slider").is_displayed()

    efficiency_text = visible_text(driver, "ev-efficiency-info")
    assert "kWh/100 km" in efficiency_text


@pytest.mark.parametrize("invalid_distance", [
    "",       # jarak kosong
    "0",      # jarak nol
    "-10",    # jarak negatif
])
def test_109_form_menolak_input_jarak_tidak_valid(driver, invalid_distance):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    enter_distance(driver, invalid_distance)

    assert visible_text(driver, "validation-message").strip() != ""


# ============================================================
# KEL2-110 — Perhitungan Kebutuhan Energi Berdasarkan Kendaraan Terpilih
# ============================================================

def test_110_menghitung_kebutuhan_kwh_berdasarkan_kendaraan_terpilih(driver):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    # Pilih Alva One XP (efisiensi 3,1 kWh/100 km) dan jarak 160 km/hari
    select_ev_by_id(driver, "ev-alva-one")
    enter_distance(driver, "160")

    efficiency_info = visible_text(driver, "ev-efficiency-info")
    assert "3,1" in efficiency_info or "3.1" in efficiency_info

    # 160 km/hari * 30 hari = 4.800 km/bulan -> 4.800 * 3,1 / 100 = 148,8 kWh/bulan
    result = visible_text(driver, "energy-result")
    assert "148,8" in result or "148.8" in result
    assert "kWh" in result

    # Biaya listrik bulanan pada charging rumah 50%: Rp 290.978/bulan
    cost_text = visible_text(driver, "electricity-cost-result")
    assert "290.978" in cost_text or "290978" in digits_only(cost_text)


def test_110_perhitungan_otomatis_berubah_saat_jarak_diubah(driver):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    select_ev_by_id(driver, "ev-alva-one")
    enter_distance(driver, "160")
    first_result = visible_text(driver, "energy-result")

    enter_distance(driver, "320")
    WebDriverWait(driver, 5).until(
        lambda d: visible_text(d, "energy-result") != first_result
    )
    second_result = visible_text(driver, "energy-result")

    # 320 km/hari * 30 hari * 3,1 / 100 = 297,6 kWh/bulan
    assert "148,8" in first_result or "148.8" in first_result
    assert "297,6" in second_result or "297.6" in second_result
    assert first_result != second_result


# ============================================================
# KEL2-111 — Menampilkan Hasil Simulasi Bulanan & Validasi Input
# ============================================================

def test_111_hasil_menampilkan_satuan_kwh_bulanan_dan_harian(driver):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    select_ev_by_id(driver, "ev-alva-one")
    enter_distance(driver, "160")

    result = visible_text(driver, "energy-result")
    assert "kWh" in result
    assert "/bulan" in result
    assert "kWh/hari" in result


def test_111_input_invalid_menampilkan_validasi(driver):
    driver.get(f"{BASE_URL}/kalkulator/energi-ev")

    enter_distance(driver, "")

    message = visible_text(driver, "validation-message")
    assert message.strip() != ""
