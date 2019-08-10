import express, { RequestHandler } from "express";
import session from "express-session";
import { Request, Response } from "express-serve-static-core";
import path from "path";
import bodyParser from "body-parser";
import passport from "passport";
import request from "request-promise";

import { SummitService } from "./summit-service";
import { setAuth } from './auth';
import { config } from './config';

const app = express();
const port = process.env.PORT || 8080;
const summitService = new SummitService();

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

app.use(session({
    secret: 'summt-map-secret',
    resave: true,
    saveUninitialized: true
}));

setAuth(passport);

app.use(passport.initialize());
app.use(passport.session());

app.all("/*", (req: Request, res: Response, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
    next();
});

// Start the OAuth login process for Google.
app.get('/auth/google', passport.authenticate('google', {
    scope: config.scopes,
    failureFlash: true,  // Display errors to the user.
    session: true,
}));

// Callback receiver for the OAuth process after log in.
app.get(
    '/auth/google/callback',
    passport.authenticate(
        'google', { failureRedirect: '/', failureFlash: true, session: true }),
    (req, res) => {
        // User has logged in.
        res.redirect('/');
});


app.use((req: Request, res: Response, next) => {
    res.locals.name = '-';
    if (req.user && req.user.profile && req.user.profile.name) {
        res.locals.name = req.user.profile.name.givenName || req.user.profile.displayName;
    }
    next();
});

app.get("/api/allSummits", async (req: Request, res: Response) => {
    const allSummits = await summitService.getAllSummits();

    res.json(allSummits);
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
    const data = await getPhotosFromAlbum(req.user.token, albumId);

    if (data.error) {
        res.status(data.error.code || 500).send(data.error);
    } else {
        res.status(200).send(data.photos);
    }
});

app.post("/api/mediaItem", async (req: Request, res: Response) => {
    const mediaItemId = req.body.mediaItemId;
    const data = await getMediaItem(req.user.token, mediaItemId);
    res.status(200).send(data);
})

app.get("/api/albums", async (req: Request, res: Response) => {
    const data = await libraryApiGetAlbums(req.user.token);

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
