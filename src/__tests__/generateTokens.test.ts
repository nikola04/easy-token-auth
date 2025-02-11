import { createAuthHandler, generateCredentials, GeneratorErrors, hashRefreshTokenData, ValidatorErrors } from "..";

describe('Auth Handler Functionality', () => {
    it('should generate & verify refresh token', async () => {
        const credentials = generateCredentials('RS512', 'low');
        const handler = createAuthHandler();
        handler.setCredentials(credentials);
        const { jwt, token, hashedToken } = handler.generateRefreshToken();
        const data = handler.verifyAndDecodeToken(jwt);
        expect(data).toBe(token);
        expect(hashRefreshTokenData(token) === hashedToken).toBe(true);
    });

    it('should generate & verify access token', async () => {
        const credentials = generateCredentials('ES384');
        const handler = createAuthHandler();
        handler.setCredentials(credentials);
        const jwt = handler.generateAccessToken({ userId: 123, role: 'admin' });
        const data = handler.verifyAndDecodeToken(jwt);
        expect(data.userId).toBe(123);
        expect(data.role).toBe('admin');
    });

    it('should handle invalid refresh token structure', async () => {
        const credentials = generateCredentials('ES512', 'high');
        const handler = createAuthHandler();
        handler.setCredentials(credentials);
        const fakeToken = 'invalidToken';
        expect(() => handler.verifyAndDecodeToken(fakeToken)).toThrow(ValidatorErrors.InvalidTokenStructure);
    });

    it('should handle expired token', async () => {
        const credentials = generateCredentials('RS256', 'low');
        const handler = createAuthHandler({ access_token: { expiry: -1 }, refresh_token: { expiry: -1 }}); // Simulating an expired token
        handler.setCredentials(credentials);
        const ajwt = handler.generateAccessToken({ userId: 123 });
        const { jwt: rjwt } = handler.generateRefreshToken();
        expect(() => handler.verifyAndDecodeToken(ajwt)).toThrow(ValidatorErrors.TokenExpired)
        expect(() => handler.verifyAndDecodeToken(rjwt)).toThrow(ValidatorErrors.TokenExpired)
    });

    it('should allow rerolling keys without invalidating existing tokens', async () => {
        const credentials1 = generateCredentials('ES256');
        const credentials2 = generateCredentials('ES384');
        const credentials3 = generateCredentials('RS256', 'low');

        const handler = createAuthHandler();
        handler.setCredentials(credentials1); // initial keys

        const jwt1 = handler.generateAccessToken({ userId: 456 });

        handler.setCredentials(credentials2); // new keys

        const data = handler.verifyAndDecodeToken(jwt1);
        expect(data.userId).toBe(456);

        handler.setCredentials(credentials3); // new keys

        const jwt2 = handler.generateAccessToken({ userId: 789 });
        const newData = handler.verifyAndDecodeToken(jwt2); // verify new one
        expect(newData.userId).toBe(789);
        const firstData = handler.verifyAndDecodeToken(jwt1); // verify old one again
        expect(firstData.userId).toBe(456);
    });
});
