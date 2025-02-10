export type TokenConfig = {
    expiry: number
}
export type Config = {
    access_token: TokenConfig,
    refresh_token: TokenConfig
}