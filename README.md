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
import fs from 'fs'
import { createAuthHandler, Credentials, Config } from "easy-token-auth";

const authHandler = createAuthHandler({
    privateKey: fs.readFileSync(PRIVATE_KEY_PATH, 'utf-8'),
    publicKey: fs.readFileSync(PUBLIC_KEY_PATH, 'utf-8'),
    algorithm: KEYS_ALG
})

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
        // STORE hashedToken IN DATABASE
        // STORE refreshJWT IN USER DEVICE SAFELY -> Example: httpOnly Cookies
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
        // UPDATED hashedToken IN DATABASE
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
**createAuthHandler(credentials, config)**

*Returns functions for generating and verifying tokens*

`credentials` is required object of `Credentials` type and contains *privateKey*, *publicKey* and *algorithm*
`config` is ojbect of `Config` type and can be partial.

#### Credentials
```
type algorithm = 'ES256'|'ES384'|'ES512'|'PS256'|'PS384'|'PS512'|'RS256'|'RS384'|'RS512'
export type Credentials = {
    privateKey: string;
    publicKey: string;
    algorithm: algorithm
};
```

#### Config
```
export type TokenConfig = {
    expiry: number
}
export type Config = {
    access_token: TokenConfig,
    refresh_token: TokenConfig
}
```


#### Example
```
const credentials: Credentials = {
    privateKey: YOUR_PRIVATE_KEY,
    publicKey: YOUR_PUBLIC_KEY,
    algorithm: ALGORITHM
}
const config: Partial<Config> = {
    access_token: {
        expiry: 60 * 45 // 45 minutes
    },
}
const authHandler = createAuthHandler(credentials, config)
```


## Generating Access Token

**authHandler.generateAccessToken(data)**

*Returns generated jwt*

`data` is required and can be any type. *userID* or other unique user data

#### Example

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

*Returns object of **jwt**, **token** and **hashedToken**

`jwt` is generated jwt
`token` is random generaded 64 string that is included in jwt
`hashedToken` is sha256 hashed *token*

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

#### Idea

**On Login:**
Store jwt on user device
Store hashedToken in database

**On Token Refresh:**
Extract token from user jwt
Hash Token
Try to find hashed token in database


## Validating Token

**authHandler.verifyAndDecodeToken(jwt)**

*Returns decoded data*

`jwt` is string of jsonwebtoken

#### Example

```
const jwt = YOUR_JSONWEBTOKEN
const data = authHandler.verifyAndDecodeToken(jwt);
```

#### Errors

*soon...*


## Hashing Refresh Token

**hashRefreshToken(token)**

*Returns hashed token*

`token` is string of plain hex token

>**Note:**
>You don't need to use this function you can implement it yourself with crypto library but we recommend just so you can be future proof.

#### Example

```
const token = DECODED_REFRESH_JWT
const hashedToken = hashRefreshToken(token);
```

#### Errors

*soon...*
