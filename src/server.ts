import express from "express";
import { registryService } from "./registry";

const app = express();

app.use(registryService);

console.log("Listening for requests...");
app.listen(8080);
