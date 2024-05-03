export function getFileTypeFromMagicBytes(file: Uint8Array): string {
    const arr = file.subarray(0, 4);
    let header = "";
    for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
    }
    let type = "";

    switch (header) {
        case "89504e47":
            type = "image/png";
            break;
        case "47494638":
            type = "image/gif";
            break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
            type = "image/jpeg";
            break;
        case "fffb":
        case "fff3":
        case "fff2":
        case "494433":
            type = "audio/mpeg";
            break;
        case "52494646":
            type = "audio/wav";
            break;
        case "664c6143":
            type = "audio/flac";
            break;
        case "464f524d":
            type = "audio/aiff";
            break;
        default:
            type = "";
            break;
    }
    return type;
}
