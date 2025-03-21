import { Button } from "../ui/button";
import { GithubLogo } from "./GithubLogo";

export const LoginButton = () => {
  return (
    <Button asChild>
      <a href="/auth/login">
        <GithubLogo />
        Continue with Github
      </a>
    </Button>
  );
};
