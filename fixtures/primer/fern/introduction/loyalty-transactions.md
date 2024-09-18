Primer's Loyalty API provides an interface to interact with 3rd party loyalty point and service providers.

All of the endpoints below reference a `connectionId`. This is the unique Primer identifier for your loyalty provider connection. Primer will provide this once the loyalty provider connection is created.

To identify the customer in the context of the loyalty provider, a `customerId` is also necessary.

## Get the customer balance

Call the [Loyalty Customers](https://apiref.primer.io/reference/get_loyalty_customer) endpoint, which includes the customer's balance. In future this object could contain further details.

## Redeem points

Call the [Loyalty Transactions](https://apiref.primer.io/reference/post_loyalty_transaction) endpoint to create a `REDEMPTION` transaction.

Provide an `orderId` to link multiple transactions together.

## Refund points

Call the [Loyalty Transactions](https://apiref.primer.io/reference/post_loyalty_transaction) endpoint to create a `REFUND` transaction. This transaction is completely independent from a redeem transaction.

Provide an `orderId` to link multiple transactions together.

## Get a list of transactions

Call the [Loyalty Transactions](https://apiref.primer.io/reference/get_loyalty_transaction) endpoint to retrieve a list of all your transactions. In most cases it makes sense to filter by `connectionId`. You can also filter by `customerId` or `orderId`.
