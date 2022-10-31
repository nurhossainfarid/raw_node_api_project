// dependencies

// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    environmentName: 'staging',
};

environments.production = {
    port: 5000,
    environmentName: 'production',
};

// determine which environments are passed
const currentEnvironments =
    typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// exports corresponding environments
const environmentToExports =    typeof environments[currentEnvironments] === 'object' ? environments[currentEnvironments] : {};

module.exports = environmentToExports;
