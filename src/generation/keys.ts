import crypto from 'crypto';
import { Credentials } from '@/types/credentials';
import { generateKeyPairSync } from 'crypto';

export type RSAAlgorithm = 'RS256'|'RS384'|'RS512'
export type ECDSAAlgorithm = 'ES256'|'ES384'|'ES512'
export type KeySize = 'low'|'medium'|'high'

/**
 * Generate credentials with an RSA or ECDSA key pair.
 * @param algorithm - The algorithm to use for key generation. Choose between:
 *   - 'RS256', 'RS384', 'RS512' (RSA)
 *   - 'ES256', 'ES384', 'ES512' (ECDSA)
 * @param keySize - The desired key size, affecting security and performance:
 *   - 'low': For general use with moderate security. RSA modulus is 2048 bits, ECDSA curve is prime256v1.
 *   - 'medium': For more secure key generation with a balance of performance. RSA modulus is 3072 bits, ECDSA curve is secp384r1.
 *   - 'high': For highly secure key generation, at the cost of performance. RSA modulus is 4096 bits, ECDSA curve is secp521r1.
 * Important for ECDSA: Key size must match algorithm, otherwise an error will be thrown. for e.g. 'ES256' algorithm must have 'low' key size.
 * 
 * @returns A credentials object containing a public and private key pair for the selected algorithm.
 */
export const generateCredentials = (algorithm: RSAAlgorithm|ECDSAAlgorithm, keySize: KeySize|null = null): Credentials => {
    if(keySize === null) {
        if(algorithm.startsWith('RS')) keySize = 'medium';
        else keySize = ecdsaSizeMap[algorithm as ECDSAAlgorithm];
    }else if(isECDSAAlgorithm(algorithm) && keySize !== ecdsaSizeMap[algorithm]) throw new Error(`Invalid key size for algorithm ${algorithm}, please use ${ecdsaSizeMap[algorithm]}`);
    const id = crypto.randomBytes(16).toString('hex');
    const keyGenerator = keyGenerators[algorithm];
    const { privateKey, publicKey } = keyGenerator(keySize);
    return ({
        id,
        algorithm,
        privateKey,
        publicKey
    });
}

interface KeyGenerator{
    (keySize: KeySize): { publicKey: string; privateKey: string }
}

const generateRSAKeys: KeyGenerator = (complexity: KeySize) => {
    let modulus = 2048;
    if(complexity === 'medium') modulus = 3072;
    if(complexity === 'high') modulus = 4096;
    return generateKeyPairSync('rsa', {
        modulusLength: modulus,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
    });
}

const generateECDSAKeys: KeyGenerator = (complexity: KeySize) => {
    let curve = 'prime256v1';
    if(complexity === 'medium') curve = 'secp384r1';
    if(complexity === 'high') curve = 'secp521r1';
    return generateKeyPairSync('ec', {
        namedCurve: curve,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
        },
    });
}

const keyGenerators: Record<RSAAlgorithm|ECDSAAlgorithm, KeyGenerator> = {
    'RS256': generateRSAKeys,
    'RS384': generateRSAKeys,
    'RS512': generateRSAKeys,
    'ES256': generateECDSAKeys,
    'ES384': generateECDSAKeys,
    'ES512': generateECDSAKeys,
}

export const isECDSAAlgorithm = (algorithm: string): algorithm is ECDSAAlgorithm => {
    const validAlgorithms: ECDSAAlgorithm[] = ['ES256', 'ES384', 'ES512'];
    return validAlgorithms.includes(algorithm as ECDSAAlgorithm);
}

const ecdsaSizeMap: Record<ECDSAAlgorithm, KeySize> = {
    'ES256': 'low',
    'ES384': 'medium',
    'ES512': 'high',
}