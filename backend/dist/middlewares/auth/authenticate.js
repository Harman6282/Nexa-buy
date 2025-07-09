"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCheck = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiError_1 = require("../../utils/apiError");
const secrets_1 = require("../../secrets");
const authenticate = (req, res, next) => {
    var _a;
    try {
        const token = req.cookies.accessToken || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
        if (!token) {
            throw new apiError_1.ApiError(401, "Unauthorized", ["No token provided"]);
        }
        const decoded = jsonwebtoken_1.default.verify(token, secrets_1.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        throw new apiError_1.ApiError(401, "Unauthorized", ["Invalid token"]);
    }
};
exports.authenticate = authenticate;
const adminCheck = (req, res, next) => {
    if ((req === null || req === void 0 ? void 0 : req.user).role !== "ADMIN") {
        throw new apiError_1.ApiError(403, "Unauthorized", [
            "You are not authorized to access this resource",
        ]);
    }
    next();
};
exports.adminCheck = adminCheck;
