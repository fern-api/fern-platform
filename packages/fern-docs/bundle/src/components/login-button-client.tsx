"use client";

import { ComponentProps } from "react";

import { LogInIcon, LogOutIcon } from "lucide-react";

import { ButtonLink } from "@/components/FernLinkButton";
import { WithReturnTo } from "@/components/header/WithReturnTo";

export function LoginButtonClient({
  authed,
  returnToQueryParam,
  showIcon = false,
  ...props
}: {
  authed: boolean;
  returnToQueryParam: string;
  showIcon?: boolean;
} & ComponentProps<typeof ButtonLink>) {
  return (
    <WithReturnTo queryParam={returnToQueryParam}>
      <ButtonLink variant="outline" {...props}>
        {authed ? "Logout" : "Login"}
        {showIcon && (authed ? <LogOutIcon /> : <LogInIcon />)}
      </ButtonLink>
    </WithReturnTo>
  );
}
