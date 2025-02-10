import { Credentials } from "types/credentials"
import { Config } from "types/tokens"
import { createTokenGenerators, GeneratorErrors, hashRefreshTokenData } from "./generation/generate";
import { createTokenValidatorDecoder, ValidatorErrors } from "./validation/validate";

/**
 * Create auth handler and register asymetric keys
 * @param credentials generated private and public key
 * @returns Functions for token validation and generation, express middlewares
 */
export const createAuthHandler = (credentials: Credentials, _config: Partial<Config> = {}) => {
    const config: Config = getFinalTokensConfig(_config);
    const generateToken = createTokenGenerators(credentials, config);
    const verifyDecodeToken = createTokenValidatorDecoder(credentials);
    return ({
        generateAccessToken: generateToken.access,
        generateRefreshToken: generateToken.refresh,
        verifyAndDecodeToken: verifyDecodeToken
    })
}

export {
    hashRefreshTokenData,
    GeneratorErrors,
    ValidatorErrors
}

function getFinalTokensConfig(config: Partial<Config>): Config{
    const defaultConfig = getDefaultTokensConfig()
    return ({
        access_token: {
            ...defaultConfig.access_token,
            ...config.access_token
        },
        refresh_token: {
            ...defaultConfig.refresh_token,
            ...config.refresh_token
        }
    })
}

function getDefaultTokensConfig(): Config{
    return ({
        access_token: {
            expiry: 3600 // 1h
        },
        refresh_token: {
            expiry: 3600 * 24 * 90 // 90days
        }
    })
}