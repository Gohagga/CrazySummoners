import * as fs from "fs-extra";
import War3MapW3i from "mdx-m3-viewer/dist/cjs/parsers/w3x/w3i/file";
import War3MapWts from "mdx-m3-viewer/dist/cjs/parsers/w3x/wts/file";
import { IProjectConfig, loadJsonFile } from "./utils";

export function setVersionAuthor(path: string, config: IProjectConfig) {

    let mapInfo = config.mapInfo;
    let v = config.version;
    const version = `v${v.major}.${v.minor}.${v.build}`;

    let w3i = new War3MapW3i();
    w3i.load(fs.readFileSync(`${path}/war3map.w3i`));
    let wts = new War3MapWts();
    wts.load(fs.readFileSync(`${path}/war3map.wts`).toString());

    let w3iWriter = new W3iWriter(w3i, wts);

    // w3i.
    w3iWriter.setString("name", mapInfo.name.replace('{version}', version));
    w3iWriter.setString("author", mapInfo.author);
    w3iWriter.setString("description", mapInfo.description);
    w3iWriter.setString("recommendedPlayers", mapInfo.recommendedPlayers);

    w3iWriter.setString("loadingScreenTitle", mapInfo.loadingScreenTitle.replace('{version}', version));
    w3iWriter.setString("loadingScreenSubtitle", mapInfo.loadingScreenSubtitle);
    w3iWriter.setString("loadingScreenText", mapInfo.loadingScreenDescription);

    // console.log(wts.stringMap);
    // console.log(w3i);
  
    fs.writeFile(`${path}/war3map.w3i`, w3i.save(), (err) => err ? console.log(err) : null);
    fs.writeFile(`${path}/war3map.wts`, wts.save(), (err) => err ? console.log(err) : null);
}

class W3iWriter {
    private w3i: any;
    constructor(
        w3i: War3MapW3i,
        private wts: War3MapWts
    ) {
        this.w3i = w3i;
    }

    setString(key: string, value: string) {
        if (!this.w3i[key]) throw new Error('The key does not exist in the object.');
        if (this.w3i[key].startsWith('TRIGSTR')) {
            this.wts.setString(this.w3i[key], value);
        } else {
            this.w3i[key] = value;
        }
    }
}

const config: IProjectConfig = loadJsonFile("config.json");
setVersionAuthor(`./maps/${config.mapFolder}`, config);