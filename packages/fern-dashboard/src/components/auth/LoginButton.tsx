import { getLoginUrl } from "@/utils/getLoginUrl";

import { Button } from "../ui/button";
import { GithubLogo } from "./GithubLogo";

export const LoginButton = () => {
  return (
    <Button asChild>
      <a href={getLoginUrl()}>
        <GithubLogo />
        Continue with Github
      </a>
    </Button>
  );
};
