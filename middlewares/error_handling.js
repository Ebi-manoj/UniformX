import multer from 'multer';
export const errorhandling = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    req.flash('error', 'File too large! Max allowed size is 2MB.');
    return res.redirect('back');
  } else if (err) {
    let message;
    if (err.message.includes('Only JPEG, PNG, or WEBP')) {
      message = 'Only JPG, PNG, or WEBP image formats are allowed.';
    } else {
      message = 'An unexpected error occurred. Please try again.';
    }
    req.flash('error', message);
    return res.redirect('back');
  }
  next();
};
