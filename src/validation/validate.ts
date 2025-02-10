import { JsonWebTokenError, NotBeforeError, TokenExpiredError, verify } from "jsonwebtoken";
import { Credentials } from "types/credentials";

export enum ValidationErrors {
    InvalidToken = 'JWTInvalidToken',
    TokenExpired = 'JWTTokenExpired',
    TokenNotActive = 'JWTTokenNotActive',
    InvalidAlgorithm = 'JWTInvalidAlgorithm',
    InvalidSecretOrKey = 'JWTInvalidSecretOrKey'
}

export const createTokenValidatorDecoder = (credentials: Credentials) => {
    return (token: string) => {
        try{
            const decoded = verify(token, credentials.publicKey)
            return decoded;
        }catch(err){
            if (err instanceof JsonWebTokenError) {
                if (err.message.includes('invalid algorithm')) {
                    throw ValidationErrors.InvalidAlgorithm;
                } else if (err.message.includes('secret or public key must be provided'))
                    throw ValidationErrors.InvalidSecretOrKey;
                throw ValidationErrors.InvalidToken; // Generic error - invalid token
            }

            if (err instanceof TokenExpiredError)
                throw ValidationErrors.TokenExpired;
            if (err instanceof NotBeforeError)
                throw ValidationErrors.TokenNotActive;

            return null;
        }
    }
}