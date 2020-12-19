import express, { RequestHandler } from "express";
import { Request, Response } from "express-serve-static-core";
import path from "path";
import bodyParser from "body-parser";
import request from "request-promise";
import cors from "cors";
import { OAuth2Client } from "google-auth-library";
import cookieParser from "cookie-parser";

import { SummitService } from "./summit-service";
import { config } from './config';
import { SummitUser } from "./summit_user";
import { RedisClientFactory } from "./redis_client";
import { UserService } from "./user_service";
import { AuthClientFactory } from "./auth";

const allowedOrigins = ['https://www.geo-frame.com', 'http://localhost:8080'];

const app = express();
app.use(cors(
    {
        credentials: true,
        origin: (origin, next) => {
            if (!origin) {
                return next(null, true);
            }

            if (allowedOrigins.indexOf(origin) === -1) {
                return next(new Error(`Not an allowed origin: ${origin}`), false);
            }

            return next(null, true);
        }
    }));
app.use(cookieParser());
const port = process.env.PORT || 8080;

const redisClientFactory = new RedisClientFactory();
const summitService = new SummitService(redisClientFactory);
const userService = new UserService(redisClientFactory);
const authClientFactory = new AuthClientFactory();

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
app.use(bodyParser.urlencoded({ extended: true }));

/*
app.all("/*", (req: Request, res: Response, next) => {
    res.header("Access-Control-Allow-Origin", "https://geo-frame.com");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Content-Length");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});
*/

app.get('/auth/google/callback', async (req: Request, res: Response) => {
    console.log("callback hit");

    const code = req.query.code;
    console.log(`Code: ${code}`);

    const resp = await authClientFactory.create().getToken(code);
    const userId = await verifyIdToken(resp.tokens.id_token);
    console.log(`Refresh token: ${resp.tokens.refresh_token}`);
    console.log(`Access token: ${resp.tokens.access_token}`);

    const user = new SummitUser(
        resp.tokens.refresh_token,
        resp.tokens.access_token,
        userId
    );

    console.log(`UserId: ${user.id}`);

    const existingUser = await userService.getUser(userId);
    if (!existingUser) {
        await userService.setUser(user);
    }

    res.cookie('summitId', resp.tokens.id_token);
    res.redirect('/');
});

app.get('/login', async (req: Request, res: Response) => {
    res.redirect(authClientFactory.getAuthUrl());
});

app.use('/api/*', async (req: Request, res: Response, next) => {
    const token = getTokenFromHeader(req);
    console.log(`Cookie token: ${token}`);
    if (token) {
        try {
            const verifiedUserId = await verifyIdToken(token);
            console.log(`Verified userId: ${verifiedUserId}`);
            if (!verifiedUserId) {
                res.status(401);
            }
            const user = await userService.getUser(verifiedUserId);
            console.log(`Found user in DB: ${user.id}`);
            req.user = user;
            next();
        } catch(err) {
            console.log(err);
            res.status(401);
        }
    } else {
        res.status(401);
    }
});


app.get("/api/allSummits", async (req: Request, res: Response) => {
    try {
        console.log("Calling allSummits");
        const allSummits = await summitService.getAllSummits();

        res.json(allSummits);
    } catch (err) {
        console.log(err);
    }
});

app.post("/api/update", async (req: Request, res: Response) => {
    await summitService.addOrUpdateSummit(req.body);
    res.end();
});

app.post("/api/remove", async (req: Request, res: Response) => {
    await summitService.removeSummit(req.body);
    res.end();
});

app.post("/api/photos", async (req: Request, res: Response) => {
    const albumId = req.body.albumId;
    console.log("Calling photos");
    console.log(`Token: ${req.user.access_token}`);
    const data = await getPhotosFromAlbum(req.user, albumId);

    if (data.error) {
        res.status(data.error.code || 500).send(data.error);
    } else {
        res.status(200).send(data.photos);
    }
});

