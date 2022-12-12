import * as http from "node:http";
import * as path from "node:path";
import { consumeJobsHandler } from "../lambda/consumer-handler";
import { produceJobsHandler } from "../lambda/producer-handler";

const PORT = 8001;

http
  .createServer(async (req, res) => {
    const { url } = req;
    const body = [];
    req
      .on("error", (err) => {
        console.error(err);
      })
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", async () => {
        const resultBody = Buffer.concat(body).toString();
        JSON.parse(resultBody);
        if (req.url?.includes("consume")) {
          const response = await consumeJobsHandler(
            { body: resultBody } as any,
            {} as any,
            () => undefined
          );
          const statusCode = typeof response === "string" ? 200 : 400;
          const mimeType = "application/json";
          res.writeHead(statusCode, { "Content-Type": mimeType });
          res.write(JSON.stringify(response));
          res.end();
          console.log(`${req.method} ${req.url} ${statusCode}`);
        } else {
          const response = await produceJobsHandler(
            { body: resultBody } as any,
            {} as any,
            () => undefined
          );
          const statusCode = typeof response === "string" ? 200 : 400;
          const mimeType = "application/json";
          res.writeHead(statusCode, { "Content-Type": mimeType });
          res.write(JSON.stringify(response));
          res.end();
          console.log(`${req.method} ${req.url} ${statusCode}`);
        }
        console.log(resultBody);
      });
  })
  .listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);
