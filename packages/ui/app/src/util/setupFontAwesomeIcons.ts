import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { fad } from "@fortawesome/pro-duotone-svg-icons";
import { fal } from "@fortawesome/pro-light-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { fas as fasPro } from "@fortawesome/pro-solid-svg-icons";

export function setupFontAwesomeIcons(): void {
    // See https://github.com/FortAwesome/Font-Awesome/issues/19348#issuecomment-1262137893
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { library, config } = require("@fortawesome/fontawesome-svg-core");
    config.autoAddCss = false;
    library.add(fas, fab, fad, fal, far, fasPro);
}
