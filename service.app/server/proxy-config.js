function loadProxyConfig() {
    const portFromEnv = process.env.PORT;
    const endpointArray = process.env.API.split("//");
    const apiToken = process.env.API_TOKEN;

    return {
        sslPort: portFromEnv,
        protocolAPI: endpointArray[0],
        endpointAPI: endpointArray[1],
        sslCert: process.env.BE_SSL_CERT,
        apiToken: apiToken,
        csrf: false,
        validateCert: false
    };
}

module.exports = loadProxyConfig;
