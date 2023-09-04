import { config, library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";

export function setupFontAwesomeIcons(): void {
    config.autoAddCss = false;
    library.add(fas, fab);
}
