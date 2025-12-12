const express = require('express');
const router = express.Router();
const db = require('../db/query');

// GET /members — show members in same city
router.get('/', async (req, res) => {
  try {
    // 1. Get logged-in user's household
    const householdResult = await db.query(
      `SELECT * FROM households WHERE user_id = $1`,
      [req.user.id]
    );

    const household = householdResult.rows[0];
    if (!household || !household.neighborhood_code) {
      return res.render('members', {
        user: req.user,
        members: [],
        neighborhood_code: null
      });
    }

    const code = household.neighborhood_code;

    // 3. Query all members in the same city (excluding yourself)
    const membersResult = await db.query(
      `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        h.address,
        h.phone_number,
        h.readiness_level
      FROM households h
      JOIN users u ON h.user_id = u.id
      WHERE h.neighborhood_code = $1
      AND u.id <> $2
      `,
      [code, req.user.id]
    );

    const members = membersResult.rows;

    // 4. Render the Members page
    res.render('members', {
      user: req.user,
      members,
      neighborhood_code: code
    });

  } catch (err) {
    console.log("MEMBERS ERROR:", err);
    res.render('members', {
      user: req.user,
      members: [],
      neighborhood_code: null,
      error: "Unable to load members."
    });
  }
});

module.exports = router;