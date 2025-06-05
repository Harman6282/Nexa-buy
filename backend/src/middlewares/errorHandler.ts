import { Request, Response, NextFunction } from 'express';

// Must have 4 arguments: (err, req, res, next)
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    statusCode,
    data: err.data || null,
    message: err.message || 'Something went wrong',
    success: false,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
