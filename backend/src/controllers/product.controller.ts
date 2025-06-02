import { Request, Response } from "express";

export const createProduct = async (req: Request, res: Response) => {
     res.json("created")
}

export const updateProduct = async (req: Request, res: Response) => {
     res.json("updated")
}

export const deleteProduct = async (req: Request, res: Response) => {
     res.json("deleted")
}

export const getProductById = async (req: Request, res: Response) => {
     res.json("fetched")
}

