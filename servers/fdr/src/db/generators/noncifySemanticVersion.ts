import { ReleaseType } from "../../api/generated/api/resources/generators";
import { assertNever } from "../../util";
import { getPrereleaseTypeAndVersion, parseSemverOrThrow } from "./daoUtils";

const NONCE_PIECE_LENGTH = 5;
export function noncifySemanticVersion(version: string): string {
  const parsedVersion = parseSemverOrThrow(version);

  let prereleaseNonceIndicator = "15"; // Indicative of a non-prerelease version

  const [prereleaseType, prereleaseVersion] =
    getPrereleaseTypeAndVersion(version);
  switch (prereleaseType) {
    case ReleaseType.Rc:
      prereleaseNonceIndicator = "12";
      break;
    case ReleaseType.Ga:
      prereleaseNonceIndicator = "15";
      break;
    default:
      assertNever(prereleaseType);
  }

  return `${pad(parsedVersion.major)}-${pad(parsedVersion.minor)}-${pad(parsedVersion.patch)}-${prereleaseNonceIndicator}-${pad(prereleaseVersion)}`;
}

function pad(word: number): string {
  return word.toString().padStart(NONCE_PIECE_LENGTH, "0");
}
