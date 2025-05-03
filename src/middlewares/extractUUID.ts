// interface RequestType {
//   headers: {
//     authorization?: string;
//   };
// }
import { Request } from 'express';
import jwt from 'jsonwebtoken';
const getClientUuidFromToken = (req: Request): string | null => {
  const authHeader  = req.headers.authorization as string ;
  if (!authHeader) return null;

  const token = authHeader.split(' ')[1];
  // console.log("her eis the token",token)
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my_super_secret_key') as { uuid?: string };
    console.log("Decoded token",decoded)
    return decoded.uuid || null;
  } catch {
    console.error('Invalid token:', token);
    return null;
  }
};
export default getClientUuidFromToken;
