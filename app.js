var http = require("http");
var fs = require("fs");
var app = http.createServer(function (request, response) {
  var url = request.url;
  if (request.url === "/") {
    url = "/index.html";

    // data.json 업데이트
    if (request.method === "POST") {
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
    }
  }
  if (request.url === "/favicon.ico") {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200);
  response.end(fs.readFileSync(__dirname + url));
});
app.listen(8000);
