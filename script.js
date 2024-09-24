const map = L.map("map").setView([25.4358, 81.8463], 18);
var selectedValue = "today";

// Add a tile layer to the map (OpenStreetMap in this case)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; Jagdamba Tripathi",
}).addTo(map);
var customIcon = L.icon({
  iconUrl:
    "https://firebasestorage.googleapis.com/v0/b/travelkro-1e28f.appspot.com/o/pngtree-red-car-top-view-icon-png-image_3745904-removebg-preview.png?alt=media&token=24c61390-e6d4-489c-8c64-6356315aa61b", // Replace with your custom icon URL
  iconSize: [40, 40], // Set the size of the icon
  iconAnchor: [20, 40], // Point of the icon that corresponds to the marker's location
  popupAnchor: [0, -30], // Point from which the popup should open relative to the iconAnchor
  className: "car",
});
var marker = L.marker([0, 0], { icon: customIcon }).addTo(map);
marker.bindPopup("<b>You are here!</b>").openPopup();
var first = true;

// Update marker and map with the user's real-time location
function updatePosition(position) {
  if (selectedValue === "yesterday") {
    return;
  }
  // Update marker position
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;

  // Update marker position
  marker.setLatLng([lat, lng]);

  // Pan the map to the new position
  if (first) {
    map.panTo([lat, lng]);
    first = false;
  }

  console.log(`Latitude: ${lat}, Longitude: ${lng}`);
}

// Handle errors from geolocation API
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
    navigator.geolocation.getCurrentPosition(
      updatePosition,
      handleError,
      options
    );
  }, 4000); // Request location every 4 seconds
} else {
  alert("Geolocation is not supported by your browser");
}
// Sleep function that returns a promise
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function moveMarkerWithDelay(data) {
  for (let i = 0; i < data.length; i++) {
    // Set the marker's position
    if(selectedValue==="yesterday"){
    map.panTo([data[i][1], data[i][0]]);
    marker.setLatLng([data[i][1], data[i][0]]);
    // Calculate the time based on the index i
    const currentTime = new Date('September 24, 2024 13:24:00');
    currentTime.setMinutes(currentTime.getMinutes() + i/6); // Add i minutes to the current time

    // Format time as HH:MM AM/PM
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const formattedTime = `${hours % 12 || 12}:${String(minutes).padStart(2,"0")} ${hours >= 12 ? "PM" : "AM"}`;
    marker.bindPopup(`<b>You were here <br> at ${formattedTime} !</b>`);
    // Wait for 1.4 second (1400 milliseconds)
    await sleep(1000);
    }
  }
}
var polygon = null;
document
  .getElementById("date-selector")
  .addEventListener("change", function () {
    selectedValue = this.value;
    console.log("Selected date:", selectedValue);
    if (selectedValue === "yesterday") {
       document.getElementById("mainTitle").innerHTML="GoMap : Yesterday's Tracking"; 
      // Add the polygon to the map
      fetch("https://server-travelkro.vercel.app/location")
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          const transformedData = data.map((coord) => [coord[1], coord[0]]);
          polygon = L.polyline(transformedData, {
            color: "blue",
            weight: 4,
          }).addTo(map);
          marker.setLatLng([data[0][1], data[0][0]]);
          marker.bindPopup("<b>You were here!</b>").openPopup();
          moveMarkerWithDelay(data);

          //   map.fitBounds(polygon.getBounds());
        });
    } else {
      map.removeLayer(polygon);
      document.getElementById("mainTitle").innerHTML="GoMap : Today's Tracking";
      marker.setLatLng([0, 0]);
      marker.bindPopup("<b>You are here!</b>").openPopup();
      first = true;
    }
  });
