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
      households
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