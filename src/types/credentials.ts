type algorithm = 'ES256'|'ES384'|'ES512'|'PS256'|'PS384'|'PS512'|'RS256'|'RS384'|'RS512'

export type Credentials = {
    privateKey: string;
    publicKey: string;
    algorithm: algorithm
};