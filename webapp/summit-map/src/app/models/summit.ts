import { Album } from './album';

export class Summit {
    latitude: number;
    longitude: number;
    title: string;
    photoAlbumName: string;
    elevation: number;
    totalGain: number;
    dateClimbed: Date;
    description: string;

    // Calculated
    photoAlbumId: string;
    album: Album;

    constructor(init?: Partial<Summit>) {
        Object.assign(this, init);
    }
}
