import express from "express";
import { registryService } from "./registry";

const app = express();

app.use(registryService);

app.get("/health", (_req, res) => {
  res.status(200).send("Ok");
});

console.log("Listening for requests...");
app.listen(8080);
