let map;   
let markers = [];  // Array to store map markers
const allShops = [];  // Array to potentially store all shops data if needed

// Initialize the map and handle user location
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 53.4808, lng: -2.2426 }, // Default location set to Manchester, UK
        zoom: 12 // Initial zoom level
    });

    // Check if the browser supports geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(userLocation); // Center map on user's location
            
            // Place a marker on the user's location
            new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location",
                icon: {
                    url: 'icons/user-marker.png', // Custom icon for user's location
                    scaledSize: new google.maps.Size(40, 40) // Set the size of the marker
                }
            });

            // Search for ice cream shops near the user's location
            searchIceCreamShops(userLocation);
        }, () => {
            // Handle error if geolocation fails or is denied
            console.error('Error retrieving location.');
            alert('Unable to retrieve your location. Setting to default.');
        });
    }
}

// Function to clear all existing markers from the map
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null)); // Remove marker from the map
    markers = []; // Reset the markers array
}

// Function to apply the filters based on user input
function applyFilters() {
    const maxDistance = document.getElementById('distance').value * 1000; // Convert distance from km to meters
    const minRating = parseFloat(document.getElementById('rating').value); // Get minimum rating value
    searchIceCreamShops(map.getCenter(), maxDistance, minRating); // Call search with filters
}

// Function to search for ice cream shops using Google Places API
function searchIceCreamShops(location, radius = 5000, minRating = 0) {
    const service = new google.maps.places.PlacesService(map); // Initialize Places Service

    const request = {
        location: location,  // Center of search
        radius: radius,  // Search radius in meters
        type: ['food', 'point_of_interest'],  // Types of places to search
        keyword: 'ice cream'  // Search keyword to filter results
    };

    // Perform a nearby search using the Places Service
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Filter results based on minimum rating
            const filteredShops = results.filter(shop => shop.rating >= minRating);
            if (filteredShops.length > 0) {
                displayShopsOnMap(filteredShops); // Display the filtered shops on the map
            } else {
                alert('No ice cream shops or trucks found in the area.');
            }
        } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            // Handle no results scenario
            alert('No results found. Try increasing the radius or modifying the filters.');
        } else {
            // Handle other possible errors
            console.error('Places service error:', status);
        }
    });
}

// Function to display the filtered ice cream shops on the map
function displayShopsOnMap(shops) {
    clearMarkers(); // Clear existing markers before adding new ones

    shops.forEach(shop => {
        // Determine if the shop is a van or truck based on its name
        const isVan = shop.name.toLowerCase().includes('van') || shop.name.toLowerCase().includes('truck');
        
        // Choose an appropriate icon for the marker
        const icon = isVan
            ? {
                url: 'icons/ice-cream-truck-marker.png', // Icon for ice cream trucks
                scaledSize: new google.maps.Size(25, 25) // Size of the truck icon
            }
            : {
                url: 'icons/ice-cream-shop-marker.png', // Icon for ice cream shops
                scaledSize: new google.maps.Size(25, 25) // Size of the shop icon
            };

        // Create a marker for each shop
        const marker = new google.maps.Marker({
            position: shop.geometry.location,
            map: map,
            title: shop.name,
            icon: icon // Use the selected icon
        });

        // Create an information window that shows details of the shop
        const infowindow = new google.maps.InfoWindow({
            content: `
                <div class="popup-content">
                    <h3>${shop.name}</h3>
                    <p>Rating: ${shop.rating}</p>
                    <p>Address: ${shop.vicinity}</p>
                    <a href="https://www.google.com/maps/place/?q=place_id:${shop.place_id}" target="_blank">View on Google Maps</a>
                </div>
            `
        });

        // Add a click event listener to open the info window when the marker is clicked
        marker.addListener('click', () => {
            infowindow.open(map, marker);
        });

        markers.push(marker); // Store the marker in the markers array
    });
}

// Initialize the map when the page loads
window.onload = initMap;




