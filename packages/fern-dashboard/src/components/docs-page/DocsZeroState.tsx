import Image from "next/image";

import { PlusIcon } from "@heroicons/react/24/outline";

import exampleDocsSite from "../../../public/example-docs-site.avif";
import { Button } from "../ui/button";

export default function DocsZeroState() {
  return (
    <div className="flex flex-col gap-12">
      <div className="dark:border-gray-1100 flex h-[300px] justify-center overflow-hidden border-b border-gray-700">
        <div className="relative mx-[5%] flex max-w-[700px] flex-1 justify-center">
          <Image
            className="absolute top-0"
            src={exampleDocsSite}
            alt="example doc site"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <Button>
          <PlusIcon />
          Create your first Docs site
        </Button>
      </div>
    </div>
  );
}
