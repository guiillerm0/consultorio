import User from "../../../models/User";
import dbConnect from "../../../lib/database";

export default async function handler(req, res) {
  const { email } = req.query;
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const user = await User.findOne({ email }).select('-password -privateKey');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}