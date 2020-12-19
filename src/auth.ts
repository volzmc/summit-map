import { config } from './config';
import { SummitUser } from "./summit_user";
import { OAuth2Client } from "google-auth-library";

export class AuthClientFactory {

    private client = new OAuth2Client(
        config.oAuthClientId,
        config.oAuthClientSecret,
        config.oAuthCallbackUrl
    );

    public create(user?: SummitUser): OAuth2Client {
        const client = new OAuth2Client(
            config.oAuthClientId,
            config.oAuthClientSecret,
            config.oAuthCallbackUrl
        );
        if (user) {
            client.setCredentials({
                access_token: user.access_token,
                refresh_token: user.refresh_token
            });
        }
        
        return client;
    }

    public getAuthUrl(): string {
        return this.client.generateAuthUrl({
            access_type: 'offline',
            scope: config.scopes.join(' ')
        });
    }
}