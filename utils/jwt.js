import jwt from 'jsonwebtoken';

const generateUserToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
};

export { generateUserToken };
