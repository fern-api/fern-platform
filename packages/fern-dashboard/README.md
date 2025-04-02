# Set up

```bash
pnpm install
npm install -g vercel

cd packages/fern-dashboard

# to dev against dev environment
vercel link # link to fern-dashboard-dev
vercel env pull .env.local
pnpm turbo --filter=@fern-dashboard/ui dashboard:dev

# to dev against prodenvironment
vercel link # link to fern-dashboard
vercel env pull .env.local
pnpm turbo --filter=@fern-dashboard/ui dashboard:dev
```

## Components library

We're using [shadcn](https://ui.shadcn.com/) for our components. To add a
component, go to the shadcn component page and run the `Installation` command:

````
pnpm dlx shadcn@latest add <component>
```
````
