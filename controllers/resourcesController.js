const db = require('../db/query');

/**
 * LIST RESOURCES FOR CURRENT USER
 */
exports.listResources = async (req, res) => {
  const user = req.session.user;

  try {
    // Get the user’s household (may not exist yet)
    const householdResult = await db.query(
      "SELECT id FROM households WHERE user_id=$1",
      [user.id]
    );

    const household = householdResult.rows[0] || null;

    if (!household) {
      return res.render("resources/list", {
        user,
        resources: [],
        error: "You have not created a household yet."
      });
    }

    // Fetch resources for the household
    const resourcesResult = await db.query(
      `
      SELECT 
        r.*, 
        rt.name AS type_name,
        rt.category AS type_category,
        rt.description AS type_description
      FROM resources r
      JOIN resource_types rt ON r.resource_type_id = rt.id
      WHERE household_id=$1
      `,
      [household.id]
    );

    const formatted = resourcesResult.rows.map(r => ({
      id: r.id,
      quantity: r.quantity,
      description: r.description,
      isAvailable: r.is_available,
      resourceType: {
        name: r.type_name,
        category: r.type_category,
        description: r.type_description
      }
    }));

    return res.render("resources/list", {
      user,
      resources: formatted,
      currentPage: 'resources',
      error: null,
      success: null
    });

  } catch (err) {
    console.log("RESOURCE LIST ERROR:", err);
    return res.render("resources/list", {
      user,
      resources: [],
      error: "Could not load resources.",
      success: null
    });
  }
};

/**
 * SHOW ADD FORM
 */
exports.showAddForm = async (req, res) => {
  const user = req.session.user;

  const types = await db.query("SELECT * FROM resource_types ORDER BY name");

  res.render("resources/form", {
    user,
    resourceTypes: types.rows,
    isEdit: false,
    resource: null,
    currentPage: 'resources',
    selectedType: null,
    error: null,
    success: null
  });
};

/**
 * ADD RESOURCE
 */
exports.handleAdd = async (req, res) => {
  const user = req.session.user;
  const { resourceTypeId, quantity, description, isAvailable } = req.body;

  try {
    const householdResult = await db.query(
      "SELECT id FROM households WHERE user_id=$1",
      [user.id]
    );

    const household = householdResult.rows[0] || null;

    if (!household) {
      return res.render("resources/form", {
        user,
        error: "You must create a household first.",
        success: null
      });
    }

    await db.query(
      `
      INSERT INTO resources (household_id, resource_type_id, quantity, description, is_available)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [household.id, resourceTypeId, quantity, description, isAvailable ? true : false]
    );

    return res.redirect("/resources");

  } catch (err) {
    console.log("RESOURCE ADD ERROR:", err);
    return res.render("resources/form", {
      user,
      error: "Could not add resource.",
      success: null
    });
  }
};

/**
 * SHOW EDIT FORM
 */
exports.showEditForm = async (req, res) => {
  const user = req.session.user;
  const id = req.params.id;

  try {
    const resourceResult = await db.query(
      "SELECT * FROM resources WHERE id=$1",
      [id]
    );

    const resource = resourceResult.rows[0] || null;

    if (!resource) {
      return res.redirect("/resources");
    }

    const types = await db.query("SELECT * FROM resource_types ORDER BY name");

    return res.render("resources/form", {
      user,
      resource,
      currentPage: 'resources',
      resourceTypes: types.rows,
      isEdit: true,
      error: null,
      success: null
    });

  } catch (err) {
    console.log("RESOURCE EDIT ERROR:", err);
    return res.redirect("/resources");
  }
};

/**
 * UPDATE RESOURCE
 */
exports.handleUpdate = async (req, res) => {
  const id = req.params.id;
  const { resourceTypeId, quantity, description, isAvailable } = req.body;

  try {
    await db.query(
      `
      UPDATE resources
      SET resource_type_id=$1, quantity=$2, description=$3, is_available=$4
      WHERE id=$5
      `,
      [resourceTypeId, quantity, description, isAvailable ? true : false, id]
    );

    return res.redirect("/resources");

  } catch (err) {
    console.log("RESOURCE UPDATE ERROR:", err);
    return res.redirect("/resources");
  }
};

/**
 * DELETE RESOURCE
 */
exports.handleDelete = async (req, res) => {
  const id = req.params.id;

  try {
    await db.query("DELETE FROM resources WHERE id=$1", [id]);
    return res.redirect("/resources");
  } catch (err) {
    console.log("RESOURCE DELETE ERROR:", err);
    return res.redirect("/resources");
  }
};