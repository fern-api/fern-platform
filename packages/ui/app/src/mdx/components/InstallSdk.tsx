import { FernSdk } from "@fern-ui/components";
import { useAtom } from "jotai";
import { FERN_LANGUAGE_ATOM } from "../../atoms/lang";

export const InstallSdk: React.FC<Pick<React.ComponentProps<typeof FernSdk>, "sdks">> = ({ sdks }) => {
    const [selectedLanguage, setSelectedLanguage] = useAtom(FERN_LANGUAGE_ATOM);
    return <FernSdk sdks={sdks} language={selectedLanguage} onChange={setSelectedLanguage} />;
};
