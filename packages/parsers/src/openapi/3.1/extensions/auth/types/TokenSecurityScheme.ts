export interface TokenSecurityScheme {
    name?: string;
    env?: string;
}

export interface HeaderTokenSecurityScheme extends TokenSecurityScheme {
    prefix?: string;
}
