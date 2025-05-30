import { Request, RequestHandler, Response } from "express";
import { LoginSchema, SignUpSchema } from "../schema/users";

export const signup: any = async (req: Request, res: Response) => {
  try {
    const parsed = SignUpSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsed.error.errors,
      });
    }
    const body = parsed.data;

    res.status(200).json({
      body,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error at sign Up" });
  }
};

export const login: any = async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsed.error.errors,
      });
    }
    const body = parsed.data;

    res.status(200).json({
      body,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error at sign Up" });
  }
};
