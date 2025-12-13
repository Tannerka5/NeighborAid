const db = require("../db/query");

/**
 * /household -> redirect to /household/view
 */
exports.showHouseholdHome = (req, res) => {
  return res.redirect("/household/view");
};

/**
 * VIEW HOUSEHOLD PROFILE
 * Loads household, owner, resources.
 * Renders: views/household/view.ejs
 */
exports.showProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Load household (may not exist yet)
    const householdResult = await db.query(
      "SELECT * FROM households WHERE user_id=$1",
      [userId]
    );

    const household = householdResult.rows[0] || null;

    console.log("HOUSEHOLD LOADED FOR VIEW:", household);

    // Load user/owner info
    const userResult = await db.query(
      "SELECT first_name, last_name, email FROM users WHERE id=$1",
      [userId]
    );

    const ownerUser = userResult.rows[0] || {};

    // Load resources (if household exists)
    const resourcesResult = await db.query(
      `
      SELECT r.*,
             rt.name AS type_name,
             rt.category AS type_category,
             rt.description AS type_description
      FROM resources r
      JOIN resource_types rt ON r.resource_type_id = rt.id
      WHERE household_id = $1
      `,
      [household ? household.id : 0]
    );

    const resources = resourcesResult.rows.map(r => ({
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

    return res.render("household/view", {
      user: req.session.user,
      household,
      resources,
      ownerUser,
      error: null
    });

  } catch (err) {
    console.log("HOUSEHOLD VIEW ERROR:", err);
    return res.render("household/view", {
      user: req.session.user,
      household: null,
      resources: [],
      ownerUser: {},
      error: "Could not load household profile"
    });
  }
};

/**
 * SHOW EDIT FORM
 * Renders: views/household/edit.ejs
 */
exports.showEditForm = async (req, res) => {
  try {
    const userId = req.session.user.id;

    const householdResult = await db.query(
      "SELECT * FROM households WHERE user_id=$1",
      [userId]
    );

    const household = householdResult.rows[0] || null;

    return res.render("household/edit", {
      user: req.session.user,
      household,
      error: null,
      success: null
    });

  } catch (err) {
    console.log("HOUSEHOLD EDIT LOAD ERROR:", err);
    return res.render("household/edit", {
      user: req.session.user,
      household: null,
      error: "Could not load edit form",
      success: null
    });
  }
};

/**
 * UPDATE HOUSEHOLD PROFILE
 */
exports.updateProfile = async (req, res) => {
  console.log("UPDATE HOUSEHOLD HIT");
  console.log("RAW req.body:", req.body);
  try {
    const userId = req.session.user.id;

    const {
      address,
      latitude,
      longitude,
      neighborhood_code,
      phone_number,
      readiness_level,
      notes
    } = req.body;

    console.log("PARSED FIELDS:", {
      address,
      latitude,
      longitude,
      neighborhood_code,
      phone_number,
      readiness_level,
      notes,
      userId
    });

    console.log("ABOUT TO UPDATE WITH:", [
      address || null,
      latitude || null,
      longitude || null,
      neighborhood_code || null,
      phone_number || null,
      readiness_level || null,
      notes || null,
      userId
    ]);

    await db.query(
      `
      UPDATE households
      SET address=$1,
          latitude=$2,
          longitude=$3,
          phone_number=$4,
          readiness_level=$5,
          notes=$6,
          neighborhood_code = $7
      WHERE user_id=$8
      `,
      [
        address || null,
        latitude || null,
        longitude || null,
        phone_number || null,
        readiness_level || null,
        notes || null,
        neighborhood_code || null,
        userId
      ]
    );
    const verify = await db.query(
      "SELECT * FROM households WHERE user_id = $1",
      [userId]
    );

    console.log("DB STATE AFTER UPDATE:", verify.rows[0]);

    // Reload updated data
    const updated = await db.query(
      "SELECT * FROM households WHERE user_id=$1",
      [userId]
    );

    return res.render("household/edit", {
      user: req.session.user,
      household: updated.rows[0],
      error: null,
      success: "Household profile updated successfully!"
    });

  } catch (err) {
    console.log("HOUSEHOLD UPDATE ERROR:", err);
    return res.render("household/edit", {
      user: req.session.user,
      household: null,
      error: "Could not update household",
      success: null
    });
  }
};