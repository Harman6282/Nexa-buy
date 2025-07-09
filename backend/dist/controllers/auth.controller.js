"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.adminTest = exports.authenticateTest = exports.login = exports.signup = void 0;
const users_1 = require("../schema/users");
const __1 = require("..");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = require("../utils/generateToken");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = users_1.SignUpSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new apiError_1.ApiError(400, "Invalid request body", parsed.error.errors.map((error) => error.path[0] + ": " + error.message));
    }
    const body = parsed.data;
    const existinguser = yield __1.prisma.user.findUnique({
        where: {
            email: body.email,
        },
    });
    if (existinguser) {
        throw new apiError_1.ApiError(409, "User already exists", [
            "User with this email already exists",
        ]);
    }
    const hashedPassword = bcryptjs_1.default.hashSync(body.password, 10);
    const user = yield __1.prisma.user.create({
        data: {
            name: body.name,
            email: body.email,
            password: hashedPassword,
        },
    });
    if (user) {
        (0, generateToken_1.generateToken)(user, res);
    }
    res.status(200).json(new apiResponse_1.ApiResponse(200, user, "Sign up successful"));
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parsed = users_1.LoginSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new apiError_1.ApiError(400, "Invalid request body", parsed.error.errors.map((error) => error.message));
    }
    const body = parsed.data;
    const user = yield __1.prisma.user.findUnique({
        where: {
            email: body.email,
        },
    });
    if (!user) {
        throw new apiError_1.ApiError(404, "User not found", [
            "User with this email does not exist",
        ]);
    }
    const isPasswordValid = bcryptjs_1.default.compareSync(body.password, user.password);
    if (!isPasswordValid) {
        throw new apiError_1.ApiError(401, "Invalid Password");
    }
    (0, generateToken_1.generateToken)(user, res);
    res.status(200).json(new apiResponse_1.ApiResponse(200, user, "Logged in"));
});
exports.login = login;
const authenticateTest = (req, res) => {
    const user = req.user;
    res.status(200).json(new apiResponse_1.ApiResponse(200, user, " user Test successful"));
};
exports.authenticateTest = authenticateTest;
const adminTest = (req, res) => {
    res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "admin Test successful"));
};
exports.adminTest = adminTest;
const logout = (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "Logged out successfully"));
};
exports.logout = logout;
