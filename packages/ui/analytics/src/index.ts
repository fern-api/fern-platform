declare global {
    interface Window {
        [key: string]: any;
    }
}

export { track, trackInternal } from "./track";
