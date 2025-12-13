const db = require('../db/query');

// Main directory listing
exports.listHouseholds = async (req, res) => {
  try {
    // 1. Get all households + user names - SORTED BY LAST NAME, FIRST NAME
    const householdsResult = await db.query(`
      SELECT 
        h.*,
        h.phone_number AS phone,
        u.first_name,
        u.last_name
      FROM households h
      JOIN users u ON h.user_id = u.id
      ORDER BY u.last_name ASC, u.first_name ASC
    `);

    const households = householdsResult.rows;

    // 2. Get all resources and their types
    const resourcesResult = await db.query(`
      SELECT 
        r.id,
        r.household_id,
        r.quantity,
        r.description,
        r.is_available,
        rt.name AS type_name,
        rt.category AS type_category
      FROM resources r
      JOIN resource_types rt ON r.resource_type_id = rt.id
      ORDER BY rt.category, rt.name
    `);

    // 3. Get distinct neighborhoods for filtering
    const neighborhoodsResult = await db.query(`
      SELECT DISTINCT 
        neighborhood_code as id, 
        neighborhood_code as name
      FROM households
      WHERE neighborhood_code IS NOT NULL
      ORDER BY neighborhood_code
    `);

    // 4. Group resources by household_id
    const resourcesByHousehold = {};

    resourcesResult.rows.forEach(r => {
      if (!resourcesByHousehold[r.household_id]) {
        resourcesByHousehold[r.household_id] = [];
      }

      resourcesByHousehold[r.household_id].push({
        id: r.id,
        quantity: r.quantity,
        description: r.description,
        is_available: r.is_available,
        resourceType: {
          name: r.type_name,
          category: r.type_category
        }
      });
    });

    // 5. Attach resources to each household object
    households.forEach(h => {
      h.resources = resourcesByHousehold[h.id] || [];
    });

    // 6. Render directory
    res.render("directory", {
      user: req.user,
      households,
      neighborhoods: neighborhoodsResult.rows || [],
      currentPage: 'directory'
    });

  } catch (error) {
    console.error("DIRECTORY ERROR:", error);
    res.render("directory", {
      user: req.user,
      households: [],
      neighborhoods: [],
      error: "Unexpected error loading directory.",
      currentPage: 'directory'
    });
  }
};

// Show directory - alias for listHouseholds (for compatibility)
exports.showDirectory = async (req, res) => {
  return exports.listHouseholds(req, res);
};

// Map view
exports.showMap = async (req, res) => {
  try {
    res.render("directory/map", {
      user: req.user,
      currentPage: 'directory'
    });
  } catch (error) {
    console.error("MAP VIEW ERROR:", error);
    res.redirect("/dashboard");
  }
};

// Map data API endpoint
exports.getMapData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user's household
    const userHouseholdResult = await db.query(
      "SELECT neighborhood_code, address FROM households WHERE user_id = $1",
      [userId]
    );

    if (userHouseholdResult.rows.length === 0) {
      return res.json([]);
    }

    const neighborhoodCode = userHouseholdResult.rows[0].neighborhood_code;

    if (!neighborhoodCode) {
      return res.json([]);
    }

    // Fetch households + resources in same neighborhood with addresses
    const mapDataResult = await db.query(
      `
      SELECT
        h.id AS household_id,
        u.first_name AS first_name,
        u.last_name AS last_name,
        h.address,
        h.latitude,
        h.longitude,
        h.neighborhood_code,
        COALESCE(
          json_agg(
            json_build_object(
              'id', r.id,
              'resource_type_id', r.resource_type_id,
              'quantity', r.quantity,
              'description', r.description,
              'is_available', r.is_available,
              'resource_name', rt.name,
              'category', rt.category
            )
          ) FILTER (WHERE r.is_available = true AND r.id IS NOT NULL),
          '[]'
        ) AS resources
      FROM households h
      JOIN users u ON u.id = h.user_id
      LEFT JOIN resources r ON r.household_id = h.id
      LEFT JOIN resource_types rt ON rt.id = r.resource_type_id
      WHERE h.neighborhood_code = $1
        AND h.latitude IS NOT NULL
        AND h.longitude IS NOT NULL
      GROUP BY h.id, u.first_name, u.last_name, h.address, h.latitude, h.longitude, h.neighborhood_code
      ORDER BY u.last_name ASC, u.first_name ASC
      `,
      [neighborhoodCode]
    );

    res.json(mapDataResult.rows);

  } catch (error) {
    console.error("MAP DATA ERROR:", error);
    res.status(500).json({ error: "Failed to load map data" });
  }
};