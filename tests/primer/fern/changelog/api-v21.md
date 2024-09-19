Version 2.1 includes improvements to the Client Session API, Payments API and the Payment Methods API.

Starting API v2.1, the API Version X-Api-Version is a semantic version without a patch (e.g. 2.1) rather than a date 🎉
Set the `X-Api-Version` header to `2.1` to use v2.1 of the API.

## Client Session API

- Added `paymentMethod.paymentType` and `paymentMethod.descriptor` on the request and response of the client session
- Added `order.lineItems[].productType` on the request and response of the client session
- Added `GET /client-session` to get the content of a client session
- Added `PATCH /client-session` to update the content of a client session
- Additional validation has been put in place to ensure that a `currencyCode` is always passed if any `amount` value is passed

## Payments API

- Added `paymentMethod.isVaulted` boolean field to indicate whether the `paymentMethod.paymentMethodToken` in the response is a vaulted token (and can therefore be used for future payments) or not. This replaces `vaultedPaymentMethodToken`.
- Added `order.lineItems[].productType` on the request and response
- `amount`, `currencyCode`, `customerId` and `orderId` are now required fields when making a payment with a vaulted token (i.e. a recurring payment).
- When paying with a vaulted token, additional validation has been put in place to ensure the `customerId` matches the `customerId` associated with the vaulted token.

## Payment Methods API

- Added verify in `POST /payment-instruments/{paymentMethodToken}/vault` to set whether or not the payment method token should be verified before vaulting
- Added `isVerified` to the payment method response
