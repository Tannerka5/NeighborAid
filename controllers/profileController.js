const db = require("../db/query");
const bcrypt = require("bcryptjs");

exports.showProfile = (req, res) => {
  res.render("profile", {
    user: req.session.user,
    currentPage: 'profile'
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, email, password } = req.body;

    // Basic validation
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check email uniqueness (excluding current user)
    const emailCheck = await db.query(
      "SELECT id FROM users WHERE email = $1 AND id <> $2",
      [email, userId]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    let query;
    let values;

    // Update with password
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password, 10);

      query = `
        UPDATE users
        SET first_name = $1,
            last_name = $2,
            email = $3,
            password_hash = $4
        WHERE id = $5
      `;

      values = [first_name, last_name, email, hashed, userId];

    } else {
      // Update without password
      query = `
        UPDATE users
        SET first_name = $1,
            last_name = $2,
            email = $3
        WHERE id = $4
      `;

      values = [first_name, last_name, email, userId];
    }

    await db.query(query, values);

    // Keep session in sync
    req.session.user.first_name = first_name;
    req.session.user.last_name = last_name;
    req.session.user.email = email;

    res.json({ success: true });

  } catch (err) {
    console.log("PROFILE UPDATE ERROR:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};