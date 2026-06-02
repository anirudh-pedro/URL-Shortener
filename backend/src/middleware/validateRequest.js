import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/responseHandler.js';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return errorResponse(res, 'Request validation failed', 400, formattedErrors);
  }
  next();
};

export default validateRequest;
