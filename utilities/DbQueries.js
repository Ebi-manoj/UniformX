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
    // Lookup reviews
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'product_id',
        as: 'reviews',
      },
    },

    // Filter active reviews and populate user_id
    {
      $addFields: {
        reviews: {
          $filter: {
            input: '$reviews',
            as: 'review',
            cond: { $eq: ['$$review.is_active', true] },
          },
        },
      },
    },

    // Lookup user details for each review
    {
      $lookup: {
        from: 'users',
        localField: 'reviews.user_id',
        foreignField: '_id',
        as: 'reviewUsers',
      },
    },

    // Map reviews with user names
    {
      $addFields: {
        reviews: {
          $map: {
            input: '$reviews',
            as: 'review',
            in: {
              $mergeObjects: [
                '$$review',
                {
                  user: {
                    $arrayElemAt: [
                      '$reviewUsers',
                      {
                        $indexOfArray: ['$reviewUsers._id', '$$review.user_id'],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },

    // Sort reviews by date (newest first)
    {
      $addFields: {
        reviews: {
          $sortArray: {
            input: '$reviews',
            sortBy: { createdAt: -1 },
          },
        },
      },
    },

    // Add calculated fields
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' },
        reviewCount: { $size: '$reviews' },
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
        reviews: {
          rating: 1,
          review_text: 1,
          verified_purchase: 1,
          createdAt: 1,
          'user.name': 1,
        },
        stockStatus: 1,
        discountPercentage: 1,
        relatedProducts: 1, // Include all related products
        maxQuantity: 1,
      },
    },
  ];
}
