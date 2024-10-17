import { clear } from "./clear";
import { echo } from "./echo";
import { export_ } from "./export";
import { CommandHandler } from "./types";

export const routes: Record<string, CommandHandler> = {
    clear,
    echo,
    export: export_,
};
