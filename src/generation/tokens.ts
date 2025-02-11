import { JsonWebTokenError, sign, TokenExpiredError } from "jsonwebtoken"
import { Config, TokenConfig } from "@/types/tokens";
import crypto from "crypto"
import { Credentials } from "@/types/credentials";

export enum GeneratorErrors{
    TokenExpiredError = 'JWTExpiredToken',
    InvalidAlgorithm = 'JWTInvalidAlgorithm',
    InvalidKey = 'JWTInvalidKey',
    SignError = 'JWTSignError'
}

const createJWTGenerator = (config: TokenConfig, lastCredential: () => Credentials|null) => {
    const expiry = config.expiry;
    return (data: any): string => {
        try{
            const credentials = lastCredential();
            if(!credentials) throw GeneratorErrors.InvalidKey;
            const token = sign({ data, credentials_id: credentials.id }, credentials.privateKey, { algorithm: credentials.algorithm, expiresIn: expiry })
            return token;
        }catch(err){
            if(err instanceof JsonWebTokenError){
                if (err.message.includes('invalid algorithm')) {
                    throw GeneratorErrors.InvalidAlgorithm;
                } else if (err.message.includes('secretOrPrivateKey must have a value')) {
                    throw GeneratorErrors.InvalidKey;
                }
            }
            if(err instanceof TokenExpiredError) 
                throw GeneratorErrors.TokenExpiredError
            // console.error(err)
            throw GeneratorErrors.SignError
        }
    }
}

function generateRefreshToken(config: TokenConfig, lastCredential: () => Credentials|null) {
	const { token, hashedToken } = generateRefreshTokenData();
    const generator = createJWTGenerator(config, lastCredential);
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

export const createTokenGenerators = (config: Config, lastCredential: () => Credentials|null) => {
    return ({
        access: createJWTGenerator(config.access_token, lastCredential),
        refresh: generateRefreshToken(config.refresh_token, lastCredential)
    })
}