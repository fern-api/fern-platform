import { ProxyService } from "../generated/api/resources/proxy/service/ProxyService";
import { proxyGrpc } from "./proxyGrpc";

export function getGrpcProxyService(): ProxyService {
    return new ProxyService({
        grpc: async (req, res) => {
            const response = await proxyGrpc({
                request: req.body,
            });
            return res.send(response);
        },
    });
}
