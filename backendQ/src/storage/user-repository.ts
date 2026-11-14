import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { UserAccount } from "../types/domain.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, "../../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Precomputed scrypt hashes (scrypt$<salt>$<derivedKeyHex>) untuk akun demo lokal.
// Tidak ada password teks biasa yang disimpan di kode sumber maupun file JSON.
export const PRECOMPUTED_DEMO_USERS: UserAccount[] = [
  {
    id: "usr-pengguna-01",
    email: "pengguna@mobilitiq.id",
    name: "Pengguna MobilitiQ",
    role: "USER",
    city: "Jakarta",
    homePowerVa: 2200,
    passwordHash:
      "scrypt$a1b2c3d4e5f60718293a4b5c6d7e8f90$874bb129cd866bf649a2730cf19d676e1db57dbbd3d78735d576e2914251b1bbcaa33631a0f9b4a60cf105e5a4fabd3ec93c0342426ce3fd64ccad6782f19ca0",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr-mitra-01",
    email: "mitra@mobilitiq.id",
    name: "Admin Mitra Ekosistem EV",
    role: "MITRA",
    organizationName: "Nusantara EV Hub & Dealership",
    city: "Jakarta",
    passwordHash:
      "scrypt$b2c3d4e5f60718293a4b5c6d7e8f90a1$6d9c6fad29e060d54c5586aff8b10316173ddbd9804943cd16c59ab44809cec4234266db1562628261a8bf57d1bd2f010ce42f2ce5003917c8bcedc4b2435e36",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr-superadmin-01",
    email: "superadmin@mobilitiq.id",
    name: "Superadmin Regulasi Energi",
    role: "SUPERADMIN",
    organizationName: "Tata Kelola Platform MobilitiQ",
    city: "Jakarta",
    passwordHash:
      "scrypt$c3d4e5f60718293a4b5c6d7e8f90a1b2$bf507ac48b7cc9d535d12466c6dcd38f34f9de2a93b0fb0e0f836e8da15e3453631e1bb1d8147d71f9d7aa9f130dbad274110ac696eec1e647a5b939239b0a9c",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

class UserRepository {
  private users: UserAccount[] = [];
  private initialized = false;

  private ensureInitialized(): void {
    if (this.initialized) return;
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(USERS_FILE)) {
      try {
        const raw = fs.readFileSync(USERS_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.users = parsed;
          this.initialized = true;
          return;
        }
      } catch {
        // Fallback ke default seed jika korup
      }
    }
    this.users = PRECOMPUTED_DEMO_USERS.map((u) => ({ ...u }));
    this.saveToFile();
    this.initialized = true;
  }

  private saveToFile(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), "utf-8");
  }

  public getAllUsers(): UserAccount[] {
    this.ensureInitialized();
    return [...this.users];
  }

  public findByEmail(email: string): UserAccount | undefined {
    this.ensureInitialized();
    const normalized = email.trim().toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === normalized);
  }

  public findById(id: string): UserAccount | undefined {
    this.ensureInitialized();
    return this.users.find((u) => u.id === id);
  }

  public replaceAllUsers(users: UserAccount[]): void {
    this.users = users.map((u) => ({ ...u }));
    this.initialized = true;
    this.saveToFile();
  }
}

export const userRepository = new UserRepository();
