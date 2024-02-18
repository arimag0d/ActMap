let map;

async function initMap() {
	const styledMapType = new google.maps.StyledMapType(
		[
			{
			  "elementType": "geometry",
			  "stylers": [
				{
				  "color": "#242f3e"
				}
			  ]
			},
			{
			  "elementType": "labels.text.fill",
			  "stylers": [
				{
				  "color": "#746855"
				}
			  ]
			},
			{
			  "elementType": "labels.text.stroke",
			  "stylers": [
				{
				  "color": "#242f3e"
				}
			  ]
			},
			{
			  "featureType": "administrative.locality",
			  "elementType": "labels.text.fill",
			  "stylers": [
				{
				  "color": "#d59563"
				}
			  ]
			},
			{
			  "featureType": "poi",
			  "elementType": "labels.text.fill",
			  "stylers": [
				{
				  "color": "#d59563"
				}
			  ]
			},
			{
			  "featureType": "poi.park",
			  "elementType": "geometry",
			  "stylers": [
				{
				  "color": "#263c3f"
				}
			  ]
			},
			{
			  "featureType": "poi.park",
			  "elementType": "labels.text.fill",
			  "stylers": [
				{
				  "color": "#6b9a76"
				}
			  ]
			},
			{
			  "featureType": "road",
			  "elementType": "geometry",
			  "stylers": [
				{
				  "color": "#38414e"
				}
			  ]
			},
			{
			  "featureType": "road",
			  "elementType": "geometry.stroke",
			  "stylers": [
				{
				  "color": "#212a37"
				}
			  ]
			},
			{
			  "featureType": "road",
			  "elementType": "labels.text.fill",
			  "stylers": [
				{
				  "color": "#9ca5b3"
				}
			  ]
			},
			{
			  "featureType": "road.highway",
			  "elementType": "geometry",
			  "stylers": [
				{
				  "color": "#746855"
				}
			  ]
			},
			{
			  "featureType": "road.highway",
			  "elementType": "geometry.stroke",
			  "stylers": [
				{
				  "color": "#1f2835"
				}
			  ]
			},
			{
			  "featureType": "road.highway",
			  "elementType": "labels.text.fill",
			  "stylers": [
				{
				  "color": "#f3d19c"
				}
			  ]
			},
			{
			  "featureType": "transit",
			  "elementType": "geometry",
			  "stylers": [
				{
				  "color": "#2f3948"
				}
			  ]
			},
			{
			  "featureType": "transit.station",
			  "elementType": "labels.text.fill",
			  "stylers": [
				{
				  "color": "#d59563"
				}
			  ]
			},
			{
			  "featureType": "water",
			  "elementType": "geometry",
			  "stylers": [
				{
				  "color": "#17263c"
				}
			  ]
			},
			{
			  "featureType": "water",
			  "elementType": "labels.text.fill",
			  "stylers": [
				{
				  "color": "#515c6d"
				}
			  ]
			},
			{
			  "featureType": "water",
			  "elementType": "labels.text.stroke",
			  "stylers": [
				{
				  "color": "#17263c"
				}
			  ]
			}
		],
		{ name: "night mode" },
	);

	var mapOptions = {
		center: {lat: 49.4105226, lng: 26.9126864},
		zoom: 15,
		disableDefaultUI: true,
		mapTypeControl: false,
		mapTypeControlOptions: {
			mapTypeIds: ["roadmap", "satellite", "hybrid", "terrain", "styled_map"],
		},
		minZoom: 5,
		maxZoom: 15,
		restriction: {
			latLngBounds: {
			north: 85,
			south: -85,
			west: -180,
			east: 180
			},
			strictBounds: true
		},
	};
	map = new google.maps.Map(document.getElementById('map'), mapOptions);

	map.mapTypes.set('styled_map', styledMapType); 
	map.setMapTypeId('styled_map');
}