app.post("/api/mediaItem", async (req: Request, res: Response) => {
    const mediaItemId = req.body.mediaItemId;
    const data = await getMediaItem(req.user, mediaItemId);
    res.status(200).send(data);
})

app.get("/api/albums", async (req: Request, res: Response) => {
    console.log("Calling albums");
    console.log(`User: ${JSON.stringify(req.user)}`);
    console.log(`Token: ${req.user.access_token}`);

    const data = await libraryApiGetAlbums(req.user);

    if (data.error) {
        res.status(data.error.code || 500).send(data.error);
    } else {
        res.status(200).send(data.albums);
    }
})

app.get("*", (req: Request, res: Response) => {
    console.log(`fetching ${req.url}`);
    if (allowedExt.filter((ext) => req.url.indexOf(ext) > 0).length > 0) {
        res.sendFile(path.resolve(`./webapp/summit-map/dist/summit-map/${req.url}`));
    } else {
        res.sendFile(path.resolve("./webapp/summit-map/dist/summit-map/index.html"));
    }
});

async function verifyIdToken(idToken): Promise<string> {
    if (idToken) {
        console.log("verifying id token");
        const ticket = await authClientFactory.create().verifyIdToken({
            idToken: idToken,
            audience: config.oAuthClientId
        });

        return ticket.getUserId();
    } else {
        console.log("token not valid");
        return null;
    }
}

function getTokenFromHeader(req: Request): string {
    console.log(`Headers: ${req.headers}`);
    console.log(`Cookie: ${req.cookies.summitId}`);
    console.log(`Auth header: ${req.headers.authorization}`);
    const authHeader = req.headers.authorization;
    return authHeader ? authHeader.split(' ')[1] : null;
}

async function getPhotosFromAlbum(user: SummitUser, albumId: string) {
    let photos = [];
    let error = null;
    let parameters = {
        pageSize: 50,
        pageToken: null
    };

    const searchTerm = {
        albumId: albumId
    };

    try {
        // Loop while there is a nextpageToken property in the response until all
        // albums have been listed.
        do {
            const client = authClientFactory.create(user);
            const result: any = (await client.request({
                url: config.apiEndpoint + '/v1/mediaItems:search',
                params: parameters,
                body: searchTerm,
                method: 'POST'
            })).data;

            if (result && result.mediaItems) {
                // Parse albums and add them to the list, skipping empty entries.
                const items = result.mediaItems.filter(x => !!x);

                photos = photos.concat(items);
            }
            parameters.pageToken = result.nextPageToken;
            // Loop until all albums have been listed and no new nextPageToken is
            // returned.
        } while (parameters.pageToken != null);

    } catch (err) {
        console.log(err);
    }

    return { photos, error };
}

async function getMediaItem(user: SummitUser, mediaItemId: string) {
    const client = authClientFactory.create(user);
    const result = await client.request({
        url: `${config.apiEndpoint}/v1/mediaItems/${mediaItemId}`,
        method: 'GET'
    });
    return result.data;
}

// Returns a list of all albums owner by the logged in user from the Library
// API.
async function libraryApiGetAlbums(user: SummitUser) {
    let albums = [];
    let nextPageToken = null;
    let error = null;
    let parameters = {
        pageSize: 50,
        pageToken: null
    };

    try {
        // Loop while there is a nextpageToken property in the response until all
        // albums have been listed.
        do {
            const client = authClientFactory.create(user);
            const result: any = (await client.request({
                url: config.apiEndpoint + '/v1/albums',
                method: 'GET',
                params: parameters
            })).data;

            if (result && result.albums) {
                // Parse albums and add them to the list, skipping empty entries.
                const items = result.albums.filter(x => !!x);

                albums = albums.concat(items);
            }
            parameters.pageToken = result.nextPageToken;
            // Loop until all albums have been listed and no new nextPageToken is
            // returned.
        } while (parameters.pageToken != null);

    } catch (err) {
        console.log(err);
    }

    return { albums, error };
}

app.listen(
    port, () => console.log(`Listening on port ${port}`)
);
