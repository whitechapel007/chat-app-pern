import type { Request, Response } from "express";
export async function conversations(req: Request, res: Response) {
  res.json("conversations");
}
