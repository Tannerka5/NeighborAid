

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize map (fallback center if no data yet)
  const map = L.map("map").setView([39.8283, -98.5795], 4); // US center

  // Base map layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  let markers = [];

  try {
    const response = await fetch("/directory/map/data");
    const households = await response.json();

    if (!households || households.length === 0) {
      console.log("No map data returned");
      return;
    }

    // Center map on first household
    map.setView([households[0].latitude, households[0].longitude], 14);

    households.forEach(h => {
      if (!h.latitude || !h.longitude) return;

      const marker = L.marker([h.latitude, h.longitude]).addTo(map);

      let popupHtml = `<strong>${h.first_name} ${h.last_name}</strong><br/>`;

      if (h.resources && h.resources.length > 0) {
        popupHtml += "<ul>";
        h.resources.forEach(r => {
          popupHtml += `<li>${r.resource_name} (${r.quantity})</li>`;
        });
        popupHtml += "</ul>";
      } else {
        popupHtml += "<em>No available resources</em>";
      }

      marker.bindPopup(popupHtml);
      marker.resources = h.resources || [];

      markers.push(marker);
    });

  } catch (err) {
    console.error("Map initialization error:", err);
  }
});