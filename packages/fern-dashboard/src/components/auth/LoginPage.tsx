import Image from "next/image";

import { BookOpen } from "lucide-react";

import loginPreview from "../../../public/login-preview.png";
import { ThemedFernLogo } from "../theme/ThemedFernLogo";
import { Button } from "../ui/button";
import { LoginButton } from "./LoginButton";

export const LoginPage = () => {
  return (
    <div className="relative flex flex-1">
      <div className="relative flex flex-1 items-center bg-white md:mx-2 md:mt-2 md:w-[40%] md:min-w-[350px] md:flex-initial md:rounded-t-2xl md:border md:border-gray-200 md:shadow-md dark:bg-[#171717] dark:md:border-[rgb(46,46,46)]">
        <div className="mx-[15%] flex flex-1 flex-col">
          <div className="mb-2 text-xl font-bold">Welcome to Fern</div>
          <div className="text-muted-foreground mb-8 text-sm">
            Sign in to your account
          </div>
          <LoginButton />
        </div>
        <div className="text-muted-foreground absolute bottom-8 left-0 right-0 mx-[15%] text-center text-xs">
          By continuing, you agree to Fern&apos;s{" "}
          <a
            href="https://buildwithfern.com/terms-of-service"
            target="_blank"
            className="underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="https://buildwithfern.com/privacy-policy"
            target="_blank"
            className="underline"
          >
            Privacy Policy
          </a>
          , and to receive periodic emails with updates.
        </div>
      </div>
      <div className="relative hidden flex-1 flex-col md:flex">
        <div className="mt-16 flex min-h-0 flex-col overflow-hidden">
          <div className="mx-16 flex flex-col">
            <ThemedFernLogo className="mb-8 mt-4 w-28" />
            <div className="text-3xl font-bold">
              <div className="text-muted-foreground">Instantly offer</div>
              <div>
                SDKs <span className="text-muted-foreground">and</span> API Docs
              </div>
            </div>
          </div>
          <div className="mx-12 flex">
            <Image src={loginPreview} alt="preview of fern docs" />
          </div>
          <div className="bg-background/75 absolute bottom-0 left-0 right-0 flex flex-col gap-4 p-16">
            <div className="text-muted-foreground text-center text-sm">
              Giving API superpowers to world-class companies
            </div>
            <div className="flex justify-center gap-4">
              <div className="flex w-32 items-center justify-center rounded border border-gray-300 bg-gray-200 py-2 font-bold dark:border-black dark:bg-gray-800">
                LOGO
              </div>
              <div className="flex w-32 items-center justify-center rounded border border-gray-300 bg-gray-200 py-2 font-bold dark:border-black dark:bg-gray-800">
                LOGO
              </div>
              <div className="flex w-32 items-center justify-center rounded border border-gray-300 bg-gray-200 py-2 font-bold dark:border-black dark:bg-gray-800">
                LOGO
              </div>
              <div className="flex w-32 items-center justify-center rounded border border-gray-300 bg-gray-200 py-2 font-bold dark:border-black dark:bg-gray-800">
                LOGO
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute right-4 top-4 flex gap-2">
        <Button asChild variant="outline">
          <a href="https://buildwithfern.com/learn" target="_blank">
            <BookOpen />
            Documentation
          </a>
        </Button>
      </div>
    </div>
  );
};
