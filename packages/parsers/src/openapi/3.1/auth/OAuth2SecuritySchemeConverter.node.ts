import { OpenAPIV3_1 } from "openapi-types";
import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { getEndpointId } from "../../utils/getEndpointId";
import { XFernAccessTokenLocatorConverterNode } from "../extensions/auth/XFernAccessTokenLocatorConverter.node";
import { HeaderSecuritySchemeConverterNode } from "./HeaderSecuritySchemeConverter.node";

export class OAuth2SecuritySchemeConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.OAuth2SecurityScheme,
  FernRegistry.api.latest.AuthScheme
> {
  authorizationUrl: string | undefined;

  headerAuthNode: HeaderSecuritySchemeConverterNode | undefined;

  accessTokenLocatorNode: XFernAccessTokenLocatorConverterNode | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.OAuth2SecurityScheme>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    if (this.input.flows.clientCredentials != null) {
      const clientCredentialsFlow = this.input.flows.clientCredentials;
      this.authorizationUrl = clientCredentialsFlow.tokenUrl;

      if (this.authorizationUrl == null) {
        this.context.errors.error({
          message: "Expected 'tokenUrl' property to be specified",
          path: this.accessPath,
        });
      }

      this.headerAuthNode = new HeaderSecuritySchemeConverterNode({
        input: this.input,
        context: this.context,
        accessPath: this.accessPath,
        pathId: this.pathId,
      });
      this.accessTokenLocatorNode = new XFernAccessTokenLocatorConverterNode({
        input: this.input,
        context: this.context,
        accessPath: this.accessPath,
        pathId: this.pathId,
      });

      if (this.authorizationUrl == null) {
        this.context.errors.error({
          message: "Expected 'tokenUrl' property to be specified",
          path: this.accessPath,
        });
      }

      if (this.accessTokenLocatorNode?.accessTokenLocator == null) {
        this.context.errors.error({
          message:
            "Expected 'x-fern-access-token-locator' property to be specified",
          path: this.accessPath,
        });
      }
    }
  }

  convert(): FernRegistry.api.latest.AuthScheme | undefined {
    const accessTokenLocator = this.accessTokenLocatorNode?.convert();
    if (accessTokenLocator == null || this.authorizationUrl == null) {
      return {
        type: "bearerAuth",
        tokenName: undefined,
      };
    }

    // TODO: revisit this -- this is not correct
    const endpointId = getEndpointId({
      namespace: undefined,
      path: this.authorizationUrl,
      method: "POST",
      sdkMethodName: undefined,
      operationId: undefined,
      displayName: undefined,
      isWebhook: undefined,
    });
    if (endpointId == null) {
      return undefined;
    }

    return {
      type: "oAuth",
      value: {
        type: "clientCredentials",
        value: {
          type: "referencedEndpoint",
          endpointId: FernRegistry.EndpointId(endpointId),
          accessTokenLocator: FernRegistry.JqString(accessTokenLocator),
          headerName: this.headerAuthNode?.convert()?.headerWireValue,
          tokenPrefix: this.headerAuthNode?.convert()?.prefix,
        },
      },
    };
  }
}
