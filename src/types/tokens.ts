export type TokenConfig = {
    expiry: number
}
export type Config = {
    default: TokenConfig,
    access_token: TokenConfig,
    refresh_token: TokenConfig,
    credentials_limit: number
}
