# Mintlify Starter Kit

Click on `Use this template` to copy the Mintlify starter kit. The starter kit contains examples including

- Guide pages
- Navigation
- Customizations
- API Reference pages
- Use of popular components

### 👩‍💻 Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mintlify) to preview the documentation changes locally. To install, use the following command

```
npm i -g mintlify
```

Run the following command at the root of your documentation (where mint.json is)

```
mintlify dev
```

### 😎 Publishing Changes

Changes will be deployed to production automatically after pushing to the default branch.

You can also preview changes using PRs, which generates a preview link of the docs.

#### Troubleshooting

- Mintlify dev isn't running - Run `mintlify install` it'll re-install dependencies.
- Page loads as a 404 - Make sure you are running in a folder with `mint.json`
- If the page for your endpoint is blank (does not show the request or response details), there is an issue with the OpenAPI specification

### Documenting Endpoints Covered in Fern
1. Paste the contents from the newly generated `external-api.yaml` file from the [Gateway](https://github.com/SyndicateProtocol/gateway/blob/main/openapi/external-docs/external-openapi.yml) into the `openapi.yaml` file in this repo
2. Create a new `.mdx` file in the `open-api` directory corresponding to an endpoint defined in the `openapi.yaml`
3. Add a reference to the new `.mdx` file in `mint.json`

### Documenting Custom Endpoints
1. Add the OpenAPI specification into `custom-openapi.yaml`
2. Follow steps 2 & 3 above
3. In your `.mdx` file created in step 2, declare a reference to the custom OpenAPI specification (`openapi: 'custom-openapi GET <endpoint>'`)