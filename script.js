const sheetId = '1rl8YOQ8Ez6qsGIdkYbvZwRWqFcfGEbAa3KRKoZWaOKo';
const apiKey = 'AIzaSyD5SCv6wFw-XXdK13L369BPmnTA_59fxRg';

function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: { lat: -27.464145, lng: 141.278832 },
  });

  const startMarker = new google.maps.Marker({
    position: { lat: -19.2535, lng: 146.81724 },
    map: map,
    title: "St Joseph's Catholic School the Strand",
  });

  const joeysMarker = new google.maps.Marker({
    position: { lat: -19.2535, lng: 146.81724 },
    map: map,
    title: 'Joeys 150th Walkers',
    icon: {
      url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    },
  });

  const finishMarker = new google.maps.Marker({
    position: { lat: -37.37982, lng: 140.83947 },
    map: map,
    title: 'Mary Mackillop Memorial School',
  });

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    preserveViewport: true,
  });

  directionsRenderer.setOptions({
    suppressMarkers: true,
    polylineOptions: { strokeColor: 'red' },
  });

  const start = new google.maps.LatLng(-19.2535, 146.81724);
  const end = new google.maps.LatLng(-37.37982, 140.83947);

  directionsService.route(
    {
      origin: start,
      destination: end,
      travelMode: 'WALKING',
    },
    (response, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(response);
        updateMarkerPosition();
      } else {
        console.error(`Directions request failed due to ${status}`);
      }
    }
  );

  function updateMarkerPosition() {
    $.getJSON(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Form%20Responses%201!A2:B?key=${apiKey}`,
      (data) => {
        const totalKms = data.values
          .map((row) => parseFloat(row[1]))
          .reduce((sum, kms) => sum + kms, 0);

        const route = directionsRenderer.getDirections();
        const path = route.routes[0].overview_path;
        let remainingKms = totalKms;

        for (let i = 0; i < path.length - 1; i++) {
          const a = path[i];
          const b = path[i + 1];
          const distance = google.maps.geometry.spherical.computeDistanceBetween(a, b) / 1000;
          if (remainingKms >= distance) {
            remainingKms -= distance;
          } else {
            const fraction = remainingKms / distance;
            const interpolatedLatLng = google.maps.geometry.spherical.interpolate(a, b, fraction);
            joeysMarker.setPosition(interpolatedLatLng);
            break;
          }
        }
      }
    );
  }

  setInterval(updateMarkerPosition, 60000);
}

google.maps.event.addDomListener(window, 'load', initMap);
