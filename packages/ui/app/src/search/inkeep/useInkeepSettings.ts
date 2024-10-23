import type {
    InkeepAIChatSettings,
    InkeepModalSettings,
    InkeepSearchSettings,
    InkeepWidgetBaseSettings,
} from "@inkeep/widgets";
import type { DeepReadonly } from "ts-essentials";
import { useTheme } from "../../atoms";
import { useSearchConfig } from "../../services/useSearchService";

const useInkeepSettings = ():
    | {
          baseSettings: InkeepWidgetBaseSettings;
          aiChatSettings?: InkeepAIChatSettings;
          searchSettings?: InkeepSearchSettings;
          modalSettings?: InkeepModalSettings;
      }
    | undefined => {
    const theme = useTheme();
    const searchConfig = useSearchConfig();

    if (!searchConfig.isAvailable || searchConfig.inkeep == null) {
        return;
    }

    const baseSettings: DeepReadonly<InkeepWidgetBaseSettings> = {
        colorMode: {
            forcedColorMode: theme,
        },
        theme: {
            tokens: {
                fonts: {
                    heading: "var(--typography-heading-font-family)",
                    body: "var(--typography-body-font-family)",
                    mono: "var(--typography-code-font-family)",
                },
            },
        },
        ...searchConfig.inkeep.baseSettings,
    };

    return {
        // cast readonly -> mutable types, since inkeep widget expects mutable types
        baseSettings: baseSettings as InkeepWidgetBaseSettings,
        aiChatSettings: searchConfig.inkeep.aiChatSettings as InkeepAIChatSettings | undefined,
        searchSettings: searchConfig.inkeep.searchSettings as InkeepSearchSettings | undefined,
        modalSettings: searchConfig.inkeep.modalSettings as InkeepModalSettings | undefined,
    };
};

export default useInkeepSettings;
