import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import catchAsync from '../utils/catchAsync';

const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if the schema expects a body property (like auth validation)
      const schemaShape = schema.shape;
      if (schemaShape && 'body' in schemaShape) {
        await schema.parseAsync({
          body: req.body,
          cookies: req.cookies,
        });
      } else {
        // For schemas that validate req.body directly (like event validation)
        await schema.parseAsync(req.body);
      }
      next();
    } catch (error: unknown) {
      console.error('Validation error:', error);
      next(error);
    }
  });
};

// const validateRequest = (schema: AnyZodObject) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     try {
//       schema.parse(req.body);
//       next();
//     } catch (err) {
//       console.error('Validation failed:', err);
//       next(err);
//     }
//   };
// };


export default validateRequest;
