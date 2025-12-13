const db = require('../db/query');

exports.showProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Get current user data
    const userResult = await db.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows.length) {
      return res.redirect('/auth/login');
    }

    const user = userResult.rows[0];

    res.render('profile/profile', {
      user: user,
      currentPage: 'profile',
      success: req.query.success,
      error: req.query.error
    });

  } catch (error) {
    console.error('Profile load error:', error);
    res.status(500).send('Server error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { first_name, last_name, email, current_password, new_password, confirm_password } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return res.redirect('/profile?error=All fields are required');
    }

    // If changing password, validate
    if (new_password || confirm_password || current_password) {
      if (!current_password) {
        return res.redirect('/profile?error=Current password required to change password');
      }

      if (new_password !== confirm_password) {
        return res.redirect('/profile?error=New passwords do not match');
      }

      // Verify current password
      const userResult = await db.query(
        'SELECT password FROM users WHERE id = $1',
        [userId]
      );

      const bcrypt = require('bcrypt');
      const validPassword = await bcrypt.compare(current_password, userResult.rows[0].password);

      if (!validPassword) {
        return res.redirect('/profile?error=Current password is incorrect');
      }

      // Hash new password and update
      const hashedPassword = await bcrypt.hash(new_password, 10);
      await db.query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3, password = $4 WHERE id = $5',
        [first_name, last_name, email, hashedPassword, userId]
      );
    } else {
      // Update without password change
      await db.query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4',
        [first_name, last_name, email, userId]
      );
    }

    // Update session
    req.session.user.first_name = first_name;
    req.session.user.last_name = last_name;
    req.session.user.email = email;

    res.redirect('/profile?success=Profile updated successfully');

  } catch (error) {
    console.error('Profile update error:', error);
    res.redirect('/profile?error=Failed to update profile');
  }
};
