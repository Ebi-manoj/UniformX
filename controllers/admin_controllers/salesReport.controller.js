import asyncHandler from 'express-async-handler';

export const getSalesReport = asyncHandler(async (req, res) => {
  res.render('admin/salesreport');
});
