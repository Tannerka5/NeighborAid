const db = require("../db/query");

exports.showDashboard = async (req, res) => {
  try {
    // Load household
    const householdResult = await db.query(
      "SELECT * FROM households WHERE user_id = $1",
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

    res.render("dashboard", {
      user: req.user,
      household,
      resources: formattedResources,
      neighborhoods: [],
      householdMembers: [],
      currentPage: 'dashboard'
    });

  } catch (err) {
    console.error("Dashboard load error:", err);
    res.status(500).send("Dashboard error");
  }
};