/**
 * This file was auto-generated by Fern from our API Definition.
 */
import * as FernRegistry from "../../../../../../../index";
export declare type ApiNavigationConfigItem = FernRegistry.docs.v1.write.ApiNavigationConfigItem.Subpackage | FernRegistry.docs.v1.write.ApiNavigationConfigItem.EndpointId | FernRegistry.docs.v1.write.ApiNavigationConfigItem.WebsocketId | FernRegistry.docs.v1.write.ApiNavigationConfigItem.WebhookId | FernRegistry.docs.v1.write.ApiNavigationConfigItem.Page;
export declare namespace ApiNavigationConfigItem {
    interface Subpackage extends FernRegistry.docs.v1.write.ApiNavigationConfigSubpackage {
        type: "subpackage";
    }
    interface EndpointId {
        type: "endpointId";
        value: FernRegistry.EndpointId;
    }
    interface WebsocketId {
        type: "websocketId";
        value: FernRegistry.WebSocketId;
    }
    interface WebhookId {
        type: "webhookId";
        value: FernRegistry.WebhookId;
    }
    interface Page extends FernRegistry.docs.v1.write.PageMetadata {
        type: "page";
    }
}
