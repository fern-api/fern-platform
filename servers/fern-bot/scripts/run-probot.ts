#!npx ts-node
import { run } from "probot";
import appFn from "../src/functions/github-webhook-listener/actionWrapper";

// https://probot.github.io/docs/configuration/

run(appFn);
