The Primer API is used to manage Client Sessions, Payments and saved payment methods.
All other actions are either managed in the Universal Checkout implementation or in the Dashboard.

Check out:

- [Client Sessions](https://primer.io/docs/payments/universal-checkout/manage-client-sessions)
- [Universal Checkout](https://primer.io/docs/accept-payments/setup-universal-checkout/installation/web)
- [Managing Payments](https://primer.io/docs/accept-payments/manage-payments)

Test the APIs yourself in our API Reference. Don't hesitate to reach out with any questions or feedback. You can email Primer directly at [support@primer.io](support@primer.io), or contact your Primer account manager.

## API Endpoint Deployments

- Sandbox: [https://api.sandbox.primer.io](https://api.sandbox.primer.io)
- Production: [https://api.primer.io](https://api.primer.io)

## API Versions

Primer makes updates to the APIs on a regular basis, as we release new features. To allow you to update your integration as you are ready, we allow for a `X-Api-Version` header to be passed on all API requests.

If you omit the version header, your request will default to the earliest supported version of the API.

```bash
curl -X POST 'https://api.primer.io/<ENDPOINT>' \
  --header 'X-Api-Version: 2.2'
```

### Available Versions

Read about the available versions of the APIs below on our [Changelog](https://apiref.primer.io/changelog).
