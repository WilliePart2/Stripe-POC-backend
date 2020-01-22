const BaseException = require('./baseException');

class BadRequestException extends BaseException {
  constructor(message) {
    super(400, message);
  }
}

module.exports = BadRequestException;
