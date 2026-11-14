import { spawn } from "node:child_process";

const procs = [
  spawn("npm", ["--prefix", "backendQ", "run", "dev"], { stdio: "inherit", shell: true }),
  spawn("npm", ["--prefix", "frontendQ", "run", "dev"], { stdio: "inherit", shell: true }),
];

const cleanup = () => {
  for (const p of procs) {
    if (!p.killed) p.kill();
  }
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

