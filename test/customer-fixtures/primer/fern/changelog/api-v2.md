Version 2 includes improvements to the Client Session API and the Payments API.

## Client Session API

- `X-API-Version` -> `2021-09-27`
- Creating a payment using _only_ a payment method token is now possible. The `order`, `customer` and `metadata` passed on the Client Session request is then used for the payment.
- The create Client Session endpoint request was extended to include `order`, `customer`, etc.
- All references to `paymentInstrument` from the previous Payments API version have been refactored to `paymentMethod` to be more consistent throughout
- The customer `billingAddress` and `shippingAddress` fields are now all optional

## Payments API

- `X-API-Version` -> `2021-09-27`
- Creating a payment using _only_ a payment method token is now possible. The `order`, `customer` and `metadata` passed on the Client Session request is then used for the payment.
- The create payment endpoint request was extended to include `order`, `customer`, etc. It now more closely resembles the `/client-session` endpoint
- The response of all the Payments API endpoints was refactored to match the create payment request structure
- All references to `paymentInstrument` from the previous Payments API version have been refactored to `paymentMethod` to be more consistent throughout
- All the payments API endpoints (create, capture, cancel, refund, etc.) are now versioned
- `paymentMethodData` in `PaymentMethod` responses (for card payment method types) all now contain a `first6digits` field in addition to the `last4digits` returned. This is an opt-in field, so it is `null` by default.
- The customer `billingAddress` and `shippingAddress` fields are now all optional
