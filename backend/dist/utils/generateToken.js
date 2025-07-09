"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeJWT = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secrets_1 = require("../secrets");
const generateToken = (user, res) => {
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        email: user.email,
        role: user.role,
    }, secrets_1.JWT_SECRET, {
        expiresIn: "15d",
    });
    res.cookie("accessToken", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
    });
};
exports.generateToken = generateToken;
const decodeJWT = (token) => {
    let decoded = jsonwebtoken_1.default.decode(token);
    return decoded;
};
exports.decodeJWT = decodeJWT;
