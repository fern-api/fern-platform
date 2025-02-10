import { OpenAPIV3_1 } from "openapi-types";
import { UnreachableCaseError } from "ts-essentials";

import { FernRegistry } from "../../../client/generated";
import {
  BaseOpenApiV3_1ConverterNode,
  BaseOpenApiV3_1ConverterNodeConstructorArgs,
} from "../../BaseOpenApiV3_1Converter.node";
import { XFernBasicAuthNode } from "../extensions/auth/XFernBasicAuth.node";
import { XFernBasicPasswordVariableNameConverterNode } from "../extensions/auth/XFernBasicPasswordVariableNameConverter.node";
import { XFernBasicUsernameVariableNameConverterNode } from "../extensions/auth/XFernBasicUsernameVariableNameConverter.node";
import { XFernBearerTokenConverterNode } from "../extensions/auth/XFernBearerTokenConverter.node";
import { XFernBearerTokenVariableNameConverterNode } from "../extensions/auth/XFernBearerTokenVariableNameConverter.node";
import { isInHeader } from "../guards/isInHeader";
import { HeaderSecuritySchemeConverterNode } from "./HeaderSecuritySchemeConverter.node";
import { OAuth2SecuritySchemeConverterNode } from "./OAuth2SecuritySchemeConverter.node";

export class SecuritySchemeConverterNode extends BaseOpenApiV3_1ConverterNode<
  OpenAPIV3_1.SecuritySchemeObject,
  FernRegistry.api.latest.AuthScheme
> {
  authScheme: "basic" | "bearer" | "oauth" | "header" | undefined;

  // Header auth
  headerAuthNode: HeaderSecuritySchemeConverterNode | undefined;

  // Bearer auth
  // x-fern-bearer
  bearerTokenNode: XFernBearerTokenConverterNode | undefined;
  // x-fern-token-variable-name
  bearerTokenVariableNameNode:
    | XFernBearerTokenVariableNameConverterNode
    | undefined;

  // Basic auth
  // x-fern-basic
  basicAuthNode: XFernBasicAuthNode | undefined;
  // x-fern-username-variable-name
  basicUsernameVariableNameNode:
    | XFernBasicUsernameVariableNameConverterNode
    | undefined;
  // x-fern-password-variable-name
  basicPasswordVariableNameNode:
    | XFernBasicPasswordVariableNameConverterNode
    | undefined;

  // OAuth2
  oauth2Node: OAuth2SecuritySchemeConverterNode | undefined;

  constructor(
    args: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.SecuritySchemeObject>
  ) {
    super(args);
    this.safeParse();
  }

  parse(): void {
    switch (this.input.type) {
      case "http":
        switch (this.input.scheme) {
          case "basic": {
            this.authScheme = "basic";
            this.basicAuthNode = new XFernBasicAuthNode({
              input: this.input,
              context: this.context,
              accessPath: this.accessPath,
              pathId: this.pathId,
            });
            this.basicUsernameVariableNameNode =
              new XFernBasicUsernameVariableNameConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: this.pathId,
              });
            this.basicPasswordVariableNameNode =
              new XFernBasicPasswordVariableNameConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: this.pathId,
              });

            if (
              this.basicAuthNode == null ||
              (this.basicAuthNode.username == null &&
                this.basicUsernameVariableNameNode?.usernameVariableName ==
                  null) ||
              (this.basicAuthNode.password == null &&
                this.basicPasswordVariableNameNode?.passwordVariableName ==
                  null)
            ) {
              this.context.errors.warning({
                message:
                  "Basic auth should specify either a username or a username variable name",
                path: this.accessPath,
              });
            }
            break;
          }
          case "bearer": {
            this.authScheme = "bearer";
            this.bearerTokenNode = new XFernBearerTokenConverterNode({
              input: this.input,
              context: this.context,
              accessPath: this.accessPath,
              pathId: this.pathId,
            });
            this.bearerTokenVariableNameNode =
              new XFernBearerTokenVariableNameConverterNode({
                input: this.input,
                context: this.context,
                accessPath: this.accessPath,
                pathId: this.pathId,
              });
            break;
          }
          default: {
            this.context.errors.warning({
              message: `Unsupported HTTP auth scheme: ${this.input.scheme}`,
              path: this.accessPath,
            });
            break;
          }
        }
        break;
      case "apiKey": {
        if (!isInHeader(this.input)) {
          this.context.errors.error({
            message: `Unsupported API key location: ${this.input.in}`,
            path: this.accessPath,
          });
        } else {
          this.authScheme = "header";
          this.headerAuthNode = new HeaderSecuritySchemeConverterNode({
            input: this.input,
            context: this.context,
            accessPath: this.accessPath,
            pathId: this.pathId,
          });
        }
        break;
      }
      case "oauth2": {
        this.authScheme = "oauth";
        this.oauth2Node = new OAuth2SecuritySchemeConverterNode({
          input: this.input,
          context: this.context,
          accessPath: this.accessPath,
          pathId: this.pathId,
        });
        break;
      }
      case "openIdConnect": {
        this.authScheme = "bearer";
        break;
      }
    }
  }

  convert(): FernRegistry.api.latest.AuthScheme | undefined {
    switch (this.authScheme) {
      case "basic": {
        const basicAuth = this.basicAuthNode?.convert();
        return {
          type: "basicAuth",
          usernameName:
            basicAuth?.username?.name ??
            this.basicUsernameVariableNameNode?.convert(),
          passwordName:
            basicAuth?.password?.name ??
            this.basicPasswordVariableNameNode?.convert(),
        };
      }
      case "bearer": {
        const bearerAuth = this.bearerTokenNode?.convert();
        return {
          type: "bearerAuth",
          tokenName:
            bearerAuth?.tokenVariableName ??
            this.bearerTokenVariableNameNode?.convert(),
        };
      }
      case "header": {
        return this.headerAuthNode?.convert();
      }
      case "oauth": {
        return this.oauth2Node?.convert();
      }
      case undefined:
        return undefined;
      default:
        new UnreachableCaseError(this.authScheme);
        return undefined;
    }
  }
}
