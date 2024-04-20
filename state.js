// From Stack Overflow:
//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
export function getSecret(len) {
    let res = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let count = 0;
    while (count < len) {
        res += characters.charAt(Math.floor(Math.random() * charactersLength));
        count += 1;
    }
    return res;
}
// --------- auth0 authentication --------- //
export function getConfig(secret) {
    const config = {
        authRequired: false,
        auth0Logout: true,
        secret: secret,
        baseURL: 'http://localhost:9001',
        clientID: 'm8ieh2LZtQAtr5AcFevaw99k6tZ3KqCw',
        issuerBaseURL: 'https://dev-gblxtkrkmbzldfsv.us.auth0.com'
      };
    return config;
}