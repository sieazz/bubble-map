const http = require("http");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

let authorized = false;

const app = http.createServer(function (request, response) {
  var url = request.url;

  if (request.url === "/") {
    url = "/index.html";

    if (request.method === "POST") {
      // 비밀번호 체크
      if (request.headers['content-type'] === 'text/plain') {
        var body = "";
        request.on("data", function (data) {
          body = body + data.toString();
        });
        request.on("end", function () {
          var hashAlgorithm = crypto.createHash('sha512');
          var hashString = hashAlgorithm.update(body).digest('base64');
          fs.readFile("./password", (err, data) => {
            if (err) throw err;
            if (hashString === data.toString()) {
              response.writeHead(200);
              response.end("true");
              authorized = true;
              return;
            } else {
              response.writeHead(200);
              response.end("false");
              return;
            }
          })
        });
      }

      // data.json 업데이트
      if (request.headers['content-type'] === 'application/json') {
        if (authorized) {
          var body = "";
          request.on("data", function (data) {
            body = body + data;
          });
          request.on("end", function () {
            fs.writeFile("model/data.json", body, "utf8", function (err) {
              response.writeHead(200);
              response.end();
              return;
            });
          });
          authorized = false;
        }
      }
    } else {
      response.writeHead(200);
      response.end(fs.readFileSync(__dirname + url));
    }
  } else if (path.parse(request.url).dir === "/src" && path.extname(request.url) === '.js') {
    response.setHeader("Content-Type", "text/javascript");
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname + request.url));
  } else if (request.url === "/model/data.json" || request.url === "/src/style.css") {
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname + request.url));
  } else {
    response.writeHead(404);
    response.end();
  }
});

app.listen(8000);
