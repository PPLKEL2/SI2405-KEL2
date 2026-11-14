import subprocess
import sys
import time
import traceback
import urllib.request
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backendQ"
FRONTEND_DIR = ROOT_DIR / "frontendQ"

FRONTEND_URL = "http://localhost:3000"
BACKEND_HEALTH_URL = "http://localhost:4000/api/v1/health"


def is_url_up(url: str) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=2) as resp:
            return resp.status == 200
    except Exception:
        return False


def wait_for_url(url: str, timeout_sec: int = 30) -> None:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        if is_url_up(url):
            return
        time.sleep(0.5)
    raise RuntimeError(f"Layanan di {url} tidak merespons dalam {timeout_sec} detik.")


def create_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1440,900")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    return webdriver.Chrome(options=opts)


def fill_react_input(driver, element, value: str):
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


def login_with_demo_button(driver, wait, btn_testid: str, expected_email: str, password: str, expect_error: bool = False):
    for attempt in range(4):
        time.sleep(0.5)
        email_el = wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="login-email"]'))
        )
        pass_el = wait.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="login-password"]'))
        )

        # Klik tombol demo peran
        btn = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, f'[data-testid="{btn_testid}"]'))
        )
        driver.execute_script("arguments[0].click();", btn)
        time.sleep(0.2)

        # Pastikan nilai email dan password terisi ke state React
        fill_react_input(driver, email_el, expected_email)
        fill_react_input(driver, pass_el, password)
        time.sleep(0.2)

        submit_el = wait.until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="login-submit"]'))
        )
        driver.execute_script("arguments[0].click();", submit_el)

        # Tunggu hasil login
        deadline = time.time() + 5.0
        while time.time() < deadline:
            if "/login" not in driver.current_url:
                return
            if expect_error:
                err_els = driver.find_elements(By.CSS_SELECTOR, '[data-testid="login-error"]')
                if err_els and err_els[0].is_displayed() and "sandi" in err_els[0].text.lower():
                    return
            time.sleep(0.25)


