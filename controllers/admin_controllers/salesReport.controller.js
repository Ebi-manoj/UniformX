import asyncHandler from 'express-async-handler';
import moment from 'moment';
import puppeteer from 'puppeteer';
import { fetchSalesReportData } from '../../services/sales_report.js';
import { generateSalesReportHTML } from '../../utilities/invoiceHtml.js';
import { Buffer } from 'buffer';

export const getSalesReport = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, page, limit } = req.query;

  try {
    const data = await fetchSalesReportData({
      type,
      startDate,
      endDate,
      page,
      limit,
      req,
    });

    res.render('admin/salesreport', {
      metrics: data.metrics,
      orders: data.orders,
      pagination: data.pagination,
      dateRange: data.dateRange,
      filterType: data.filterType,
      messages: req.flash('error'),
    });
  } catch (error) {
    if (error.message === 'Redirect required') {
      return res.redirect('/admin/salesreport');
    }
    throw error;
  }
});
export const downloadSalesReport = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, download } = req.query;

  if (download !== 'pdf') {
    req.flash('error', 'Invalid download format');
    return res.redirect('/admin/salesreport');
  }

  try {
    // Fetch all orders for PDF (no pagination)
    const data = await fetchSalesReportData({
      type,
      startDate,
      endDate,
      page: 1,
      limit: 1000, // Large limit to include all orders
      req,
    });

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    const htmlContent = generateSalesReportHTML(
      data.metrics,
      data.orders,
      data.dateRange,
      data.filterType
    );

    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Sales_Report_${moment().format('YYYY-MM-DD')}.pdf`
    );
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    if (error.message === 'Redirect required') {
      return res.redirect('/admin/salesreport');
    }
    throw error;
  }
});
