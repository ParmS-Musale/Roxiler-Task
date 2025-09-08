const { executeQuery } = require("../config/database");

// @desc    Get admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboard = async (req, res) => {
  try {
    // Get total counts
    const [
      totalUsersResult,
      totalStoresResult,
      totalRatingsResult,
      adminUsersResult,
      normalUsersResult,
      storeOwnersResult,
      recentUsersResult,
      recentStoresResult,
      topRatedStoresResult,
      recentRatingsResult,
    ] = await Promise.all([
      // Total counts
      executeQuery(
        "SELECT COUNT(*) as count FROM users WHERE is_active = TRUE"
      ),
      executeQuery(
        "SELECT COUNT(*) as count FROM stores WHERE is_active = TRUE"
      ),
      executeQuery("SELECT COUNT(*) as count FROM ratings"),

      // User counts by role
      executeQuery(
        'SELECT COUNT(*) as count FROM users WHERE role = "admin" AND is_active = TRUE'
      ),
      executeQuery(
        'SELECT COUNT(*) as count FROM users WHERE role = "normal_user" AND is_active = TRUE'
      ),
      executeQuery(
        'SELECT COUNT(*) as count FROM users WHERE role = "store_owner" AND is_active = TRUE'
      ),

      // Recent activity (last 7 days)
      executeQuery(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE is_active = TRUE AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `),
      executeQuery(`
        SELECT COUNT(*) as count 
        FROM stores 
        WHERE is_active = TRUE AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `),

      // Top rated stores
      executeQuery(`
        SELECT s.id, s.name, s.average_rating, s.total_ratings
        FROM stores s
        WHERE s.is_active = TRUE AND s.total_ratings > 0
        ORDER BY s.average_rating DESC, s.total_ratings DESC
        LIMIT 5
      `),

      // Recent ratings
      executeQuery(`
        SELECT COUNT(*) as count 
        FROM ratings 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `),
    ]);

    // Calculate growth rates (comparison with previous 7 days)
    const [prevUsersResult, prevStoresResult, prevRatingsResult] =
      await Promise.all([
        executeQuery(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE is_active = TRUE 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
        AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
      `),
        executeQuery(`
        SELECT COUNT(*) as count 
        FROM stores 
        WHERE is_active = TRUE 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
        AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
      `),
        executeQuery(`
        SELECT COUNT(*) as count 
        FROM ratings 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
        AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
      `),
      ]);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const analytics = {
      overview: {
        totalUsers: totalUsersResult[0].count,
        totalStores: totalStoresResult[0].count,
        totalRatings: totalRatingsResult[0].count,
        averageRatingAcrossStores: 0, // Will calculate below
      },

      userBreakdown: {
        adminUsers: adminUsersResult[0].count,
        normalUsers: normalUsersResult[0].count,
        storeOwners: storeOwnersResult[0].count,
      },

      recentActivity: {
        newUsersThisWeek: recentUsersResult[0].count,
        newStoresThisWeek: recentStoresResult[0].count,
        newRatingsThisWeek: recentRatingsResult[0].count,
      },

      growth: {
        userGrowth: calculateGrowth(
          recentUsersResult[0].count,
          prevUsersResult[0].count
        ),
        storeGrowth: calculateGrowth(
          recentStoresResult[0].count,
          prevStoresResult[0].count
        ),
        ratingGrowth: calculateGrowth(
          recentRatingsResult[0].count,
          prevRatingsResult[0].count
        ),
      },

      topRatedStores: topRatedStoresResult,
    };

    // Calculate average rating across all stores
    if (totalStoresResult[0].count > 0) {
      const avgRatingResult = await executeQuery(`
        SELECT AVG(average_rating) as avg_rating 
        FROM stores 
        WHERE is_active = TRUE AND total_ratings > 0
      `);
      analytics.overview.averageRatingAcrossStores =
        Math.round(avgRatingResult[0].avg_rating * 10) / 10 || 0;
    }

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get dashboard error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get users with advanced filtering (Admin view)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAdminUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      sortBy = "created_at",
      sortOrder = "desc",
      includeInactive = false,
    } = req.query;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    // Include inactive users if requested
    if (!includeInactive) {
      whereConditions.push("is_active = TRUE");
    }

    // Search filter
    if (search) {
      whereConditions.push("(name LIKE ? OR email LIKE ? OR address LIKE ?)");
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Role filter
    if (role) {
      whereConditions.push("role = ?");
      queryParams.push(role);
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // Validate sort parameters
    const allowedSortFields = [
      "name",
      "email",
      "role",
      "created_at",
      "updated_at",
      "is_active",
    ];
    const allowedSortOrders = ["asc", "desc"];

    const validSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const validSortOrder = allowedSortOrders.includes(sortOrder.toLowerCase())
      ? sortOrder.toLowerCase()
      : "desc";

    // Calculate pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const totalResult = await executeQuery(countQuery, queryParams);
    const totalUsers = totalResult[0].total;

    // Get users with additional info
    const usersQuery = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.is_active,
        u.created_at, 
        u.updated_at,
        COUNT(r.id) as ratings_given,
        s.id as store_id,
        s.name as store_name,
        s.average_rating as store_rating
      FROM users u
      LEFT JOIN ratings r ON u.id = r.user_id
      LEFT JOIN stores s ON u.id = s.owner_id AND s.is_active = TRUE
      ${whereClause}
      GROUP BY u.id
      ORDER BY ${validSortBy} ${validSortOrder}
      LIMIT ? OFFSET ?
    `;

    const users = await executeQuery(usersQuery, [
      ...queryParams,
      parseInt(limit),
      offset,
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get admin users error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getDashboard,
  getAdminUsers,
};
