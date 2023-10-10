const file_cities = "https://raw.githubusercontent.com/pixelfed/pixelfed/dev/storage/app/cities.json";

Promise.all([
    d3.json(file_cities)
]).then(function(data) {

    const cities = data[0].filter((city => city.country == "CA"));
    let pins = [];
    let clickPin;
    let clickPath;

    // replace "toner" here with "terrain" or "watercolor"
    var map = new L.Map("map", {
        center: new L.LatLng(59.400, -95.933),
        zoom: 4
    });
    // var layer = new L.StamenTileLayer("toner");
    // map.addLayer(layer);
    // var layer = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png', {
    L.maplibreGL({
        style: 'https://tiles.stadiamaps.com/styles/stamen_toner.json',
        attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors',
    }).addTo(map);

    for (let i = 0; i < cities.length; i++) {
        let city = cities[i];
        let lat = city.lat;
        let lng = city.lng;

        pins[lat + "_" + lng] = L.marker(
                [lat, lng],
                {icon: L.divIcon({ className: "map-icon" })}
            ).addTo(map)
            .bindPopup(city.name);
    }

    map.on("click", function(ev) {
        if (clickPin) {
            map.removeLayer(clickPin);
        }
        if (clickPath) {
            map.removeLayer(clickPath);
        }

        let = prevClosest = document.querySelector(".map-icon-closest");
        if (prevClosest) {
            prevClosest.classList.remove('map-icon-closest');
        }

        clickPin = L.marker(
            ev.latlng,
            {icon: L.divIcon({ className: "map-icon map-icon-click" })}
        ).addTo(map);

        let latSorted = cities.toSorted(function (a, b) {
            let aDist = Math.abs(ev.latlng.lat - a.lat);
            let bDist = Math.abs(ev.latlng.lat - b.lat);

            if (aDist < bDist) {
                return -1;
            } else if (aDist > bDist) {
                return 1;
            }
            return 0;
        });

        // get shortest distance between coordinates https://stackoverflow.com/a/55083771
        let closestPin = latSorted[0];
        let shortestDist = coordSquared(ev.latlng, latSorted[0]);
        console.log(ev.latlng, closestPin, shortestDist);
        for (let i = 0; i < latSorted.length; i++) {
            let dist = coordSquared(ev.latlng, latSorted[i]);
            if (dist < shortestDist) {
                closestPin = latSorted[i];
                shortestDist = dist;
                console.log(ev.latlng, closestPin, shortestDist);
            }
        }

        clickPath = L.polyline(
            [ev.latlng, [closestPin.lat, closestPin.lng]],
            {color: "red"}
        ).addTo(map);

        pins[closestPin.lat + "_" + closestPin.lng].setIcon(L.divIcon({ className: "map-icon map-icon-closest" }));
        pins[closestPin.lat + "_" + closestPin.lng].openPopup();
        map.panTo([closestPin.lat, closestPin.lng]);
    });
});

function coordSquared(a, b) {
    let diffLat = Math.abs(a.lat - b.lat);
    let diffLng = Math.abs(a.lng - b.lng);
    return (diffLat*diffLat) + (diffLng*diffLng);
}