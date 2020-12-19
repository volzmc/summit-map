import { IHandyRedis } from "handy-redis";

import { Summit } from './models';
import { RedisClientFactory } from "./redis_client";

export class SummitService {
    private redisClient: IHandyRedis;

    constructor(
        clientFactory: RedisClientFactory
    ) {
        this.redisClient = clientFactory.getClient();
    }

    async getAllSummits(): Promise<Summit[]> {
        const allIds = await this.redisClient.smembers('summits');
        const multi = this.redisClient.multi();
        allIds.forEach(id => {
            multi.get(id);
        });
        return this.redisClient.execMulti<string>(multi).then(
            rawVals => rawVals.map(v => JSON.parse(v))
        );
    }

    async addOrUpdateSummit(summit: Summit): Promise<any> {
        const summitExists = await this.redisClient.sismember('summits', summit.title);

        if (summitExists) {
            await this.redisClient.srem('summits', summit.title);
            await this.redisClient.del(summit.title);
        }

        await this.redisClient.sadd('summits', summit.title);
        return this.redisClient.set(summit.title, JSON.stringify(summit));
    }

    async removeSummit(summit: Summit): Promise<any> {
        const summitExists = await this.redisClient.sismember('summits', summit.title);

        if (summitExists) {
            await this.redisClient.srem('summits', summit.title);
            await this.redisClient.del(summit.title);
        }
    }
}