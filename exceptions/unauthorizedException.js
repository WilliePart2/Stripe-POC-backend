const BaseException = require('./baseException');

class UnauthorizedException extends BaseException {
  constructor(message) {
    super(401, message);
  }
}

module.exports = UnauthorizedException;