export const errorhandling = (err, req, res, next) => {
  console.log(err.message, err.stack);
};
