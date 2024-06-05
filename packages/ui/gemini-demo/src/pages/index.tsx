import { Roboto } from "next/font/google";
import { ReactElement } from "react";

const roboto = Roboto({
    weight: ["400", "500", "700"],
});

export default function Home(): ReactElement {
    return <main className={roboto.className}></main>;
}
