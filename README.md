# Easy Token Auth
Implement Token Authentication into your project easily<br />

This is developed as a wrapper for `jsonwebtoken`


# Install
npm:
```
$ npm i easy-token-auth
```

# Usage Example

utils/auth.ts
```
import { createAuthHandler } from "easy-token-auth";

const authHandler = createAuthHandler()
const credentials = generateCredentials('ES384')
authHandler.setCredentials(credentials)

cron.schedule('0 0 */7 * *', () => { // optional
    const credentials = generateCredentials('ES384')
    authHandler.setCredentials(credentials) // generate and set new key pair every 7 days
});

export authHandler
```

/api/login.ts
```
import { authHandler } from 'utils/auth'

router.post("/", async (req: Request, res: Response) => {
    const userId = USER_ID
    try{
        const accessJWT = authHandler.generateAccessToken(userId);
        const { hashedToken, jwt: refreshJWT } = authHandler.generateRefreshToken();
        // STORE hashedToken WITH userId IN DATABASE
        // STORE refreshJWT IN USER DEVICE SAFELY -> Example: httpOnly Cookie
        // STORE accessJWT IN USER DEVICE
    }catch(err){
        ...
    }
})
```

/api/refresh.ts
```
import { authHandler } from 'utils/auth';
import { hashRefreshToken } from 'easy-token-auth';

router.post("/", async (req: Request, res: Response) => {
    const refreshJWT = USER_REFRESH_JWT
    try{
        const token = authHandler.verifyAndDecodeToken(refreshJWT);
        const hashedToken = hashRefreshToken(token)
        // FIND hashedToken IN DATABASE
        const accessJWT = authHandler.generateAccessToken(userId);
        const { hashedToken, jwt: refreshJWT } = authHandler.generateRefreshToken();
        // UPDATE hashedToken IN DATABASE
        // STORE refreshJWT IN USER DEVICE SAFELY -> Example: httpOnly Cookies
        // STORE accessJWT IN USER DEVICE
    }catch(err){
        ...
    }
})
```


# Usage

Package usage with examples


## Creating Auth Handler
**createAuthHandler(config?: Partial\<Config>)**

*Returns functions for generating and verifying tokens*

- `config` is ojbect of `Config` type and can be partial.

#### Config
```
type TokenConfig = {
    expiry: number
}
type Config = {
    access_token: TokenConfig,
    refresh_token: TokenConfig,
    credentials_limit: number
}
```

Because config can be partially set we have default values:

|Property              | Value          |
|----------------------|----------------|
| access_token.expiry  | 3600*s*        |
| refresh_token.expiry | 7776000*s*     |
| credentials_limit    | 10             |

`credentials_limit` is number of old Credentials which can be saved in memory.

**Explanation:**
Auth Handler can store more than one credentials at a time and can provide easy key rotation logic. Because of that developer can set how many credentials can be set before deleting oldest ones.
For example user can login at day 1 and after x + 1 days (where x is days after keys reroll) user wont be able to login even if his jwt isn't expired so because of that developers are able to store n credentials for each Auth Handler.


#### Example
In this example, we’ll set the refresh token expiration to **10 days** and limit the credentials to **2**.
It’s recommended to rotate credentials every 6+ days. This way, if a user logs in on the first day and doesn’t refresh their tokens for 9 days, they will still be able to refresh them on the 10th day. If we don't store the first token, the user won’t be able to refresh it after that period.
```
const config: Partial<Config> = {
    refresh_token: {
        expiry: 3600 * 24 * 12 // 10 days
    },
    credentials_limit: 2
}
const authHandler = createAuthHandler(config)
```

### Setting Credentials of Auth Handler
**authHandler.setCredentials(credentials: Credentials)**
After initialization of Auth Handler setting credentials is needed.
Every time you reroll you can call same method

#### Credentials

```
type Credentials = {
    id: string;
    algorithm: algorithm;
    privateKey: string;
    publicKey: string;
};
```
`id` is a unique string so every stored credential can be distinguished
`algorithm` is a string representing algorithm used by jwt to sign tokens. Allowed values:
RSA
- **RSA** `RS256`, `RS384`, `RS512`
- **ECDSA** `ES256`, `ES384`, `ES512`
- **PSS** `PS256`, `PS384`, `PS512`

