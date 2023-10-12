We are continually introducing new functionality to the Primer Ecosystem, some of which requires additional inputs on our APIs. To make sure these changes don’t break any existing integrations, we roll them out safely using API Versions.

## Migrating to v2.1

The latest version of our APIs focus on capturing more details to enable a richer checkout experience. Some of these details are required to allow configuration of the checkout via the Primer Dashboard. Also some of these details are needed to work with advanced Payment Processors or Payment Methods.

The examples below only illustrate how to transition between the two versions of the endpoints, however you should read the latest API Reference linked above for details on the usage of the endpoints. Also read how to introduce API Versioning into your requests in the latest API Reference linked above.

## Client Session

This is an example of a request in v1: `POST /auth/client-token`.

```json
{
  "customerCountryCode": "GB",
  "customerId": "customer-123",
  "checkout": {
    "paymentFlow": "DEFAULT"
  }
}
```

This is an example of a equivalent request in v2: `POST /client-session` with `X-Api-Version="2021-09-27"`.

```json
{
  "customerId": "customer-123",
  "customer": {
    "emailAddress": "customer@primer.io",
    "mobileNumber": "+44841234567",
    "firstName": "John",
    "lastName": "Doe",
    "billingAddress": {
      "addressLine1": "42A",
      "postalCode": "abcde",
      "city": "Cambridge",
      "state": "Cambridgeshire",
      "countryCode": "GB"
    },
    "shippingAddress": {
      "addressLine1": "42A",
      "postalCode": "abcde",
      "city": "Cambridge",
      "state": "Cambridgeshire",
      "countryCode": "GB"
    }
  },
  "order": {
    "lineItems": [
      {
        "itemId": "item-1",
        "description": "My item",
        "amount": 1337,
        "quantity": 1
      }
    ],
    "countryCode": "GB"
  },
  "currencyCode": "GBP",
  "orderId": "order-123",
  "metadata": {
    "productType": "Merchandise"
  },
  "paymentMethod": {
    "vaultOnSuccess": true
  }
}
```

### v2.1

This is an example of a equivalent request in v2.1: `POST /client-session` with `X-Api-Version="2.1"`.

```json
{
  "customerId": "customer-123",
  "customer": {
    "emailAddress": "customer@primer.io",
    "mobileNumber": "+44841234567",
    "firstName": "John",
    "lastName": "Doe",
    "billingAddress": {
      "addressLine1": "42A",
      "postalCode": "abcde",
      "city": "Cambridge",
      "state": "Cambridgeshire",
      "countryCode": "GB"
    },
    "shippingAddress": {
      "addressLine1": "42A",
      "postalCode": "abcde",
      "city": "Cambridge",
      "state": "Cambridgeshire",
      "countryCode": "GB"
    }
  },
  "lineItems": [
    {
      "itemId": "item-1",
      "description": "My item",
      "amount": 1337,
      "quantity": 1
    }
  ],
  "orderDetails": {
    "countryCode": "GB"
  },
  "currencyCode": "GBP",
  "orderId": "order-123",
  "metadata": {
    "productType": "Merchandise"
  },
  "paymentMethod": {
    "vaultOnSuccess": true
  }
}
```

## Summary of the v2.1 changes

- `order` is now called `orderDetails`
- `lineItems` is now a top-level element
- `amount` has been removed. You should always specify `lineItems` and we would dynamically calculate the amount. See our [API Reference](https://apiref.primer.io/reference) for how we calculate the amount.

## Create a Payment

This is an example of an equivalent request: `POST /payments` with `X-Api-Version="2021-09-27"`.

`POST /payments`

```json
{
  "orderId": "order-123",
  "currencyCode": "GBP",
  "amount": 1337,
  "paymentInstrument": {
    "token": "{{payment_method_token}}" // As received from the SDK
  },
  "statementDescriptor": "Test payment",
  "customer": {
    "email": "customer@primer.io",
    "billingAddress": {
      "addressLine1": "42A",
      "postalCode": "abcde",
      "city": "Cambridge",
      "state": "Cambridgeshire",
      "countryCode": "GB"
    }
  }
}
```

This is an example of an equivalent request in v2: `POST /payments` with `X-Api-Version="2021-09-27"`.

```json
{
  "orderId": "order-123",
  "amount": 1000,
  "currencyCode": "GBP",
  "customer": {
    "email": "customer@primer.io",
    "billingAddress": {
      "addressLine1": "42A",
      "postalCode": "abcde",
      "city": "Cambridge",
      "state": "Cambridgeshire",
      "countryCode": "GB"
    }
  },
  "metadata": {
    "productType": "Merchandise"
  },
  "paymentMethodToken": "{{payment_method_token}}", // As received from the SDK
  "paymentMethod": {
    "descriptor": "Test payment",
    "paymentType": "FIRST_PAYMENT"
  }
}
```

This is an example of an equivalent request in v2.1: `POST /payments` with `X-Api-Version="2.1"`

```json
{
  "paymentMethodToken": "{{payment_method_token}}" // As received from the SDK
}
```

OR

```json
{
  "orderId": "order-123",
  "amount": 1337,
  "currencyCode": "GBP",
  "customer": {
    "email": "customer@primer.io",
    "billingAddress": {
      "addressLine1": "42A",
      "postalCode": "abcde",
      "city": "Cambridge",
      "state": "Cambridgeshire",
      "countryCode": "GB"
    }
  },
  "lineItems": [
    {
      "itemId": "item-1",
      "description": "My item",
      "amount": 1337,
      "quantity": 1
    }
  ],
  "orderDetails": {
    "countryCode": "GB"
  },
  "metadata": {
    "productType": "Merchandise"
  },
  "paymentMethodToken": "{{payment_method_token}}", // As received from the SDK
  "paymentMethod": {
    "descriptor": "Test payment",
    "paymentType": "FIRST_PAYMENT"
  }
}
```

## Summary of the v2.1 changes

- `order` is now called `orderDetails`
- `lineItems` is now a top-level element
