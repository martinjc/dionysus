/* global L, console, foursq_client_id, foursq_client_secret, untappd_client_id, untappd_client_secret */
(function(){
var map = L.map('map');
var pubs = [];

function add_pub(venue_data) {
    var marker = new L.marker([venue_data.location.lat, venue_data.location.lng], {
        title: venue_data.name
    }).addTo(map);
    pubs.append(marker);
    console.log(venue_data);

    /* Untappd stupid API limit
    var fsq_id = venue_data.id;
    $.getJSON("http://api.untappd.com/v4/venue/foursquare_lookup/" + fsq_id, {
        client_id: untappd_client_id,
        client_secret: untappd_client_secret
    }).done(function(data){
        console.log(data);
        console.log(data.response.venue.items[0].venue_id);
    }).fail(function(data) {
        console.log('oh no');
    });
    */
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

function onMoveEnd() {
    var center = map.getCenter();
    console.log(center);
    var ll = center.lat + "," + center.lng;
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
    });
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