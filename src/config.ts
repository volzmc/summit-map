export const config = {
    oAuthClientId: '340317273424-6voils0o5kt47t86ugo1rv124rgcbsuv.apps.googleusercontent.com',
    oAuthClientSecret: 'HMIxxFlG5qcqJfCCEEk9wQI3',
    oAuthCallbackUrl: 'http://localhost:8080/auth/google/callback',
    scopes: [
        'https://www.googleapis.com/auth/photoslibrary.readonly',
        'profile',
    ],
    apiEndpoint: 'https://photoslibrary.googleapis.com',
    redisUrl: 'redis://h:pd2d0c463556dda6585442542f89130e3129be3d41bfee4a6b8874fa453de106c@ec2-18-209-187-96.compute-1.amazonaws.com:9719'
};