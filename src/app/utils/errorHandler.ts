import httpStatus from 'http-status';
import AppError from '../errors/AppError';

export const handleServiceError = (error: any, operation: string) => {
  if (error instanceof AppError) {
    throw error;
  }
  
  if (error.name === 'ValidationError') {
    throw new AppError(httpStatus.BAD_REQUEST, `Validation failed for ${operation}`);
  }
  
  if (error.code === 11000) {
    throw new AppError(httpStatus.CONFLICT, `Duplicate entry for ${operation}`);
  }
  
  if (error.name === 'CastError') {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid ID format for ${operation}`);
  }
  
  // Default error
  throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to ${operation}`);
};

export const createNotFoundError = (entity: string) => {
  return new AppError(httpStatus.NOT_FOUND, `${entity} not found`);
};

export const createValidationError = (message: string) => {
  return new AppError(httpStatus.BAD_REQUEST, message);
};
