document.addEventListener("DOMContentLoaded", async () => {
  const mapElement = document.getElementById("map");
  const loadingMessage = document.getElementById("loading");

  if (!mapElement) {
    console.error("Map element not found");
    return;
  }

  // Initialize map with default center
  const map = L.map("map").setView([40.2338, -111.6585], 13); // Default to Provo, UT (BYU area)

  // Add OpenStreetMap tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  try {
    // Fetch map data
    const response = await fetch("/directory/map/data");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const households = await response.json();

    // Hide loading message
    if (loadingMessage) {
      loadingMessage.style.display = 'none';
    }

    if (!households || households.length === 0) {
      console.log("No households with map data available");
      
      // Show message on map
      const messageDiv = document.createElement('div');
      messageDiv.className = 'loading-message';
      messageDiv.textContent = 'No households found in your neighborhood';
      mapElement.appendChild(messageDiv);
      return;
    }

    // Find households with valid coordinates
    const validHouseholds = households.filter(h => 
      h.latitude && h.longitude && 
      !isNaN(h.latitude) && !isNaN(h.longitude)
    );

    if (validHouseholds.length === 0) {
      console.log("No households with valid coordinates");
      const messageDiv = document.createElement('div');
      messageDiv.className = 'loading-message';
      messageDiv.textContent = 'No location data available for households';
      mapElement.appendChild(messageDiv);
      return;
    }

    // Center map on first valid household
    map.setView([validHouseholds[0].latitude, validHouseholds[0].longitude], 14);

    // Create marker cluster group for better performance
    const markers = [];

    validHouseholds.forEach(household => {
      const lat = parseFloat(household.latitude);
      const lng = parseFloat(household.longitude);

      // Create marker
      const marker = L.marker([lat, lng]).addTo(map);

      // Build popup content
      let popupContent = `
        <div class="popup-header">
          ${household.first_name} ${household.last_name}
        </div>
      `;

      // Add resources if available
      if (household.resources && household.resources.length > 0) {
        popupContent += '<ul class="resource-list">';
        household.resources.forEach(resource => {
          const icon = getCategoryIcon(resource.category);
          const quantity = resource.quantity > 1 ? ` (x${resource.quantity})` : '';
          popupContent += `
            <li>
              <span class="resource-icon">${icon}</span>
              <span>${resource.resource_name}${quantity}</span>
            </li>
          `;
        });
        popupContent += '</ul>';
      } else {
        popupContent += '<p class="no-resources">No available resources listed</p>';
      }

      // Bind popup to marker
      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });

      markers.push(marker);
    });

    // Fit map to show all markers
    if (markers.length > 1) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    console.log(`Successfully loaded ${markers.length} markers`);

  } catch (error) {
    console.error("Map initialization error:", error);
    
    // Hide loading message and show error
    if (loadingMessage) {
      loadingMessage.textContent = 'Error loading map data. Please try again later.';
      loadingMessage.style.color = '#c33';
    }
  }
});

// Helper function to get icon based on resource category
function getCategoryIcon(category) {
  const icons = {
    'supplies': '📦',
    'equipment': '⚙️',
    'skills': '🎓',
    'space': '🏠',
    'medical': '🏥',
    'food': '🍎',
    'water': '💧',
    'tools': '🔧'
  };
  return icons[category] || '📦';
}
