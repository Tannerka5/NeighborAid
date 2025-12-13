const db = require("../db/query");

exports.showDashboard = async (req, res) => {
  try {
    // Load household with proper column aliasing
    const householdResult = await db.query(
      `SELECT 
        id,
        user_id,
        address,
        phone_number AS phone,
        neighborhood_code,
        readiness_level,
        notes
      FROM households 
      WHERE user_id = $1`,
      [req.user.id]
    );

    const household = householdResult.rows[0] || null;

    // Normalize readiness level for UI safety
    if (household) {
      household.readiness_level = household.readiness_level
        ? household.readiness_level.toLowerCase().trim()
        : "low";
    }

    // Load resources if household exists
    let formattedResources = [];

    if (household) {
      const resources = await db.query(
        `
        SELECT 
          r.*, 
          rt.name AS type_name,
          rt.category AS type_category,
          rt.description AS type_description
        FROM resources r
        JOIN resource_types rt ON r.resource_type_id = rt.id
        WHERE r.household_id = $1
        ORDER BY rt.category, rt.name
        `,
        [household.id]
      );

      formattedResources = resources.rows.map(r => ({
        ...r,
        resourceType: {
          name: r.type_name,
          category: r.type_category,
          description: r.type_description
        }
      }));
    }

    // Load neighborhoods for the map card count
    const neighborhoodsResult = await db.query(
      `SELECT DISTINCT neighborhood_code, COUNT(*) as member_count
       FROM households
       WHERE neighborhood_code IS NOT NULL
       GROUP BY neighborhood_code`
    );

    res.render("dashboard", {
      user: req.user,
      household,
      resources: formattedResources,
      neighborhoods: neighborhoodsResult.rows,
      householdMembers: [],
      currentPage: 'dashboard'
    });

  } catch (err) {
    console.error("Dashboard load error:", err);
    res.status(500).send("Dashboard error");
  }
};