def run_e2e_suite():
    procs = []
    try:
        if not is_url_up(BACKEND_HEALTH_URL):
            print("[Init] Menjalankan server backendQ (port 4000)...")
            backend_proc = subprocess.Popen(
                ["node", "dist/index.js"],
                cwd=str(BACKEND_DIR),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            procs.append(backend_proc)
            wait_for_url(BACKEND_HEALTH_URL, 20)

        if not is_url_up(f"{FRONTEND_URL}/login"):
            print("[Init] Menjalankan server frontendQ (port 3000)...")
            next_bin = FRONTEND_DIR / "node_modules" / "next" / "dist" / "bin" / "next"
            frontend_proc = subprocess.Popen(
                ["node", str(next_bin), "start", "-p", "3000"],
                cwd=str(FRONTEND_DIR),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
            procs.append(frontend_proc)
            wait_for_url(f"{FRONTEND_URL}/login", 30)

        print("[1/8] Server backend (4000) & frontend (3000) aktif.")
        driver = create_driver()
        wait = WebDriverWait(driver, 15)

        try:
            # 1. Akses Pengunjung (Guest) tanpa login ke seluruh modul umum
            print("[2/8] Menguji akses PENGUNJUNG (GUEST): Membuka landing page & seluruh modul umum tanpa login...")
            driver.get(f"{FRONTEND_URL}/")
            wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
            assert "mobilitiq" in driver.page_source.lower() or "listrik" in driver.page_source.lower()

            # PBI 01: Kalkulator Biaya BBM (Guest)
            driver.get(f"{FRONTEND_URL}/kalkulator/bbm")
            wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="fuel-monthly-cost"]')))
            assert "/login" not in driver.current_url, f"Guest tidak boleh diarahkan ke /login: {driver.current_url}"
            monthly_cost = driver.find_element(By.CSS_SELECTOR, '[data-testid="fuel-monthly-cost"]')
            assert "rp" in monthly_cost.text.lower(), f"Biaya bulanan BBM guest: {monthly_cost.text}"

            # PBI 02: Kalkulator Perawatan ICE (Guest)
            driver.get(f"{FRONTEND_URL}/kalkulator/perawatan")
            wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
            assert "/login" not in driver.current_url
            h1_pbi02 = driver.find_element(By.TAG_NAME, "h1").text.lower()
            assert "perawatan" in h1_pbi02, f"H1 PBI 02: {h1_pbi02}"

            # PBI 04: Katalog EV (Guest)
            driver.get(f"{FRONTEND_URL}/katalog")
            wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
            assert "/login" not in driver.current_url
            h1_pbi04 = driver.find_element(By.TAG_NAME, "h1").text.lower()
            assert "katalog" in h1_pbi04 or "kendaraan listrik" in h1_pbi04, f"H1 PBI 04: {h1_pbi04}"

            # PBI 07: Simulator Konsumsi Energi EV (Guest)
            driver.get(f"{FRONTEND_URL}/kalkulator/energi-ev")
            wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
            assert "/login" not in driver.current_url
            h1_pbi07 = driver.find_element(By.TAG_NAME, "h1").text.lower()
            assert "energi" in h1_pbi07, f"H1 PBI 07: {h1_pbi07}"

            # PBI 08: Komparasi Biaya BBM vs Listrik (Guest)
            driver.get(f"{FRONTEND_URL}/kalkulator/komparasi-biaya")
            wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
            assert "/login" not in driver.current_url
            h1_pbi08 = driver.find_element(By.TAG_NAME, "h1").text.lower()
            assert "komparasi" in h1_pbi08 or "bbm" in h1_pbi08 or "operasional" in h1_pbi08, f"H1 PBI 08: {h1_pbi08}"

            # PBI 11 & PBI 12: Peta Fasilitas & Kalkulator Rute (Guest)
            driver.get(f"{FRONTEND_URL}/fasilitas/peta")
            wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
            assert "/login" not in driver.current_url
            calc_route_btn = wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="calculate-route-btn"]'))
            )
            time.sleep(0.8)
            calc_route_btn.click()
            route_panel = wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="route-result-panel"]'))
            )
            assert "km" in route_panel.text.lower() or "menit" in route_panel.text.lower(), f"Route panel: {route_panel.text}"

            # 2. Proteksi Halaman Manajemen: Guest diarahkan ke /login saat membuka /mitra atau /admin
            print("[3/8] Menguji proteksi halaman manajemen Mitra & Superadmin bagi pengunjung (Guest diarahkan ke /login)...")
            driver.get(f"{FRONTEND_URL}/mitra/katalog")
            wait.until(EC.url_contains("/login"))
            assert "/login" in driver.current_url, f"Harus dialihkan ke /login: {driver.current_url}"

            driver.get(f"{FRONTEND_URL}/admin/tarif-energi")
            wait.until(EC.url_contains("/login"))
            assert "/login" in driver.current_url, f"Harus dialihkan ke /login: {driver.current_url}"

            # 3. Login gagal dengan kredensial salah
            print("[4/8] Menguji pesan kesalahan saat login dengan password salah...")
            driver.get(f"{FRONTEND_URL}/login")
            login_with_demo_button(
                driver, wait, "demo-user-btn", "pengguna@mobilitiq.id", "PasswordSalah999!", expect_error=True
            )
            err_box = wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="login-error"]'))
            )
            assert "email atau kata sandi" in err_box.text.lower(), f"Error box: {err_box.text}"

            # 4. Login berhasil sebagai USER & uji penolakan akses lintas role
            print("[5/8] Menguji login akun demo USER & penolakan akses lintas peran (USER membuka /admin/tarif-energi -> 403)...")
            login_with_demo_button(
                driver, wait, "demo-user-btn", "pengguna@mobilitiq.id", "Pengguna123!"
            )
            wait.until(EC.url_contains("/kalkulator/bbm"))

            driver.get(f"{FRONTEND_URL}/admin/tarif-energi")
            forbidden_box = wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="forbidden-alert"]'))
            )
            assert "akses tidak diizinkan" in forbidden_box.text.lower() or "tidak memiliki izin" in forbidden_box.text.lower(), f"Forbidden box: {forbidden_box.text}"

            # Logout dari USER
            logout_btn = wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="logout-button"]'))
            )
            driver.execute_script("arguments[0].click();", logout_btn)
            wait.until(EC.url_contains("/login"))

            # 5. Login sebagai ADMIN MITRA -> kelola katalog, fasilitas, tarif
            print("[6/8] Menguji login akun demo ADMIN MITRA (MITRA) & PBI 03, 05, 06...")
            login_with_demo_button(
                driver, wait, "demo-mitra-btn", "mitra@mobilitiq.id", "Mitra123!"
            )
            wait.until(EC.url_contains("/mitra/katalog"))
            wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="ev-form-submit"]'))
            )

            driver.get(f"{FRONTEND_URL}/mitra/fasilitas")
            wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="facility-form-submit"]'))
            )

            driver.get(f"{FRONTEND_URL}/mitra/harga-layanan")
            wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="service-tariff-submit"]'))
            )

            # Logout dari MITRA
            logout_btn = wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="logout-button"]'))
            )
            driver.execute_script("arguments[0].click();", logout_btn)
            wait.until(EC.url_contains("/login"))

            # 6. Login sebagai SUPERADMIN -> kelola tarif energi & insentif
            print("[7/8] Menguji login akun demo SUPERADMIN & PBI 09, 10...")
            login_with_demo_button(
                driver, wait, "demo-superadmin-btn", "superadmin@mobilitiq.id", "Superadmin123!"
            )
            wait.until(EC.url_contains("/admin/tarif-energi"))
            wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="tariff-history-table"]'))
            )

            driver.get(f"{FRONTEND_URL}/admin/insentif-pajak")
            wait.until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="incentive-form-submit"]'))
            )

            # 7. Logout dari SUPERADMIN & verifikasi kembali ke akses publik
            print("[8/8] Menguji logout Superadmin & kembali ke navigasi publik...")
            logout_btn = wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-testid="logout-button"]'))
            )
            driver.execute_script("arguments[0].click();", logout_btn)
            wait.until(EC.url_contains("/login"))

            driver.get(f"{FRONTEND_URL}/kalkulator/komparasi-biaya")
            wait.until(EC.visibility_of_element_located((By.TAG_NAME, "h1")))
            assert "/login" not in driver.current_url

            print("SELURUH TES E2E SELENIUM (GUEST ACCESS, LOGIN, RBAC, PBI 01-12) LULUS DENGAN SUKSES!")

            print("SELURUH TES E2E SELENIUM (LOGIN, RBAC, PBI 01-12) LULUS DENGAN SUKSES!")
        except Exception:
            print(f"[DEBUG] Current URL saat gagal: {driver.current_url}", file=sys.stderr)
            try:
                body_txt = driver.find_element(By.TAG_NAME, "body").text
                print(f"[DEBUG] Body text saat gagal:\n{body_txt}", file=sys.stderr)
            except Exception:
                pass
            raise
        finally:
            driver.quit()
    finally:
        for p in procs:
            try:
                p.terminate()
                p.wait(timeout=5)
            except Exception:
                try:
                    p.kill()
                except Exception:
                    pass


if __name__ == "__main__":
    try:
        run_e2e_suite()
    except Exception as exc:
        traceback.print_exc()
        print(f"TES E2E GAGAL: {exc}", file=sys.stderr)
        sys.exit(1)
