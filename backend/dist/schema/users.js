"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAddressSchema = exports.LoginSchema = exports.SignUpSchema = void 0;
const zod_1 = require("zod");
exports.SignUpSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.CreateAddressSchema = zod_1.z.object({
    lineOne: zod_1.z.string().min(1, "Address field one is required"),
    lineTwo: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1, "City is required"),
    state: zod_1.z.string().min(1, "State is required"),
    pincode: zod_1.z.string().min(1, "Pin code is required"),
    country: zod_1.z.string().min(1, "Country is required"),
});
