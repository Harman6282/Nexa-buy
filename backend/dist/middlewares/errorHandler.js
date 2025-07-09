"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Must have 4 arguments: (err, req, res, next)
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json(Object.assign({ statusCode, data: err.data || null, message: err.message || "Something went wrong", success: false, errors: err.errors || [] }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
};
exports.default = errorHandler;
