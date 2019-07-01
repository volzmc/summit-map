import * as fs from "fs";
import path from "path";

import { Summit } from './models';

export class SummitService {
    private allSummits: Summit[];
    private summitFilePath = path.resolve("./assets/summits.json");

    constructor() {
        const rawFile = fs.readFileSync(this.summitFilePath);
        const parsed = JSON.parse(rawFile.toString());
        this.allSummits = parsed["summits"];
    }

    getAllSummits(): Summit[] {
        return this.allSummits;
    }

    addOrUpdateSummit(summit: Summit): void {
        const existingIndex = this.allSummits.findIndex(s => s.title === summit.title);
        if (existingIndex >= 0) {
            this.allSummits[existingIndex] = summit;
        } else {
            this.allSummits.push(summit);
        }

        this.saveList();
    }

    removeSummit(summit: Summit): void {
        const existingIndex = this.allSummits.findIndex(s => s.title === summit.title);
        if (existingIndex >= 0) {
            this.allSummits.splice(existingIndex, 1);
        }

        this.saveList();
    }

    private saveList(): void {
        const formattedJson = {
            "summits": this.allSummits
        };
        const raw = JSON.stringify(formattedJson);
        fs.writeFileSync(this.summitFilePath, raw);
    }
}