#### Examples

##### Example 1

Generating credentials with `generateCredentials` function.
```
const credentials = generateCredentials();
authHandler.setCredentials(credentials);
```

##### Example 2

Here we are going to create credentials manually and read already generated keys from files.
```
const credentials: Credentials = {
    id: RANDOM_STRING,
    algorithm: 'RS256',
    privateKey: fs.readFileSync(PATH_TO_KEY, 'utf-8'),
    publicKey: fs.readFileSync(PATH_TO_KEY, 'utf-8'),
}
authHandler.setCredentials(credentials);
```

## Generating Access Token

**authHandler.generateAccessToken(data: any)**

*Returns generated jwt*

- `data` is required and can be any type. *userID* or other unique user data

#### Examples

```
try{
    const userID = UNIQUE_USER_ID
    const token = authHandler.generateAccessToken(userID)
}catch(err){
    ...
}
```

#### Errors

*soon...*


## Generating Refresh Token

**authHandler.generateRefreshToken()**

*Returns object of **jwt**, **token** and **hashedToken***

- `jwt` is generated jwt
- `token` is random generated 64 string that is included in jwt
- `hashedToken` is sha256 hashed **token** and it is not included in jwt

#### Example

```
try{
    const { jwt, token, hashedToken } = authHandler.generateRefreshToken()
}catch(err){
    ...
}
```

#### Errors

*soon...*

#### Idea behind refresh token

When user log in, he should store **JWT** somewhere safe in his device and also server should store **hashedToken** in database along userId or other unique identifier.
When access token expires we should validate refresh token and extract **token** from it. After that we can use `hashRefreshToken` function to hash **token** and try to find that hashed value in database.
Storing hashed value in database instead of plain one is a bit safer.

## Validating Token

**authHandler.verifyAndDecodeToken(jwt: string)**

*Returns decoded data*

- `jwt` is string of jsonwebtoken

#### Example

```
try{
    const jwt = YOUR_JSONWEBTOKEN
    const data = authHandler.verifyAndDecodeToken(jwt);
}catch(err){
    ...
}
```

#### Errors

*soon...*

## Generating Credentials

**generateCredentials(algorithm: Algorithm, keySize?: KeySize)**

*Returns generated credentials*

- `algorithm` is string representing algorithm which will be used with jwt. 
    - **RSA** `RS256`, `RS384`, `RS512`
    - **ECDSA** `ES256`, `ES384`, `ES512`

- `keySize` can be *low*, *medium* or *high* for 
    - `low`: For general use with moderate security. RSA modulus is 2048 bits, ECDSA curve is prime256v1.
    - `medium`: For more secure key generation with a balance of performance. RSA modulus is 3072 bits, ECDSA curve is secp384r1.
    - `high`: For highly secure key generation, at the cost of performance. RSA modulus is 4096 bits, ECDSA curve is secp521r1.

>**Important:** Key size must match algorithm for ECDSA, otherwise an error will be thrown. for e.g. 'ES256' algorithm must have 'low' key size.


#### Examples

##### Example 1

Here we are creating **Credentials** with `RS384` algorithm and `2048` modulus length.
```
const credentials = generateCredentials('RS384', 'low');
/* credentials = {
    id: GENERATED_ID,
    privateKey: GENERATED_PRIVATE_KEY,
    publicKEY: GENERATED_PUBLIC_KEY,
    algorithm: 'RS384'
} */
```

##### Example 2

For **RSA** if `keySize` is not provided default value is `medium`.
```
const credentials = generateCredentials('RS256');
```

##### Example 3

For **ECDSA** if `keySize` is not provided it will be picked automatically. In this case `high`.
```
const credentials = generateCredentials('ES512');
```

#### Errors

*soon...*


## Hashing Refresh Token

**hashRefreshToken(token)**

*Returns hashed token*

- `token` is string of plain hexadecimal token

#### Example

```
const token = DECODED_REFRESH_JWT
const hashedToken = hashRefreshToken(token);
```
