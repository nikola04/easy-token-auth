import { Credentials } from "types/credentials";
import { createAuthHandler, hashRefreshTokenData } from "..";

describe('Generating Refresh Token', () => {
	it('should generate & verify refresh token', async () => {
        const handler = createAuthHandler(credentials)
		const { jwt, token, hashedToken } = handler.generateRefreshToken()
		const data = handler.verifyAndDecodeToken(jwt);
        expect(data).toBe(token)
        expect(hashRefreshTokenData(token) == hashedToken).toBe(true);
	});
    ///To Do
	// it('should give invalid refresh token status', async () => {
	// });
	// it('should give expired refresh token status', async () => {
	// });
});



const credentials: Credentials = {
    privateKey: `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1kFJ027myeVvO65qGfi52D0Dzl47FHzKHQ2dUt9FT/+PM/1M
eEQ7pMYL3zlfB2jCtXTE5fRC72HqHhL/nY/UiaZEdJZa0Fke238qGRYWTa3nPxA2
Ys8qU1ZptKxH+7lsasFRUn0dZKlzmMbKpbf7fmWxJ0eex4tWCjOzarOevaXu/bhF
Yr7FQ+9t0q2bcfCp3312mM3cWSe0LVnPP60leASBCJpwtw0ZXrzORY7QJ6fn1N5a
5zkYLKLN14PD8tTp7m88csXZD633y0mP5aReD5/Vwhw6CRWShrYjo2aoQbkYpkh9
oHqAEmPXbVyb1c884rNqvvS8zP8OkwBTBWpC/wIDAQABAoIBAAw5P1gDvMEKCPWT
ttPyf8/Zc00jzSUXFYTg0Pf4awDsaKQjsGgwJGL7NZQvtr86d9lYZx9jdyonIO9E
UDcSDKMpzEAGj/nRC9SkBafWvcECye2sJB4xCY4loPRA2/59jrTsgJI/Nx0WGdU+
ijM4Mu38KUY/bMyfo3IDjxnoU4coRKGr9yghq3wa+iamPR4g8ZqL4OaFxrF80IZX
wELSG44ZnZcm0v7A+xezfdzeHGhhpF/cMXBaZoB5jHTPZMlkGupvAGe3WZT9k+BL
p/jkc6P8CFB/6VSWbFcSvMcSJBlHbmgOlDbMRc2LE8/jCvteB+B9QiJrs8TD7otn
Vecs+/kCgYEA9Jk0xuBpvkBis1clWMXhu184XymC7B8JrrewTjFVjBpvo9UfDUBY
e49Ft9lO0+TKX1IX/3d8KqZQqjI3ExeDG62VGfB17EHCAuCNYhoucDp4TeZtF6Pm
1XaXDUxyeIoC7447rR15wK/W2qNuTjY/Qcqu3zAheo+ypF5I/FlSunUCgYEA4D3+
eTsAOPErNpI8nqrSWzGi3IZ09nCDoFKE+DgDfskzYzU71zPiBVrku+JbsiVIs5xp
ShOpA4Lk3qyiyDgILp5iZWvNnGZ01RaWF7XuzmBNgnsyrAyaPMoS6Qb9R+0l/U9N
6JYj95wAz2W0Ufok4YUTxUxJNx2eWWiN5Qy1ESMCgYEAvBbD+tq+9cnVHEu7MFSa
jNdgJe1p++CyNWSTcs2FF0OM7dMJGcuNPxahagr1DwQ0irA6O/zJwpI6HWaX61p9
O19z9IpwY8j9Q/EhR3sSksKjmGPFKBSlgSi8Z0GOFRsrvsMFKM4tvfp5oY9jV0ln
w1P0vTPpyrGNkc/fGA4oC7ECgYEAsYRCNGRhu7InnG7N8GmYVzsHC36hjwnpGXzZ
6Mom8jKDLLFSqv1WmximZJpALtnXIODcdRj1PmNbnW+a+ddpmsYlbNaXkY2GRb44
mZKb9uJD2dx/c7YST7dEmxa+YTc6ULp8GXjqBjWIaqa/xfm5QpKf4RuQBkK7PVpI
oh+aI3MCgYB5V+ZDQwXchdxy/qoEsp2xA0uUW6ewU4o0oC4C48QhsLBEjbOsP1u5
z4/0UX11222SrM46Daf62kYWyKZ/cW/0Fz6ediZbrbcxV+Mt3/TZCSqlLXA8PSsy
rrsNesglo5h+v3in3m8QESiZUSRV8gRaTKNOoPc5O50lIdkBeDKgRg==
-----END RSA PRIVATE KEY-----`,
    publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1kFJ027myeVvO65qGfi5
2D0Dzl47FHzKHQ2dUt9FT/+PM/1MeEQ7pMYL3zlfB2jCtXTE5fRC72HqHhL/nY/U
iaZEdJZa0Fke238qGRYWTa3nPxA2Ys8qU1ZptKxH+7lsasFRUn0dZKlzmMbKpbf7
fmWxJ0eex4tWCjOzarOevaXu/bhFYr7FQ+9t0q2bcfCp3312mM3cWSe0LVnPP60l
eASBCJpwtw0ZXrzORY7QJ6fn1N5a5zkYLKLN14PD8tTp7m88csXZD633y0mP5aRe
D5/Vwhw6CRWShrYjo2aoQbkYpkh9oHqAEmPXbVyb1c884rNqvvS8zP8OkwBTBWpC
/wIDAQAB
-----END PUBLIC KEY-----`,
    algorithm: 'RS256'
}