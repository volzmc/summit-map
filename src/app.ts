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

const app = express();
app.use(cors())
app.use(cookieParser());
const port = process.env.PORT || 8080;

const redisClientFactory = new RedisClientFactory();
const summitService = new SummitService(redisClientFactory);
const userService = new UserService(redisClientFactory);

const authClient = new OAuth2Client(
    config.oAuthClientId,
    config.oAuthClientSecret,
    config.oAuthCallbackUrl
    );

function getAuthenticatedClient(): string {
    const oauthClient = new OAuth2Client(
        config.oAuthClientId,
        config.oAuthClientSecret,
        config.oAuthCallbackUrl
    );

    const authURl = oauthClient.generateAuthUrl({
        access_type: 'offline',
        scope: config.scopes.join(' ')
    });
    return authURl;
}

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

app.all("/*", (req: Request, res: Response, next) => {
    res.header("Access-Control-Allow-Origin", "https://geo-frame.com");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Content-Length");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.get('/auth/google/callback', async (req: Request, res: Response) => {
    console.log("callback hit");

    const code = req.query.code;
    console.log(`Code: ${code}`);

    const resp = await authClient.getToken(code);
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
    res.redirect(getAuthenticatedClient());
});

app.use('/api/*', async (req: Request, res: Response, next) => {
    const token = getTokenFromHeader(req);
    console.log(`Cookie token: ${token}`);
    if (token) {
        const verifiedUserId = await verifyIdToken(token);
        console.log(`Verified userId: ${verifiedUserId}`);
        if (!verifiedUserId) {
            res.status(401);
        }
        const user = await userService.getUser(verifiedUserId);
        console.log(`Found user in DB: ${user.id}`);
        req.user = user;
        next();
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
    const data = await getPhotosFromAlbum(req.user.token, albumId);

    if (data.error) {
        res.status(data.error.code || 500).send(data.error);
    } else {
        res.status(200).send(data.photos);
    }
});

app.post("/api/mediaItem", async (req: Request, res: Response) => {
    const mediaItemId = req.body.mediaItemId;
    const data = await getMediaItem(req.user.access_token, mediaItemId);
    res.status(200).send(data);
})

app.get("/api/albums", async (req: Request, res: Response) => {
    console.log("Calling albums");
    console.log(`User: ${JSON.stringify(req.user)}`);
    console.log(`Token: ${req.user.access_token}`);

    const data = await libraryApiGetAlbums(req.user.access_token);

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
        const ticket = await authClient.verifyIdToken({
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
    const authHeader = req.headers.authorization;
    return authHeader ? authHeader.split(' ')[1] : null;
}

async function getPhotosFromAlbum(authToken: string, albumId: string) {
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
            // Make a GET request to load the albums with optional parameters (the
            // pageToken if set).
            const result = await request.post(config.apiEndpoint + '/v1/mediaItems:search', {
                headers: { 'Content-Type': 'application/json' },
                qs: parameters,
                json: searchTerm,
                auth: { 'bearer': authToken },
            });

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
        // If the error is a StatusCodeError, it contains an error.error object that
        // should be returned. It has a name, statuscode and message in the correct
        // format. Otherwise extract the properties.
        error = err.error.error ||
            { name: err.name, code: err.statusCode, message: err.message };
    }

    return { photos, error };
}

async function getMediaItem(authToken: string, mediaItemId: string) {
    const result = await request.get(config.apiEndpoint + `/v1/mediaItems/${mediaItemId}`, {
        headers: { 'Content-Type': 'application/json' },
        json: true,
        auth: { 'bearer': authToken }
    });

    return result;
}

// Returns a list of all albums owner by the logged in user from the Library
// API.
async function libraryApiGetAlbums(authToken) {
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
            // Make a GET request to load the albums with optional parameters (the
            // pageToken if set).
            const result = await request.get(config.apiEndpoint + '/v1/albums', {
                headers: { 'Content-Type': 'application/json' },
                qs: parameters,
                json: true,
                auth: { 'bearer': authToken },
            });

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
        // If the error is a StatusCodeError, it contains an error.error object that
        // should be returned. It has a name, statuscode and message in the correct
        // format. Otherwise extract the properties.
        error = err.error.error ||
            { name: err.name, code: err.statusCode, message: err.message };
    }

    return { albums, error };
}

app.listen(
    port, () => console.log(`Listening on port ${port}`)
);
