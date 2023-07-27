import express, { Request, Response } from 'express';
import Data from '../models/DataModel';

const router = express.Router();

router.get('/data', async (req: Request, res: Response) => {
  try {
    const data = await Data.find().sort('timestamp').limit(50);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
