import * as fs from "fs-extra";
import * as path from "path";
import War3Map from "mdx-m3-viewer/dist/cjs/parsers/w3x/map"
import { compileMap, getFilesInDirectory, loadJsonFile, logger, toArrayBuffer, IProjectConfig, saveJsonFile } from "./utils";

function main() {
  const config: IProjectConfig = loadJsonFile("config.json");
  const result = compileMap(config);

  if (!result) {
    logger.error(`Failed to compile map.`);
    return;
  }

  logger.info(`Creating w3x archive...`);
  if (!fs.existsSync(config.outputFolder)) {
    fs.mkdirSync(config.outputFolder);
  }

  let v = config.version;
  const version = `v${v.major}.${v.minor}.${v.build}`;
  let mapFileName = config.mapFolder.replace('.w3x', '_' + version + '.w3x');
  let archive = createMapFromDir(`./dist/${config.mapFolder}`);
  
  if (!archive) {
    logger.error("Failed to save archive.");
    return;
  }

  fs.writeFileSync(`${config.outputFolder}/${mapFileName}`, new Uint8Array(archive));
  for (let path of config.archiveOutputFolders) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
      logger.info("Creating folder: " + path);
    }
    logger.info("Saving archive: " + path);
    fs.writeFileSync(`${path}/${mapFileName}`, new Uint8Array(archive));
  }

  logger.info("Finished!");
  
  config.version.build++;
  saveJsonFile("config.json", config, 2);

  // createMapFromDir(`${config.outputFolder}/${config.mapFolder}`, `./dist/${config.mapFolder}`);
}

/**
 * Creates a w3x archive from a directory
 * @param dir The directory to create the archive from
 */
export function createMapFromDir(dir: string) {
  const map = new War3Map();
  const files = getFilesInDirectory(dir);

  map.archive.resizeHashtable(files.length);

  for (const fileName of files) {
    const contents = toArrayBuffer(fs.readFileSync(fileName));
    const archivePath = path.relative(dir, fileName);
    const imported = map.import(archivePath, contents);

    if (!imported) {
      logger.warn("Failed to import " + archivePath);
      continue;
    }
  }

  const result = map.save();
  return result;

  // if (!result) {
  //   logger.error("Failed to save archive.");
  //   return;
  // }

  // fs.writeFileSync(output, new Uint8Array(result));

  // logger.info("Finished!");
}

main();