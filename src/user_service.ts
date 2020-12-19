import { IHandyRedis } from "handy-redis";
import { RedisClientFactory } from "./redis_client";
import { SummitUser } from "./summit_user";


export class UserService {
    private redisClient: IHandyRedis;

    constructor(
        clientFactory: RedisClientFactory
    ) {
        this.redisClient = clientFactory.getClient();
    }

    async getUser(id: string): Promise<SummitUser> {
        const user = await this.redisClient.get(id);
        return JSON.parse(user);
    }

    async setUser(user: SummitUser): Promise<any> {
        const userExists = await this.redisClient.exists(user.id);
        if (!userExists) {
            await this.redisClient.set(user.id, JSON.stringify(user));
        }
    }
}