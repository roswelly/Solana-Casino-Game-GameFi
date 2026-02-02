import express from 'express'
import { Request, Response } from "express";

const router = express.Router();

router.get('/test', async (req: Request, res: Response) => {
    res.send('Hello world!')
})

export default router