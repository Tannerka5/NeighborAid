const db = require('../db/query');

exports.listHouseholds = async (req, res) => {
  try {
    // 1. Get all households + user names
    const householdsResult = await db.query(`
      SELECT 
        h.*,
        u.first_name,
        u.last_name
      FROM households h
      JOIN users u ON h.user_id = u.id
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
    `);

    // 3. Group resources by household_id
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

    // 4. Attach resources to each household object
    households.forEach(h => {
      h.resources = resourcesByHousehold[h.id] || [];
    });

    // 5. Render directory
    res.render("directory", {
      user: req.user,
      households,
      currentPage: 'directory'
    });

  } catch (error) {
    console.log("DIRECTORY ERROR:", error);
    res.render("directory", {
      user: req.user,
      households: [],
      error: "Unexpected error loading directory."
    });
  }
};

exports.showMap = async (req, res) => {
  try {
    res.render("directory/map", {
      user: req.user
    });
  } catch (error) {
    console.log("MAP VIEW ERROR:", error);
    res.redirect("/dashboard");
  }
};

exports.getMapData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user's neighborhood
    const userHouseholdResult = await db.query(
      "SELECT neighborhood_code FROM households WHERE user_id = $1",
      [userId]
    );

    if (userHouseholdResult.rows.length === 0) {
      return res.json([]);
    }

    const neighborhoodCode = userHouseholdResult.rows[0].neighborhood_code;

    // Get neighborhood centroid for fallback coordinates
    const centroidResult = await db.query(
      `
      SELECT 
        AVG(latitude) AS center_lat,
        AVG(longitude) AS center_lng
      FROM households
      WHERE neighborhood_code = $1
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
      `,
      [neighborhoodCode]
    );

    const centerLat = centroidResult.rows[0].center_lat;
    const centerLng = centroidResult.rows[0].center_lng;

    // Fetch households + resources in same neighborhood
    const mapDataResult = await db.query(
      `
       SELECT
        h.id AS household_id,
        u.first_name AS first_name,
        u.last_name AS last_name,
        COALESCE(h.latitude, $2) AS latitude,
        COALESCE(h.longitude, $3) AS longitude,
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
          ) FILTER (WHERE r.is_available = true),
          '[]'
        ) AS resources
      FROM households h
      JOIN users u ON u.id = h.user_id
      LEFT JOIN resources r ON r.household_id = h.id
      LEFT JOIN resource_types rt ON rt.id = r.resource_type_id
      WHERE h.neighborhood_code = $1
      GROUP BY h.id, u.first_name, u.last_name
      `,
      [neighborhoodCode, centerLat, centerLng]
    );

    res.json(mapDataResult.rows);

  } catch (error) {
    console.log("MAP DATA ERROR:", error);
    res.status(500).json({ error: "Failed to load map data" });
  }
};