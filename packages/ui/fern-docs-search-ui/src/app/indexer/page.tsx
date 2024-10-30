"use client";

import { ReactElement } from "react";
import { handleReindex } from "../actions/reindex";

export default async function IndexerPage(): Promise<ReactElement> {
    return (
        <div>
            <button onClick={() => handleReindex()}>Reindex</button>
        </div>
    );
}
