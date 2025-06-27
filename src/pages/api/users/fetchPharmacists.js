import User from "../../../models/User";
import dbConnect from "../../../lib/database";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const pharmacists = await User.find({ role: 'pharmacist' }).select('name email pharmacy');
      res.status(200).json(pharmacists);
    } catch (error) {
      console.error('Error fetching pharmacists:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
