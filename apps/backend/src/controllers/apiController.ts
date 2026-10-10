import { Request, Response } from 'express';
import { ok, fail } from '../utils/apiResponse';

export async function health(req: Request, res: Response) {
  res.json(ok('Recruitment platform backend is healthy', { uptime: process.uptime() }));
}
