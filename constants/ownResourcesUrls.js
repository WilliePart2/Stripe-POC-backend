const os = require('os');

const getHostAddr = () => 'http://localhost:4200';

module.exports = {
    serverAddrr: () => getHostAddr(),
    clientAppUrl: () => 'http://localhost:3000',
};
