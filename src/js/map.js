/* global L, console, foursq_client_id, foursq_client_secret */
(function(){
var map = L.map('map');
var pubs = [];

function hide_show_markers() {
    console.log("showing_markers");
    console.log(pubs);
    $.each(pubs, function(i, pub){
        console.log(pub);
        if(map.getBounds().contains(pub.getLatLng())) {
            map.addLayer(pub);
        }
        else {
            map.removeLayer(pub);
        }
    });
}


function add_pub(venue_data) {
    var marker = new L.marker([venue_data.location.lat, venue_data.location.lng], {
        title: venue_data.name
    });
    pubs.push(marker);
}


function showError(ev) {
    console.log('not implemented yet! - showError ' + ev);
}

function onLocationError(ev) {
    showError(ev);
}

function onLocationFound() {
    console.log('not implemented yet! - onLocationFound');
}

function radians(degrees) {
    return degrees * (Math.PI/180);
}

function getMapWidthInMetres() {
    var center = map.getCenter();
    var bounds = map.getBounds();

    console.log(center);
    console.log(bounds);

    //haversine formula
    var R = 6371; // km
    var dLat = radians(center.lat - bounds.getNorthEast.lat);
    var dLon = radians(center.lng - bounds.getNorthEast.lng);
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(radians(center.lat)) * Math.cos(radians(bounds.getNorthEast.lat)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}

function onMoveEnd() {
    var center = map.getCenter();
    console.log(center);
    var ll = center.lat + "," + center.lng;
    console.log(getMapWidthInMetres());
    $.getJSON("https://api.foursquare.com/v2/venues/search", {
        ll: ll,
        radius: 500,
        limit: 50,
        intent: "checkin",
        categoryId: "4bf58dd8d48988d155941735,4bf58dd8d48988d11b941735,4d4b7105d754a06376d81259",
        client_id: foursq_client_id,
        client_secret: foursq_client_secret,
        v: 20130420
    })
    .done(function(data) {
        $.each(data.response.venues, function(i, item) {
            add_pub(item);
        });
        hide_show_markers();
    });
    hide_show_markers();
}


function initmap() {
    var tileUrl='http://{s}.tile.cloudmade.com/364b324514d240c8afdd7ba132fd4841/997/256/{z}/{x}/{y}.png';
    var attrib='Map data © OpenStreetMap contributors';
    var tileLayer = new L.TileLayer(tileUrl, {minZoom: 8, maxZoom: 18, attribution: attrib});

    map.addLayer(tileLayer);
    map.locate({setView: true, maxZoom: 17});

    map.on('locationerror', onLocationError);
    map.on('locationfound', onLocationFound);
    map.on('moveend', onMoveEnd);
}

initmap();
})();