import express from "express";
import { Request, Response } from "express-serve-static-core";
import path from "path";
import bodyParser from "body-parser";

import { SummitService } from "./summit-service";

const app = express();
const port = process.env.PORT || 8080;

const allowedExt = [
    ".js",
    ".ico",
    ".css",
    ".png",
    ".jpg",
    ".woff2",
    ".woff",
    ".ttf",
    ".svg",
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.all("/*", (req: Request, res: Response, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
    next();
})

app.get("/api/allSummits", (req: Request, res: Response) => {
    const allSummits = new SummitService()
        .getAllSummits();

    res.json(allSummits);
});

app.get("*", (req: Request, res: Response) => {
    if (allowedExt.filter((ext) => req.url.indexOf(ext) > 0).length > 0) {
      res.sendFile(path.resolve(`./webapp/summit-map/dist/summit-map/${req.url}`));
    } else {
      res.sendFile(path.resolve("./webapp/summit-map/dist/summit-map/index.html"));
    }
});

app.post("/api/update", (req: Request, res: Response) => {
    const summitService = new SummitService();
    summitService.addOrUpdateSummit(req.body);
    res.end();
});

app.post("api/remove", (req: Request, res: Response) => {
    const summitService = new SummitService();
    summitService.removeSummit(req.body);
    res.end();
});

app.listen(
    port, () => console.log(`Listening on port ${port}`)
);
