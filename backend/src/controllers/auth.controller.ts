import { Request, Response } from "express";

export const signup = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    res.status(200).json({
      body,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error at sign Up" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    res.status(200).json({
      body,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error at sign Up" });
  }
};
