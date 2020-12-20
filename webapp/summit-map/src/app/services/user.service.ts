import { CookieService } from "ngx-cookie-service";
import jwtDecode, { } from "jwt-decode";
import { Injectable } from "@angular/core";
import { User } from "../models/user";

@Injectable({
providedIn: 'root'
})
export class UserService {
    constructor(
        private cookieService: CookieService
    ) { }

    public getUser(): User {
        const token = this.cookieService.get('summitId');
        if (token) {
            const payload = jwtDecode<GoogleJWT>(token);
            return {
                picture: payload.picture,
                name: payload.name
            }
        } else {
            return null;
        }
    }

    public signOut() {
        this.cookieService.delete('summitId');
    }
}

class GoogleJWT {
    iss: string;
    azp: string;
    aud: string;
    sub: string;
    name: string;
    picture: string;
    exp: number;
}