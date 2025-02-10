import { ComponentProps, FC } from "react";

import { FernSdk } from "@fern-docs/components";
import { useAtom, useAtomValue } from "jotai";

import { DEFAULT_LANGUAGE_ATOM, FERN_LANGUAGE_ATOM } from "../../../atoms";

export const ClientLibraries: FC<
  Pick<ComponentProps<typeof FernSdk>, "sdks">
> = ({ sdks }) => {
  const [selectedLanguage, setSelectedLanguage] = useAtom(FERN_LANGUAGE_ATOM);
  const defaultLanguage = useAtomValue(DEFAULT_LANGUAGE_ATOM);
  return (
    <FernSdk
      sdks={sdks}
      language={selectedLanguage ?? defaultLanguage}
      onChange={setSelectedLanguage}
    />
  );
};
