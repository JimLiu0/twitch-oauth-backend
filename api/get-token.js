import { tokens } from './callback.js';

export default function handler(req, res) {
  const { session } = req.query;

  if (tokens[session]) {
    res.json(tokens[session]);
  } else {
    res.json({ success: false });
  }
}
