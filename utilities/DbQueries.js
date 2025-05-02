import { Order } from '../model/order_model.js';
////////////////////////////////////////////////
//////////Product Details Fetching
export function productDetails(slug) {
  return [
    { $match: { slug, is_deleted: false } },

    // Lookup category details
    {
      $lookup: {
        from: 'categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },

    // Lookup club details
    {
      $lookup: {
        from: 'clubs',
        localField: 'club_id',
        foreignField: '_id',
        as: 'club',
      },
    },
    { $unwind: '$club' },

    // Extract the year from the product title (or use the year field if added)
    {
      $addFields: {
        year: {
          $getField: {
            field: 'match',
            input: {
              $regexFind: { input: '$title', regex: '\\d{4}' },
            },
          },
        },
      },
    },

    // Find all related products (same club & year)
    {
      $lookup: {
        from: 'products',
        let: {
          productClub: '$club_id',
          productYear: '$year',
        },
        pipeline: [
          {
            $match: {
              is_deleted: false,
              $expr: {
                $and: [
                  { $eq: ['$club_id', '$$productClub'] }, // Same club
                  {
                    $eq: [
                      {
                        $getField: {
                          field: 'match',
                          input: {
                            $regexFind: { input: '$title', regex: '\\d{4}' },
                          },
                        },
                      },
                      '$$productYear',
                    ],
                  }, // Same year
                ],
              },
            },
          },
          {
            $project: {
              type: 1,
              slug: 1,
              title: 1, // Optional for display
            },
          },
        ],
        as: 'relatedProducts',
      },
    },

    // Add calculated fields
    {
      $addFields: {
        totalStock: { $sum: '$sizes.stock_quantity' },
        stockStatus: {
          $cond: {
            if: { $gt: [{ $sum: '$sizes.stock_quantity' }, 0] },
            then: 'In Stock',
            else: 'Out of Stock',
          },
        },
      },
    },

    // Project needed fields
    {
      $project: {
        title: 1,
        slug: 1,
        price: 1,
        description: 1,
        image_url: 1,
        type: 1, // Include type for comparison
        'category.name': 1,
        'club.name': 1,
        sizes: 1,
        color: 1,
        averageRating: 1,
        reviewCount: 1,
        stockStatus: 1,
        discountPercentage: 1,
        relatedProducts: 1, // Include all related products
        maxQuantity: 1,
        averageRating: 1,
        numReviews: 1,
      },
    },
  ];
}

// Helper functions for time series data
export async function getDailyTimeSeriesData(startDate, endDate) {
  const hourlyData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Fill in missing hours with 0
  const result = Array(24).fill(0);
  hourlyData.forEach(item => {
    result[item._id] = item.totalAmount;
  });

  return result;
}

export async function getWeeklyTimeSeriesData(startDate, endDate) {
  const dailyData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' }, // 1 for Sunday, 2 for Monday, etc.
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Fill in missing days with 0 (dayOfWeek is 1-7, where 1 is Sunday)
  const result = Array(7).fill(0);
  dailyData.forEach(item => {
    result[item._id - 1] = item.totalAmount; // Adjust index to 0-6
  });

  return result;
}

export async function getMonthlyTimeSeriesData(startDate, endDate) {
  const dailyData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: '$createdAt' },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Get number of days in the month
  const daysInMonth = new Date(
    endDate.getFullYear(),
    endDate.getMonth() + 1,
    0
  ).getDate();

  // Fill in missing days with 0
  const result = Array(daysInMonth).fill(0);
  dailyData.forEach(item => {
    result[item._id - 1] = item.totalAmount; // Adjust index to 0-based
  });

  return result;
}

export async function getYearlyTimeSeriesData(startDate, endDate) {
  const monthlyData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' }, // 1 for January, 2 for February, etc.
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Fill in missing months with 0
  const result = Array(12).fill(0);
  monthlyData.forEach(item => {
    result[item._id - 1] = item.totalAmount; // Adjust index to 0-based
  });

  return result;
}

export // Helper functions for top items
async function getTopProducts(startDate, endDate) {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $group: {
        _id: '$items.product',
        title: { $first: '$items.title' },
        totalSales: {
          $sum: { $multiply: ['$items.price', '$items.quantity'] },
        },
      },
    },
    {
      $sort: { totalSales: -1 },
    },
    {
      $limit: 10,
    },
  ]);
}

export async function getTopCategories(startDate, endDate) {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $lookup: {
        from: 'products', // Collection name is lowercase plural in MongoDB
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    {
      $unwind: '$productInfo',
    },
    {
      $group: {
        _id: '$productInfo.category_id', // Changed to match your schema
        totalSales: {
          $sum: { $multiply: ['$items.price', '$items.quantity'] },
        },
      },
    },
    {
      $lookup: {
        from: 'categories', // Collection name is lowercase plural in MongoDB
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    {
      $unwind: '$categoryInfo',
    },
    {
      $project: {
        name: '$categoryInfo.name',
        totalSales: 1,
      },
    },
    {
      $sort: { totalSales: -1 },
    },
    {
      $limit: 10,
    },
  ]);
}

export async function getTopClubs(startDate, endDate) {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $lookup: {
        from: 'products', // Collection name for your products
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    {
      $unwind: '$productInfo',
    },
    {
      $group: {
        _id: '$productInfo.club_id', // Changed from brand to club_id to match your schema
        totalSales: {
          $sum: { $multiply: ['$items.price', '$items.quantity'] },
        },
      },
    },
    {
      $lookup: {
        from: 'clubs', // Your Club model is exported with collection name 'clubs'
        localField: '_id',
        foreignField: '_id',
        as: 'clubInfo',
      },
    },
    {
      $unwind: '$clubInfo',
    },
    {
      $project: {
        name: '$clubInfo.name', // Project the club name
        totalSales: 1,
      },
    },
    {
      $sort: { totalSales: -1 },
    },
    {
      $limit: 10,
    },
  ]);
}
