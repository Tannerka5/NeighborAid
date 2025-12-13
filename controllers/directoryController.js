const db = require('../db/query');

exports.showDirectory = async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Get user's neighborhood
    const userHouseholdResult = await db.query(
      'SELECT neighborhood_code FROM households WHERE user_id = $1',
      [userId]
    );

    if (!userHouseholdResult.rows.length) {
      return res.render('directory/directory', {
        households: [],
        message: 'Please set up your household profile first.',
        currentPage: 'directory'
      });
    }

    const neighborhoodCode = userHouseholdResult.rows[0].neighborhood_code;

    if (!neighborhoodCode) {
      return res.render('directory/directory', {
        households: [],
        message: 'Please add a neighborhood code to your household profile.',
        currentPage: 'directory'
      });
    }

    // Get all households in the same neighborhood with their resources
    const householdsQuery = `
      SELECT 
        h.id,
        h.address,
        h.phone,
        u.first_name,
        u.last_name,
        u.email,
        h.neighborhood_code,
        COALESCE(
          json_agg(
            json_build_object(
              'name', rt.name,
              'category', rt.category,
              'quantity', r.quantity,
              'available', r.available
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as resources
      FROM households h
      JOIN users u ON h.user_id = u.id
      LEFT JOIN resources r ON h.id = r.household_id AND r.available = true
      LEFT JOIN resource_types rt ON r.resource_type_id = rt.id
      WHERE h.neighborhood_code = $1 AND h.user_id != $2
      GROUP BY h.id, h.address, h.phone, u.first_name, u.last_name, u.email, h.neighborhood_code
      ORDER BY u.last_name, u.first_name
    `;

    const result = await db.query(householdsQuery, [neighborhoodCode, userId]);

    res.render('directory/directory', {
      households: result.rows,
      currentPage: 'directory'
    });

  } catch (error) {
    console.error('Directory error:', error);
    res.status(500).render('error', {
      error: 'Failed to load directory',
      message: error.message,
      currentPage: 'directory'
    });
  }
};
