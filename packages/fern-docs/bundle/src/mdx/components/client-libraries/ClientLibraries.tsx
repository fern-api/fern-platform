import { ComponentProps, FC } from "react";

import { FernSdk } from "@fern-docs/components";

import { useProgrammingLanguage } from "@/state/language";

export const ClientLibraries: FC<
  Pick<ComponentProps<typeof FernSdk>, "sdks">
> = ({ sdks }) => {
  const [language, setLanguage] = useProgrammingLanguage();
  return <FernSdk sdks={sdks} language={language} onChange={setLanguage} />;
};
