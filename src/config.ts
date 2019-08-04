export const config = {
    oAuthClientId: process.env.oAuthClientId,
    oAuthClientSecret: process.env.oAuthClientSecret,
    oAuthCallbackUrl: process.env.oAuthCallbackUrl,
    scopes: [
        'https://www.googleapis.com/auth/photoslibrary.readonly',
        'profile',
    ],
    apiEndpoint: 'https://photoslibrary.googleapis.com'
};