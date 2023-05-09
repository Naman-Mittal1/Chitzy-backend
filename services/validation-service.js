const { validationResult } = require('express-validator');


class ValidationService {
    checkValidation(req) {
        const errors = validationResult(req);
        return errors;
    }
}

module.exports = new ValidationService();