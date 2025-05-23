import jwt from 'jsonwebtoken';

export const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRETKEY, { expiresIn: '1h' });
};

export const generateRefreshToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRETKEY, { expiresIn: '7D' });
};
