import { Credentials } from "types/credentials";
import { JsonWebTokenError, sign, TokenExpiredError } from "jsonwebtoken"
import { Config, TokenConfig } from "types/tokens";

export enum GeneratorErrors{
    TokenExpiredError = 'JWTExpiredToken',
    InvalidAlgorithm = 'JWTInvalidAlgorithm',
    InvalidSecretOrKey = 'JWTInvalidSecretOrKey'
}

const generateJWT = (credentials: Credentials, config: TokenConfig) => {
    const expiry = config.expiry;
    return (data: any) => {
        try{
            const token = sign({ data }, credentials.privateKey, { algorithm: credentials.algorithm, expiresIn: expiry })
            return token;
        }catch(err){
            if(err instanceof JsonWebTokenError){
                if (err.message.includes('invalid algorithm')) {
                    throw GeneratorErrors.InvalidAlgorithm;
                } else if (err.message.includes('secretOrPrivateKey must have a value')) {
                    throw GeneratorErrors.InvalidSecretOrKey;
                }
            }
            if(err instanceof TokenExpiredError) 
                throw GeneratorErrors.TokenExpiredError
        }
    }
}

export const createTokenGenerators = (credentials: Credentials, config: Config) => {
    return ({
        access: generateJWT(credentials, config.access_token),
        refresh: generateJWT(credentials, config.refresh_token)
    })
}