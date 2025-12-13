const db = require('../db/query');

exports.showProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user data
    const userResult = await db.query(
      'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows.length) {
      return res.redirect('/auth/login');
    }

    const user = userResult.rows[0];

    // FIXED: Render 'profile' not 'profile/profile'
    res.render('profile', {
      user: user,
      currentPage: 'profile',
      success: req.query.success || null,
      error: req.query.error || null
    });

  } catch (error) {
    console.error('Profile load error:', error);
    res.status(500).send('Server error loading profile');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
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
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      // TEMPORARY: Plain text password check (MUST FIX WITH BCRYPT)
      if (current_password !== userResult.rows[0].password_hash) {
        return res.redirect('/profile?error=Current password is incorrect');
      }

      // Update with new password
      await db.query(
        'UPDATE users SET first_name = $1, last_name = $2, email = $3, password_hash = $4 WHERE id = $5',
        [first_name, last_name, email, new_password, userId]
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
