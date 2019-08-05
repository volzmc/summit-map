export const config = {
    oAuthClientId: '340317273424-6voils0o5kt47t86ugo1rv124rgcbsuv.apps.googleusercontent.com',
    oAuthClientSecret: process.env.oAuthClientSecret,
    oAuthCallbackUrl: 'https://geo-frame.herokuapp.com/auth/google/callback',
    scopes: [
        'https://www.googleapis.com/auth/photoslibrary.readonly',
        'profile',
    ],
    apiEndpoint: 'https://photoslibrary.googleapis.com'
};