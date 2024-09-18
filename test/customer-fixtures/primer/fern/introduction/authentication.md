Primer uses API keys to authenticate requests. You can manage API keys in the [Developers](https://sandbox-dashboard.primer.io/developers) area of the dashboard.

As API keys carry many privileges such as _authorizing_ payments, it is important to keep them **private** and **secure**. Do not hardcode or share API keys (particularly in your source version control system), and they should only be used in your backend.

Authentication is handled via HTTP headers, specifically the `X-Api-Key` header.

```bash
curl -X POST 'https://api.primer.io/<ENDPOINT>' \
  --header 'X-Api-Key: <YOUR_API_KEY>'
```

## Managing API Keys

Head up to the [Developers area](https://sandbox-dashboard.primer.io/developers) on the dashboard to manage your API keys.

You will be able to generate or revoke API keys and edit their respective scopes. Be aware that any changes to existing API keys will be reflected immediately and could cause unwanted side effects.

## Available scopes

| Scope                         | Description                                                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `client_tokens:write`         | Create client tokens for use with the client SDK.                                                                                                                                     |
| `third_party:webhook_trigger` | Allows you to post to our webhooks endpoint. API keys with this scope can be used to enable communication between your processor and Primer about important payment lifecycle events. |
| `transactions:authorize`      | Authorize a payment                                                                                                                                                                   |
| `transactions:cancel`         | Cancel a payment.                                                                                                                                                                     |
| `transactions:capture`        | Submit a payment for settlement.                                                                                                                                                      |
| `transactions:retrieve`       | Retrieve one or more payments.                                                                                                                                                        |
| `transactions:refund`         | Refund a payment.                                                                                                                                                                     |
| `payment_instrument:read`     | Read stored payment methods.                                                                                                                                                          |
| `payment_instrument:write`    | Write stored payment methods.                                                                                                                                                         |
