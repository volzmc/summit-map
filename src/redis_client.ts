import { createHandyClient, IHandyRedis } from "handy-redis";
import { config } from "./config";

export class RedisClientFactory {
    private client: IHandyRedis;

    getClient(): IHandyRedis {
        if (!this.client) {
            this.client = createHandyClient(process.env.REDIS_URL);
        }
        return this.client;
    }
}