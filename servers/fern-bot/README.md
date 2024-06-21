# Fern Bot - Serverless Framework Project

For detailed instructions, please refer to the [documentation](https://www.serverless.com/framework/docs/providers/aws/).

## Installation/deployment instructions

- Run `pnpm install` to install the project dependencies
- Run `pnpm deploy` to deploy this stack to AWS

## Deployment

Take a look at `deploy-fern-bot-dev.yml` and `deploy-fern-bot-prod.yml` for how we currently deploy fern-bot's lambda functions.

## Bots

We have two bots, one for staging/testing, and another that's the production app.

- **Test:** [[Development] Fern Bot](https://github.com/organizations/fern-api/settings/apps/development-fern-bot)
- **Production:** [Fern API](https://github.com/organizations/fern-api/settings/apps/fern-api)

## Testing locally

(There's a way to write tests, but for now let's talk about invoking this)

You can run locally by running `pnpm invoke local --function FUNCTION`, for example if you wanted to test the update OpenAPI spec function with your `.env.local`, you'd run:

```bash
dotenv -e .env.local -- pnpm invoke local --function updateOpenApiSpec
```

<!-- ## Test your service

This template contains a single lambda function triggered by an HTTP request made on the provisioned API Gateway REST API `/hello` route with `POST` method. The request body must be provided as `application/json`. The body structure is tested by API Gateway against `src/functions/hello/schema.ts` JSON-Schema definition: it must contain the `name` property.

- requesting any other path than `/hello` with any other method than `POST` will result in API Gateway returning a `403` HTTP error code
- sending a `POST` request to `/hello` with a payload **not** containing a string property named `name` will result in API Gateway returning a `400` HTTP error code
- sending a `POST` request to `/hello` with a payload containing a string property named `name` will result in API Gateway returning a `200` HTTP status code with a message saluting the provided name and the detailed event processed by the lambda

> :warning: As is, this template, once deployed, opens a **public** endpoint within your AWS account resources. Anybody with the URL can actively execute the API Gateway endpoint and the corresponding lambda. You should protect this endpoint with the authentication method of your choice.

### Locally

In order to test the hello function locally, run the following command:

- `npx sls invoke local -f hello --path src/functions/hello/mock.json` if you're using NPM
- `yarn sls invoke local -f hello --path src/functions/hello/mock.json` if you're using Yarn

Check the [sls invoke local command documentation](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/) for more information.

### Remotely

Copy and replace your `url` - found in Serverless `deploy` command output - and `name` parameter in the following `curl` command in your terminal or in Postman to test your newly deployed application.

```
curl --location --request POST 'https://myApiEndpoint/dev/hello' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Frederic"
}'
``` -->

## Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas

```
.
├── src
│   ├── functions               # Lambda configuration and source code folder
│   │   └── hello
│   │       ├── actions
│   │       │   └── hello.ts    # `Hello` lambda source code
│   │       └── hello.ts        # `Hello` lambda handler code
│   │
│   │
│   └── libs                    # Lambda shared code
│       └── apiGateway.ts       # API Gateway specific helpers
│       └── handlerResolver.ts  # Sharable library for resolving lambda handlers
│       └── lambda.ts           # Lambda middleware
│
├── package.json
├── serverless.yml              # Serverless configuration file
├── tsconfig.json               # Typescript compiler configuration
└── tsconfig.paths.json         # Typescript paths
```

## Adding a new function

1. Create a new folder within `./src/functions`
2. Create a handler file, this is mostly boiler plate, so I'd look at the other functions to see how they export their handlers look for `export const handler`
3. Write the actual logic for the function
4. Write the `serverless` configuration for your function to get it depolyed

   1. In most cases, this should be as simple as adding an entry to the `functions` block:
      ```
        reallyCoolFunction:
          handler: "src/functions/my-new-function/myNewFunction.handler"
      ```
   2. If your function interacts with git, you'll need to add the following layer to ensure git is installed within the lambda's execution environment:
      ```
        reallyCoolFunction:
          handler: "src/functions/my-new-function/myNewFunction.handler"
          layers:
              - arn:aws:lambda:us-east-1:553035198032:layer:git-lambda2:8
      ```
   3. Specify your trigger:
      ```
        reallyCoolFunction:
          handler: "src/functions/my-new-function/myNewFunction.handler"
          events:
            - schedule:
                rate: cron(0 0 * * ? *)
                enabled: true
      ```
      View the full list of events here: https://www.serverless.com/framework/docs/providers/aws/guide/events

5. Test your function locally (as explained above): `dotenv -e .env.local -- pnpm invoke local --function reallyCoolFunction`
6. [Optional] Deploy to dev and test it within the AWS console
7. Submit a PR! The existing GitHub actions deploy the whole project, which will then include your new function already
