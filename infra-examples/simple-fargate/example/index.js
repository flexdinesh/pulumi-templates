const http = require("node:http");
const hostname = "0.0.0.0";
const port = 80;

const server = http.createServer((req, res) => {
  if (req.url == "/") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("Hello World\n");
  } else if (req.url == "/health") {
    res.setHeader("Content-Type", "application/json");
    res.write(
      JSON.stringify({
        health: "ok",
      })
    );
    res.end();
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});
