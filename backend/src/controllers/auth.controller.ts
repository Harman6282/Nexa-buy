import { Request, RequestHandler, Response } from "express";
import { LoginSchema, SignUpSchema } from "../schema/users";
import { prisma } from "..";
import bcryptjs from "bcryptjs";
import { generateToken } from "../utils/generateToken";
export const signup: any = async (req: Request, res: Response) => {
  // * 1. Validate the request body using Zod schema
  // *  2. find the user in the database
  // 3. if new user, create a new user in the database
  // 4. generate a JWT token
  // 5. send the token in the response
  // 6. set the token in a cookie with httpOnly and secure flags
  // 7. return the user data in the response

  try {
    const parsed = SignUpSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsed.error.errors,
      });
    }
    const body = parsed.data;

    const existinguser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existinguser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = bcryptjs.hashSync(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });

    if (user) {
      generateToken(user, res);
    }

    res.status(200).json({
      user,
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

    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordValid = bcryptjs.compareSync(body.password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    generateToken(user, res);

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error at login" });
  }
};
