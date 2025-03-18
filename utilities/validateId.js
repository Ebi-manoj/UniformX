import mongoose from 'mongoose';

export const validateId = function (id) {
  return mongoose.isValidObjectId(id);
};
