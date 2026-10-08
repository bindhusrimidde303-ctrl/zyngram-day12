const http = require("http");

const data = JSON.stringify({
    message: "What is Zyngram?"
});

const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/zynora/chat",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
    }
};

const request = http.request(options, (response) => {
    let body = "";

    response.on("data", (chunk) => {
        body += chunk;
    });

    response.on("end", () => {
        console.log("STATUS:", response.statusCode);
        console.log("RESPONSE:");
        console.log(body);
    });
});

request.on("error", (error) => {
    console.error("REQUEST ERROR:", error.message);
});

request.write(data);
request.end();