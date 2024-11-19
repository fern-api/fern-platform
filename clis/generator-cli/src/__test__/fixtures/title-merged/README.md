# Cohere Go Library

![](https://raw.githubusercontent.com/cohere-ai/cohere-typescript/5188b11a6e91727fdd4d46f4a690419ad204224d/banner.png)

[![fern shield](https://img.shields.io/badge/%F0%9F%8C%BF-SDK%20generated%20by%20Fern-brightgreen)](https://github.com/fern-api/fern)
[![go shield](https://img.shields.io/badge/go-docs-blue)](https://pkg.go.dev/github.com/cohere-ai/cohere-go)

The Cohere Go library provides convenient access to the Cohere API from Go.

## My custom title!!!

Instantiate the client with the following:

```go
import (
	fern "github.com/custom/fern"
	fernclient "github.com/custom/fern/client"
	option "github.com/custom/fern/option"
)

client := fernclient.NewClient(
	option.WithToken(
		"<YOUR_AUTH_TOKEN>",
	),
)
response, err := client.Chat(
	ctx,
	&fern.ChatRequest{
		Message: "Can you give me a global market overview of solar panels?",
	},
)
```

## My custom section!!

This is a custom section that should stay between the usage and contributing sections.

## Contributing

While we value open-source contributions to this SDK, this library is generated programmatically.
Additions made directly to this library would have to be moved over to our generation code,
otherwise they would be overwritten upon the next generated release. Feel free to open a PR as
a proof of concept, but know that we will not be able to merge it as-is. We suggest opening
an issue first to discuss with us!

On the other hand, contributions to the README are always very welcome!
