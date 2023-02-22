import { mkdir, lstat } from "fs/promises";

const DATA_DIRECTORY = "opt/var/data";
const SQLITE_DIRECTORY = `${DATA_DIRECTORY}/db`;
const IR_DIRECTORY = "opt/var/ir";

export async function initializeDirectories(): Promise<void> {
    createDirectoryIfNotExists(SQLITE_DIRECTORY);
    createDirectoryIfNotExists(IR_DIRECTORY);
}

async function createDirectoryIfNotExists(directory: string): Promise<void> {
    if (!(await doesPathExist(directory))) {
        await mkdir(directory, {
            recursive: true,
        });
    }
}

async function doesPathExist(filepath: string): Promise<boolean> {
    try {
        await lstat(filepath);
        return true;
    } catch {
        return false;
    }
}
