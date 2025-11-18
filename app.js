const express = require('express');
const path = require('path');
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files (images, css, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Request parsing (for forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Demo routes to show the EJS views (create routes/demo.js as needed)
const demoRoutes = require('./routes/demo'); // Change filename if needed
app.use(demoRoutes);

// Default fallback (optional)
app.get('/', (req, res) => res.render('login'));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`NeighborAid server is running on http://localhost:${PORT}`);
});

module.exports = app;
