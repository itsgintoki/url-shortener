import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { UserTokenSchema } from '../validations/token.validations.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'default_jwt_secret_fallback';

export async function createUserToken(payload) {
  const validationResult = await UserTokenSchema.safeParseAsync(payload);

  if (!validationResult.success) {
    throw new Error('Invalid token payload');
  }

  const payloadValidatedData = validationResult.data;

  const token = jwt.sign(payloadValidatedData, getJwtSecret(), { expiresIn: '7d' });
  return token;
}


export const validateUserToken = (token) => {
  try {
    const payload = jwt.verify(token, getJwtSecret());
    return payload;
  } catch (error) {
    return null;
  }
};