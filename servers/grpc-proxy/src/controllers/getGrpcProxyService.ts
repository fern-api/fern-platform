import { ProxyService } from "../generated/api";

export function getGrpcProxyService(): ProxyService {
    return new ProxyService({
        grpc: async (req, res) => {
            return res.send({});
        },
    });
}
