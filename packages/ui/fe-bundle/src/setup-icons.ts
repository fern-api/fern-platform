import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

export function setupFontAwesomeIcons(): void {
    // See https://github.com/FortAwesome/Font-Awesome/issues/19348#issuecomment-1262137893
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { library, config } = require("@fortawesome/fontawesome-svg-core");
    config.autoAddCss = false;
    library.add(fas, fab);
}
