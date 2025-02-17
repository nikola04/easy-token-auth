import { JsonWebTokenError, NotBeforeError, TokenExpiredError, verify, decode } from "jsonwebtoken";
import { Credentials } from "@/types/credentials";
import { isAllowedAlgorithm } from "./algorithm";

export enum ValidatorErrors {
    InvalidToken = 'JWTInvalidToken',
    InvalidTokenStructure = "InvalidTokenStructure",
    TokenExpired = 'JWTTokenExpired',
    TokenNotActive = 'JWTTokenNotActive',
    InvalidAlgorithm = 'JWTInvalidAlgorithm',
    InvalidSecretOrKey = 'JWTInvalidSecretOrKey'
}

export const createTokenValidatorDecoder = (getCredentialsById: (id: string) => Credentials|null) => {
    return {
        validate: createTokenValidator(getCredentialsById),
        decode: createTokenDecoder()
    }
}

const createTokenDecoder = () => {
    return (token: string) => {
        const decoded = decode(token, { complete: true });
        if (!decoded || typeof decoded !== 'object') {
            throw ValidatorErrors.InvalidTokenStructure;
        }
        const payload = decoded.payload as { credentials_id?: string, data?: any };
        if (!payload.credentials_id || !payload.data)
            throw ValidatorErrors.InvalidTokenStructure;
        return payload.data;
    }
}

const createTokenValidator = (getCredentialsById: (id: string) => Credentials|null) => {
    return (token: string) => {
        const credentialsId = getTokenCredentialsId(token);
        const credentials = getCredentialsById(credentialsId);
        if(!credentials) throw ValidatorErrors.TokenExpired;
        try{
            const algorithm = credentials.algorithm;
            if(!isAllowedAlgorithm(algorithm)) throw ValidatorErrors.InvalidAlgorithm
            const decoded = verify(token, credentials.publicKey, { algorithms: [algorithm] })
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
                if (err instanceof TokenExpiredError)
                    throw ValidatorErrors.TokenExpired;
                if (err instanceof NotBeforeError)
                    throw ValidatorErrors.TokenNotActive;
                throw ValidatorErrors.InvalidToken; // Generic error - invalid token
            }
            throw ValidatorErrors.InvalidToken;
        }
    }
}

function getTokenCredentialsId(token: string){
    const decoded = decode(token, { complete: true });
    if (!decoded || typeof decoded !== 'object') {
        throw ValidatorErrors.InvalidTokenStructure;
    }
    const payload = decoded.payload as { credentials_id?: string };
    const credentialsId = payload.credentials_id;
    if (!credentialsId)
        throw ValidatorErrors.InvalidTokenStructure;
    return credentialsId;
}