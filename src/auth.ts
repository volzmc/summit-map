import { Strategy } from "passport-google-oauth20";
import { PassportStatic } from "passport";

import { config } from './config';

export const setAuth = (passport: PassportStatic) => {
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
    passport.use(new Strategy(
        {
            clientID: config.oAuthClientId,
            clientSecret: config.oAuthClientSecret,
            callbackURL: config.oAuthCallbackUrl,
            userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
        },
        (token, refreshToken, profile, done) => done(null, { profile, token })
    ))
};