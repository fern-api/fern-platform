import { AuthenticationClient, JSONApiResponse, TokenSet } from "auth0";

export class Auth0 {
    private client: AuthenticationClient;
    private audience: string;

    private accessToken: string | undefined;
    private refreshToken: string | undefined;
    private expiresAt: Date;

    constructor({
        domain,
        clientId,
        clientSecret,
        audience,
    }: {
        domain: string;
        clientId: string;
        clientSecret: string;
        audience: string;
    }) {
        this.client = new AuthenticationClient({
            domain,
            clientId,
            clientSecret,
        });
        this.audience = audience;
        this.expiresAt = new Date();
    }

    private processTokenSet(tokenSet: JSONApiResponse<TokenSet>) {
        this.accessToken = tokenSet.data.access_token;
        this.expiresAt = this.getExpiresAt(tokenSet.data.expires_in);
        this.refreshToken = tokenSet.data.refresh_token;
    }

    private async getAccessToken(): Promise<string> {
        const tokenSet = await this.client.oauth.clientCredentialsGrant({ audience: this.audience });
        this.processTokenSet(tokenSet);

        return tokenSet.data.access_token;
    }

    private async refreshAccessToken(): Promise<string> {
        if (this.refreshToken == null) {
            return await this.getAccessToken();
        }

        const tokenSet = await this.client.oauth.refreshTokenGrant({ refresh_token: this.refreshToken });
        this.processTokenSet(tokenSet);
        return tokenSet.data.access_token;
    }

    public async token(): Promise<string> {
        if (this.accessToken == null || new Date() > this.expiresAt) {
            return await this.refreshAccessToken();
        }
        return this.accessToken;
    }

    private getExpiresAt(expiresInSeconds: number): Date {
        const now = new Date();
        const bufferInMinutes = 2;
        return new Date(now.getTime() + expiresInSeconds * 1000 - bufferInMinutes * 60 * 1000);
    }
}
