import { hashPassword } from "../auth/security.js";
import {
  PRECOMPUTED_DEMO_USERS,
  userRepository,
} from "../storage/user-repository.js";
import type { UserAccount } from "../types/domain.js";

/**
 * Skrip seed akun demo lokal (`npm --prefix backendQ run seed:users`).
 * - Tidak menyimpan password teks biasa di dalam kode sumber maupun di dalam `backendQ/data/users.json`.
 * - Secara bawaan menulis hash kriptografis `scrypt` yang telah dikomputasi sebelumnya.
 * - Jika variabel environment opsional (`SEED_USER_PASSWORD`, `SEED_MITRA_PASSWORD`, `SEED_SUPERADMIN_PASSWORD`)
 *   disediakan saat eksekusi CLI, skrip akan menghitung hash `scrypt` baru secara dinamis dengan salt acak.
 */
const customPasswordsByRole: Partial<Record<UserAccount["role"], string>> = {
  USER: process.env.SEED_USER_PASSWORD,
  MITRA: process.env.SEED_MITRA_PASSWORD,
  SUPERADMIN: process.env.SEED_SUPERADMIN_PASSWORD,
};

const seededUsers: UserAccount[] = PRECOMPUTED_DEMO_USERS.map((preset) => {
  const customPlain = customPasswordsByRole[preset.role];
  return {
    ...preset,
    passwordHash:
      customPlain && customPlain.trim().length > 0
        ? hashPassword(customPlain.trim())
        : preset.passwordHash,
  };
});

userRepository.replaceAllUsers(seededUsers);
console.log("Berhasil menulis hash akun demo lokal ke backendQ/data/users.json");
for (const u of seededUsers) {
  console.log(`- [${u.role}] ${u.email} -> ${u.passwordHash.slice(0, 38)}...`);
}
