import { JsonWebTokenError, NotBeforeError, TokenExpiredError, verify } from "jsonwebtoken";
import { Credentials } from "types/credentials";

export enum ValidatorErrors {
    InvalidToken = 'JWTInvalidToken',
    InvalidTokenStructure = "InvalidTokenStructure",
    TokenExpired = 'JWTTokenExpired',
    TokenNotActive = 'JWTTokenNotActive',
    InvalidAlgorithm = 'JWTInvalidAlgorithm',
    InvalidSecretOrKey = 'JWTInvalidSecretOrKey'
}

export const createTokenValidatorDecoder = (credentials: Credentials) => {
    return (token: string) => {
        try{
            const decoded = verify(token, credentials.publicKey)
            if (decoded && typeof decoded === 'object' && 'data' in decoded) {
                const data = decoded.data;
                return data;
            } 
            throw ValidatorErrors.InvalidTokenStructure
        }catch(err){
            if (err instanceof JsonWebTokenError) {
                if (err.message.includes('invalid algorithm')) {
                    throw ValidatorErrors.InvalidAlgorithm;
                } else if (err.message.includes('secret or public key must be provided'))
                    throw ValidatorErrors.InvalidSecretOrKey;
                throw ValidatorErrors.InvalidToken; // Generic error - invalid token
            }

            if (err instanceof TokenExpiredError)
                throw ValidatorErrors.TokenExpired;
            if (err instanceof NotBeforeError)
                throw ValidatorErrors.TokenNotActive;

            return null;
        }
    }
}