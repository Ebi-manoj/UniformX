import multer from 'multer';
export const errorhandling = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    req.flash('error', 'File too large! Max allowed size is 2MB.');
    return res.redirect('back');
  } else if (err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
  next();
};
