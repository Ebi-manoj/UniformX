import moment from 'moment';
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

const today = moment().startOf('day').toDate();
const startOfMonth = moment().startOf('month').toDate();
const endOfMonth = moment().endOf('month').toDate();
export const dashboardQueries = {
  totalSales: [
    {
      $match: {
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
        paymentStatus: 'COMPLETED',
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
      },
    },
  ],
  dailySales: [
    {
      $match: {
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
        paymentStatus: 'COMPLETED',
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: '$createdAt' },
        total: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ],

  dailyCustomers: [
    {
      $match: {
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ],

  totalUserCount: {
    createdAt: { $gte: startOfMonth, $lte: endOfMonth },
  },
};