function addMarker(location, map, category, description, date, time) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });

    var modalContent = document.querySelector('#markerModal .modal-body');
	modalContent.innerHTML = `
		Lat: ${location.lat()}<br>
		Lng: ${location.lng()}<br>
		Category: ${category}<br>
		Description: ${description}<br>
		Date: ${date}<br>
		Time: ${time}
	`;
	google.maps.event.addListener(marker, 'click', function() {
		$('#markerModal').modal('show');
	});

    $.ajax({
        url: '/save-marker',
        method: 'POST',
        data: { cookie: document.cookie, lat: location.lat(), lng: location.lng(), category: category, description: description, date: date, time: time },
        success: function(response) {
            console.log('Маркер збережено на сервері');
        },
        error: function(xhr, status, error) {
            console.error('Помилка при збереженні маркера:', error);
        }
    });
}

let marker;

function previewMarker(location, map) {
    marker = new google.maps.Marker({
        position: location,
        map: map,
		icon: {
			url: 'marker-preview.png',
			scaledSize: new google.maps.Size(40.96, 46.08),
			origin: new google.maps.Point(0, 0),
		},
    });
}

let mapElement;
let mousemoveHandler;
let clickListener;

let position;

$(document).ready(function() {
	initMap();

	$('.btn-add-marker').click(function() {
		let mapElement = document.getElementById('map');
		let markerPreview = document.getElementById('markerPreview');

		mapElement.addEventListener('mousemove', mousemoveHandler = function(event) {
			var x = event.clientX;
			var y = event.clientY;

			markerPreview.style.left = (x - 20) + 'px';
			markerPreview.style.top = (y - 45) + 'px';
			markerPreview.style.display = 'block';
		});

		mapElement.addEventListener('mouseout', function() {
			markerPreview.style.display = 'none';
		});

		clickListener = google.maps.event.addListener(map, 'click', function(event) {
			position = event.latLng;

			markerPreview.style.display = 'none';
			mapElement.removeEventListener('mousemove', mousemoveHandler);
			previewMarker(event.latLng, map);
			google.maps.event.removeListener(clickListener);
		});
	});
});


function addMarkersToMap(markers, map) {
    markers.forEach(marker => {
        var markerPosition = { lat: marker.lat, lng: marker.lng };
        var newMarker = new google.maps.Marker({
            position: markerPosition,
            map: map
        });

		var modalContent = document.querySelector('#markerModal .modal-body');
		modalContent.innerHTML = `
			Lat: ${marker.lat}<br>
			Lng: ${marker.lng}<br>
			Category: ${marker.category}<br>
			Description: ${marker.description}<br>
			Date: ${marker.date}<br>
			Time: ${marker.time}
		`;
		google.maps.event.addListener(newMarker, 'click', function() {
			$('#markerModal').modal('show');
		});
    });
}

$(document).ready(function() {
    $.ajax({
        url: '/markers',
        method: 'GET',
        success: function(markers) {
            addMarkersToMap(markers, map);
        },
        error: function(xhr, status, error) {
            console.error('Помилка при отриманні маркерів:', error);
        }
    });
});

var offcanvasElement = document.getElementById('offcanvasAddMarker');
offcanvasElement.addEventListener('hidden.bs.offcanvas', function () {
    document.getElementById('buttons-container').style.display = 'block';
});

document.getElementById('closeButton').addEventListener('click', function() {
	var modal = new bootstrap.Modal(document.getElementById('confirmModal'));
	modal.show();
});

var confirmButton = document.getElementById('confirmButton');

confirmButton.addEventListener('click', function() {
	let mapElement = document.getElementById('map');
	$('#confirmModal').modal('hide');
	$('#offcanvasAddMarker').offcanvas('hide');
	google.maps.event.removeListener(clickListener);
	mapElement.removeEventListener('mousemove', mousemoveHandler);
	marker.setMap(null);
});

var markerConfirmButton = document.getElementById('markerConfirm');
let category;

markerConfirmButton.addEventListener('click', function() {
	var description = document.getElementById('descriptionFormControlTextarea').value;
	var date = document.getElementById('DateInput').value;
	var time = document.getElementById('TimeInput').value;
    addMarker(position, map, category, description, date, time);
	$('#offcanvasAddMarker').offcanvas('hide');
	marker.setMap(null);
});

function changeButtonText(text) {
	category = text;
    document.getElementById('chooseCtgButton').innerText = text;
}

var exitFilter = document.getElementById('exitFilter');

exitFilter.addEventListener('click', function() {
	$('#offcanvasFilter').offcanvas('hide');
});