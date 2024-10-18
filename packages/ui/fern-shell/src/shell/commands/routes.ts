import { call } from "./call";
import { clear } from "./clear";
import { echo } from "./echo";
import { export_ } from "./export";
import { jq } from "./jq";
import { CommandHandler } from "./types";

export const routes: Record<string, CommandHandler> = {
    clear,
    echo,
    export: export_,
    jq,
    call,
};
