# Development Tips

This document contains some tips for developing in this repo. This is a living document, so feel free to add to it as you see fit.

## Using Turbo effectively

Turbo knows your dependencies and task graphs. If you need to build all tasks/scripts that depend on a certain task/script, just run it through `turbo`.

```sh
pnpm run <task> # this just runs given task
turbo run <task> # this runs given task and all tasks that depend on it
```

Turbo will cache all your tasks so it is safe to run it multiple times.
