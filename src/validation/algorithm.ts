import { algorithm } from "@/types/credentials";

const allowedAlgorithms = [
    'ES256', 'ES384', 'ES512',
    'PS256', 'PS384', 'PS512',
    'RS256', 'RS384', 'RS512',
] as const;

export const isAllowedAlgorithm = (alg: string): alg is algorithm => {
    return (allowedAlgorithms as readonly string[]).includes(alg)
}