// Initialize the map and set its view to a specific location and zoom level
const map = L.map("map").setView([25.4358, 81.8463], 18);

// Default selected value for date tracking
var selectedValue = "today";

// Add a tile layer to the map (OpenStreetMap in this case)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; Jagdamba Tripathi",
}).addTo(map);

// Define a custom icon for the marker
var customIcon = L.icon({
  iconUrl: "https://firebasestorage.googleapis.com/v0/b/travelkro-1e28f.appspot.com/o/pngtree-red-car-top-view-icon-png-image_3745904-removebg-preview.png?alt=media&token=24c61390-e6d4-489c-8c64-6356315aa61b",
  iconSize: [40, 40], // Set the size of the icon
  iconAnchor: [20, 40], // Point of the icon that corresponds to the marker's location
  popupAnchor: [0, -30], // Point from which the popup should open relative to the iconAnchor
  className: "car", // Custom class for additional styling
});

// Initialize the marker with a starting position
var marker = L.marker([0, 0], { icon: customIcon }).addTo(map);
marker.bindPopup("<b>You are here!</b>").openPopup();

// Flag to determine if the map has been panned to the initial position
var first = true;

// Update marker and map with the user's real-time location
function updatePosition(position) {
  if (selectedValue === "yesterday") {
    return; // Skip updating if the selected value is "yesterday"
  }

  // Extract latitude and longitude from the position object
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;

  // Update marker position
  marker.setLatLng([lat, lng]);

  // Pan the map to the new position only if it's the first update
  if (first) {
    map.panTo([lat, lng]);
    first = false;
  }

  console.log(`Latitude: ${lat}, Longitude: ${lng}`);
}

// Handle errors from the geolocation API
function handleError(error) {
  console.error(`Error Code: ${error.code} - ${error.message}`);
}

// Request high accuracy location updates
var options = {
  enableHighAccuracy: true,
  timeout: 4000, // 4 seconds timeout
  maximumAge: 0,
};

// Start tracking location and update every 4 seconds
if (navigator.geolocation && selectedValue === "today") {
  setInterval(() => {
    navigator.geolocation.getCurrentPosition(updatePosition, handleError, options);
  }, 4000); // Request location every 4 seconds
} else {
  alert("Geolocation is not supported by your browser");
}

// Sleep function that returns a promise
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Move the marker along a predefined path with delays
async function moveMarkerWithDelay(data) {

  for (let i = 0; i < data.length; i++) {
    // Set the marker's position for "yesterday" tracking
    if (selectedValue === "yesterday") {
      const currentPosition = [data[i][1], data[i][0]];

      map.panTo(currentPosition);
      marker.setLatLng(currentPosition);

      // Calculate the time based on the index i
      const currentTime = new Date("September 24, 2024 13:24:00");
      currentTime.setMinutes(currentTime.getMinutes() + i / 6); // Add i minutes to the current time

      // Format time as HH:MM AM/PM
      const hours = currentTime.getHours();
      const minutes = currentTime.getMinutes();
      const formattedTime = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? "PM" : "AM"}`;

      // Update marker popup with formatted time
      marker.bindPopup(`<b>You were here <br> at ${formattedTime}!</b>`);

      // Wait for 1 second before moving to the next position
      await sleep(1000);
      previousPosition = currentPosition; // Update previous position
    }
  }
}

// Initialize a variable for polygon
var polygon = null;

// Event listener for date selector changes
document.getElementById("date-selector").addEventListener("change", function () {
  selectedValue = this.value; // Get the selected value from the dropdown
  console.log("Selected date:", selectedValue);

  if (selectedValue === "yesterday") {
    document.getElementById("mainTitle").innerHTML = "GoMap: Yesterday's Tracking";

    // Fetch tracking data from the server
    fetch("https://server-travelkro.vercel.app/location")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Transform data for polyline
        const transformedData = data.map((coord) => [coord[1], coord[0]]);
        
        // Create and add the polyline to the map
        polygon = L.polyline(transformedData, {
          color: "blue",
          weight: 4,
        }).addTo(map);

        // Set marker to the starting position
        marker.setLatLng([data[0][1], data[0][0]]);
        marker.bindPopup("<b>You were here!</b>").openPopup();
        moveMarkerWithDelay(data); // Start moving the marker along the path
      });

    // Optionally fit the map bounds to the polygon
    // map.fitBounds(polygon.getBounds());

  } else {
    // If today's tracking is selected, reset the map and marker
    if (polygon) {
      map.removeLayer(polygon); // Remove the polygon from the map if it exists
    }
    document.getElementById("mainTitle").innerHTML = "GoMap: Today's Tracking";
    marker.setLatLng([0, 0]); // Reset marker position
    marker.bindPopup("<b>You are here!</b>").openPopup();
    first = true; // Reset the flag for panning
  }
});
