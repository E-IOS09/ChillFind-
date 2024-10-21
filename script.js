let map;
let markers = [];
let allShops = []; // Store all shops initially before filtering

function initMap() {
    const defaultLocation = { lat: 53.4808, lng: -2.2426 }; // Default to Manchester, UK

    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 12
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(userLocation);

            new google.maps.Marker({
                position: userLocation,
                map: map,
                title: "Your Location",
                icon: {
                    url: 'icons /user-marker.png',
                    scaledSize: new google.maps.Size(40, 40)
                }
            });

            searchIceCreamShops(userLocation);
        }, () => {
            // Geolocation failed, fallback to default location
            console.error('Error retrieving location. Using default location.');
            searchIceCreamShops(defaultLocation);
        });
    } else {
        // Geolocation not supported, fallback to default location
        console.error('Geolocation not supported. Using default location.');
        searchIceCreamShops(defaultLocation);
    }
}

function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Apply the filters dynamically after loading all ice cream shops/trucks
function applyFilters() {
    const maxDistance = document.getElementById('distance').value * 1000;
    const minRating = parseFloat(document.getElementById('rating').value);
    filterIceCreamShops(maxDistance, minRating);
}

// Initial search and loading of all ice cream shops/trucks
function searchIceCreamShops(location, radius = 5000) {
    const service = new google.maps.places.PlacesService(map);

    const request = {
        location: location,
        radius: radius,
        type: ['food', 'point_of_interest'],
        keyword: 'ice cream'
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Store all results first for future filtering
            allShops = results;
            displayShopsOnMap(allShops);
        } else {
            console.error('Error with places service:', status);
        }
    });
}

// Function to apply filters and display shops accordingly
function filterIceCreamShops(maxDistance, minRating) {
    // Filter the stored shops based on the distance and rating
    const filteredShops = allShops.filter(shop => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(map.getCenter(), shop.geometry.location);
        return distance <= maxDistance && shop.rating >= minRating;
    });

    if (filteredShops.length > 0) {
        displayShopsOnMap(filteredShops);
    } else {
        alert('No ice cream shops match the current filters.');
    }
}

function displayShopsOnMap(shops) {
    clearMarkers();

    shops.forEach(shop => {
        const isVan = shop.name.toLowerCase().includes('van') || shop.name.toLowerCase().includes('truck');

        const icon = isVan
            ? { url: 'icons /ice-cream-truck-marker.png', scaledSize: new google.maps.Size(25, 25) }
            : { url: 'icons /ice-cream-shop-marker.png', scaledSize: new google.maps.Size(25, 25) };

        const marker = new google.maps.Marker({
            position: shop.geometry.location,
            map: map,
            title: shop.name,
            icon: icon
        });

        const infowindow = new google.maps.InfoWindow({
            content: `
                <div class="popup-content">
                    <h3>${shop.name}</h3>
                    <p>Rating: ${shop.rating || 'N/A'}</p>
                    <p>Address: ${shop.vicinity}</p>
                    <a href="https://www.google.com/maps/place/?q=place_id:${shop.place_id}" target="_blank">View on Google Maps</a>
                </div>
            `
        });

        marker.addListener('click', () => {
            infowindow.open(map, marker);
        });

        markers.push(marker);
    });
}

window.onload = initMap;
