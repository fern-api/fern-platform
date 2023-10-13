## Status Codes

The following table summarizes the HTTP response codes you may receive from
the Primer REST API.

| Status Code | Description             |
| ----------- | ----------------------- |
| `200`       | Success                 |
| `400`       | Bad Request             |
| `401`       | Unauthorized            |
| `403`       | Forbidden               |
| `404`       | Entity Not Found        |
| `409`       | Entity Already Exists   |
| `422`       | Input Validation Failed |

## Error Responses

Primer uses conventional HTTP response codes to indicate the success or failure of an API request. HTTP codes in the `2XX` range indicate a successful request, whereas codes in the `4XX` range indicate a failed request usually due to invalid inputs or operations.

The format of the payload for all errors is common. When an unsuccessful request occurs, you will receive a payload in the following format:

```json
{
  "error": {
    "errorId": "AnErrorId",
    "description": "A human description of the error.",
    "diagnosticsId": "1234567890",
    "validationErrors": []
  }
}
```

All error payloads will be comprised of a unique `errorId` which you can use to identify the error, a human description `description`, and a `diagnosticsId` that you can quote when contacting the support team ([support@primer.io](mailto:support@primer.io)). In case of a badly formed request, Primer will also return additional `validationErrors`.

## Payment Status

As the payments are created, processed, and finalised, they go through a number of states that you will get as an API response, through webhook notifications, and in the Dashboard. These states are used across all processors, as processor specific states are mapped to these. An additional message, in the field `processorMessage`, from the processor may also be included that details the reason for the state, primarily on failure states.

| Status              | Description                                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PENDING`           | The payment has been created by Primer but not yet authorized.                                                                                      |
| `FAILED`            | The processor failed to process this payment.                                                                                                       |
| `AUTHORIZED`        | The payment is authorized and awaiting capture.                                                                                                     |
| `SETTLING`          | The payment has been submitted for settlement and funds will be settled later.                                                                      |
| `PARTIALLY_SETTLED` | The payment has been partially settled.                                                                                                             |
| `SETTLED`           | Funds have been settled into your account.                                                                                                          |
| `DECLINED`          | This payment was declined by the processor, either at a gateway or acquirer level. See the reason object in your response payload for more details. |
| `CANCELLED`         | The payment was cancelled prior to it being settled.                                                                                                |

Don't hesitate to reach out with any questions or feedback. You can email Primer directly at [support@primer.io](mailto:support@primer.io), or contact your Primer account manager.
