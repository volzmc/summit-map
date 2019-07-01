export class Summit {
    latitude: number;
    longitude: number;
    title: string;
    photoUrl: string;
    elevation: number;
    totalGain: number;
    dateClimbed: Date;
    description: string;

    constructor(init?: Partial<Summit>) {
        Object.assign(this, init);
    }
}
