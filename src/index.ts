// Copyright 2025 Nikola Nedeljkovic
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Credentials } from "./types/credentials"
import { Config } from "./types/tokens"
import { createTokenGenerators, GeneratorErrors } from "./generation/tokens";
import { createTokenValidatorDecoder, ValidatorErrors } from "./validation/token";
import { addCredentials } from "./utils/credentials";

/**
 * Create an authentication handler and register asymmetric keys for token operations.
 * 
 * This function generates and registers the necessary key pairs for signing and verifying 
 * JWT tokens using the provided asymmetric keys (public and private). It returns middleware 
 * functions for token validation and generation, which can be used in Express.js applications.
 * 
 * @param credentials - The credentials containing the public and private keys used 
 * for signing and verifying JWT tokens.
 * @param _config - Optional configuration object for token settings (e.g., expiration).
 * If not provided, default configurations are used.
 * - `access_token`: Configuration for access tokens.
 * - - `expiry`: The expiration time for access tokens in seconds (default: 3600).
 * - `refresh_token`: Configuration for refresh tokens.
 * - - `expiry`: The expiration time for refresh tokens in seconds (default: 7776000).
 * - `credentials_limit`: The maximum number of rolled credentials to store in memory (default: 10).
 * 
 * @returns An object with the following methods:
 *   - `generateAccessToken`: A function to generate access tokens.
 *   - `generateRefreshToken`: A function to generate refresh tokens.
 *   - `verifyAndDecodeToken`: A function to verify and decode JWT tokens.
 */
export const createAuthHandler = (config: Partial<Config> = {}) => {
    const _config: Config = getFinalTokensConfig(config);
    const credentialsMap: Map<string, Credentials> = new Map();
    const credentialsList: string[] = [];
    const generateToken = createTokenGenerators(_config, () => {
        const lastId = credentialsList[credentialsList.length - 1];
        return credentialsMap.get(lastId) || null;
    });
    const verifyDecodeToken = createTokenValidatorDecoder((id: string) => credentialsMap.get(id) || null);
    return ({
        setCredentials: (credentials: Credentials) => addCredentials(credentialsMap, credentialsList, credentials, _config.credentials_limit),
        generateAccessToken: generateToken.access,
        generateRefreshToken: generateToken.refresh,
        verifyAndDecodeToken: verifyDecodeToken.validate,
        decodeToken: verifyDecodeToken.decode
    })
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
        },
        // if user config is less than 1 or not provided, use default
        credentials_limit: (config?.credentials_limit && config.credentials_limit > 0) ? config.credentials_limit : defaultConfig.credentials_limit
    })
}

function getDefaultTokensConfig(): Config{
    return ({
        access_token: {
            expiry: 3600 // 1h
        },
        refresh_token: {
            expiry: 3600 * 24 * 90 // 90days
        },
        credentials_limit: 10
    })
}

export { generateCredentials } from './generation/keys'
export { hashRefreshTokenData } from './generation/tokens'
export { Config } from './types/tokens'
export { Credentials } from './types/credentials'

export {
    GeneratorErrors,
    ValidatorErrors
}