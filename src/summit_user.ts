export class SummitUser {
    constructor(
        public refresh_token: string,
        public access_token: string,
        public id: string
    ) { }
}