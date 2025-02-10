import { Credentials } from "@/types/credentials";
import { JsonWebTokenError, sign, TokenExpiredError } from "jsonwebtoken"
import { Config, TokenConfig } from "@/types/tokens";
import crypto from "crypto"

export enum GeneratorErrors{
    TokenExpiredError = 'JWTExpiredToken',
    InvalidAlgorithm = 'JWTInvalidAlgorithm',
    InvalidSecretOrKey = 'JWTInvalidSecretOrKey',
    SignError = 'JWTSignError'
}

const createJWTGenerator = (credentials: Credentials, config: TokenConfig) => {
    const expiry = config.expiry;
    return (data: any): string => {
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
            // console.error(err)
            throw GeneratorErrors.SignError
        }
    }
}

function generateRefreshToken(credentials: Credentials, config: TokenConfig) {
	const { token, hashedToken } = generateRefreshTokenData();
    const generator = createJWTGenerator(credentials, config);
    return () => ({ jwt: generator(token), token, hashedToken })
}

function generateRefreshTokenData() {
	const token = crypto.randomBytes(64).toString('hex');
    const hashedToken = hashRefreshTokenData(token)
	return ({ token, hashedToken });
}

export function hashRefreshTokenData(token: string){
    return crypto.createHash('sha256').update(token).digest('hex')
}

export const createTokenGenerators = (credentials: Credentials, config: Config) => {
    return ({
        access: createJWTGenerator(credentials, config.access_token),
        refresh: generateRefreshToken(credentials, config.refresh_token)
    })
}