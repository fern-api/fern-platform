import { UAParser } from "ua-parser-js";

const uaParser = new UAParser();

type Platform = "mac" | "windows" | "other";
type Device = "desktop" | "mobile" | "tablet";

const getPlatform = (): Platform => {
    const { name } = uaParser.getOS();
    if (typeof name === "string") {
        if (name.startsWith("Mac") || name.startsWith("iOS")) {
            // NOTE: iOS shares the same key bindings as Mac, i.e. the Magic Keyboard on iPad
            return "mac";
        } else if (name.startsWith("Windows")) {
            return "windows";
        }
    }
    return "other";
};

const getDevice = (): Device => {
    const { type } = uaParser.getDevice();
    if (type === "mobile") {
        return "mobile";
    } else if (type === "tablet") {
        return "tablet";
    }
    return "desktop";
};

export { getDevice, getPlatform, type Device, type Platform };
