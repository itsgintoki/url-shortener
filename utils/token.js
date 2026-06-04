import jwt from 'jsonwebtoken';
import { UserTokenSchema } from '../validations/token.validations.js';

const JWT_SECRET = process.env.JWT_SECRET;


export async function createUserToken(payload){
    const validationResult = await UserTokenSchema.safeParseAsync(payload);

    if(validationResult.error) throw new Error();

    const payloadValidatedData = validationResult.data;
    
    const token = jwt.sign(payload,JWT_SECRET);
    return token;
}

export const validateUserToken = (token) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
};