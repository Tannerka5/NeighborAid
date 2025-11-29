const db = require('../db/query');

exports.showLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.handleLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.render("login", { error: "Invalid email or password" });
    }

    const foundUser = result.rows[0];

    // simple match for this project
    if (password !== foundUser.password_hash) {
      return res.render("login", { error: "Invalid email or password" });
    }

    req.session.user = {
      id: foundUser.id,
      firstName: foundUser.first_name,
      lastName: foundUser.last_name,
      email: foundUser.email,
      role: foundUser.role
    };

    console.log("AFTER LOGIN, SESSION =", req.session);
    return res.redirect("/dashboard");

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return res.render("login", { error: "Unexpected error occurred" });
  }
};

exports.showRegister = (req, res) => {
  res.render('register', { error: null });
};

exports.handleRegister = async (req, res) => {
  const { first_name, last_name, email, password, confirm_password } = req.body;

  // Password match
  if (password !== confirm_password) {
    return res.render("register", { error: "Passwords do not match" });
  }

  try {
    // Check duplicate email
    const existing = await db.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.render("register", { error: "Email already in use" });
    }

    // Create user
    const newUser = await db.query(
      `
      INSERT INTO users (first_name, last_name, email, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [first_name, last_name, email, password]
    );

    const userId = newUser.rows[0].id;

    // -------------------------------
    // FIX: Household creation WITHOUT needing a unique constraint
    // -------------------------------
    await db.query(
      `
      INSERT INTO households (user_id)
      SELECT $1
      WHERE NOT EXISTS (
        SELECT 1 FROM households WHERE user_id = $1
      );
      `,
      [userId]
    );
    // -------------------------------

    req.session.user = {
      id: userId,
      firstName: newUser.rows[0].first_name,
      lastName: newUser.rows[0].last_name,
      email: newUser.rows[0].email,
      role: newUser.rows[0].role
    };

    return res.redirect("/dashboard");

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    return res.render("register", { error: "Unexpected error occurred" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};