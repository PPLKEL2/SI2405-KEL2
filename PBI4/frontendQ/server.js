// Frontend statis tanpa dependensi (Node >= 18): npm start -> http://localhost:3001
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3001;
const INDEX = path.join(__dirname, "public", "index.html");

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (req.method !== "GET" || (pathname !== "/" && pathname !== "/index.html")) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }

  fs.readFile(INDEX, (error, html) => {
    if (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Frontend gagal dimuat");
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  });
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`Frontend PBI4 berjalan di http://localhost:${PORT}`));
}

module.exports = server;
