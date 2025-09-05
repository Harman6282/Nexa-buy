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
exports.logout = exports.me = exports.login = exports.signup = void 0;
const users_1 = require("../schema/users");
const __1 = require("..");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = require("../utils/generateToken");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const cache_1 = require("../utils/cache");
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
    const newUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
    (0, generateToken_1.generateToken)(newUser, res);
    res.status(200).json(new apiResponse_1.ApiResponse(200, newUser, "Logged in"));
});
exports.login = login;
const me = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = (req === null || req === void 0 ? void 0 : req.user).id;
    let user;
    if (cache_1.cache.has("logged_user")) {
        user = JSON.parse(cache_1.cache.get("logged_user"));
    }
    else {
        user = yield __1.prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                role: true,
                name: true,
                email: true,
                imageUrl: true,
                address: true,
                _count: true,
                cart: true,
                createdAt: true,
                order: true,
                updatedAt: true,
            },
        });
        cache_1.cache.set("logged_user", JSON.stringify(user));
    }
    res
        .status(200)
        .json(new apiResponse_1.ApiResponse(200, user, " user fetched successfully"));
});
exports.me = me;
const logout = (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    cache_1.cache.del("logged_user");
    res.status(200).json(new apiResponse_1.ApiResponse(200, {}, "Logged out successfully"));
};
exports.logout = logout;
