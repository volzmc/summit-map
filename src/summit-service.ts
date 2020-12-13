import { createHandyClient, IHandyRedis } from "handy-redis";

import { Summit } from './models';
import { config } from "./config";

export class SummitService {
    private redisClient: IHandyRedis;

    constructor() {
        this.redisClient = createHandyClient(config.redisUrl);
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