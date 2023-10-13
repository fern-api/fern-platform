Primer supports a request idempotency mechanism for our Payments API. This optional feature enables you to safely retry a request without risking the user being charged or refunded multiple times.

This is particularly useful when an API call fails due to the request being invalid, due to a network issue, or if Primer is momentarily unavailable.

If this is the case, make another request with the same idempotency key:

- If a request with the same idempotency key has already been successfully processed by Primer, the new request will be ignored. A `400` error will be returned with an `errorId` set to `TransactionRequestIdempotencyKeyAlreadyExists`.
- Otherwise, Primer will attempt to process the new request.

To make an idempotent request, generate an idempotency key and pass it to the header `X-Idempotency-Key`.

```bash
curl -X POST 'https://api.primer.io/<ENDPOINT>' \
  --header 'X-Idempotency-Key: <idempotency-key>'
```

The way you generate the key is totally up to you, as long as it is unique per request attempt.

Keep in mind that a payment request resulting in a declined or failed payment is still considered _Successfully processed_ for the API. Therefore, if you want to allow the user to retry an unsuccessful payment, make sure to not use the same idempotency key.

As a such, don't use anything too restrictive like an `orderId` for the idempotency key as multiple payment attempts and refunds can be made for a single order.
