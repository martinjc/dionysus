/* global L, console, foursq_client_id, foursq_client_secret, zooms, lastfm_api_key */
(function(){
var map = L.map('map');

var pub_ids = [];
var pubs = [];

var last_fm_event_ids = [];
var last_fm_events = [];

function hide_show_markers() {
    /*
    $.each(pubs, function(i, pub){
        if(map.getBounds().contains(pub.getLatLng())) {
            map.addLayer(pub);
        }
        else {
            map.removeLayer(pub);
        }
    });
    $.each(last_fm_events, function(i, item){
        if(map.getBounds().contains(item.getLatLng())) {
            map.addLayer(item);
        }
        else {
            map.removeLayer(item);
        }
    });
    */
}

function add_pub(venue_data) {
    var marker = new L.marker([venue_data.location.lat, venue_data.location.lng], {
        title: venue_data.name
    });
    if(pub_ids.indexOf(venue_data.id) <= -1) {
        pub_ids.push(venue_data.id);
        pubs.push(marker);
    }
}

function add_gig(event_data) {
    var marker = new L.marker([event_data.venue.location["geo:point"]["geo:lat"], event_data.venue.location["geo:point"]["geo:long"]], {
        title: event_data.title
    });
    if(last_fm_event_ids.indexOf(event_data.id) <= -1) {
        last_fm_event_ids.push(event_data.id);
        last_fm_events.push(marker);
    }
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
    var bounds = map.getBounds();
    console.log(bounds.getNorthEast());
    console.log(bounds.getSouthWest());
    var ll = center.lat + "," + center.lng;
    var map_width = Math.max(map.getSize().x, map.getSize().y);
    var zoom = map.getZoom();
    var metres = zooms[zoom] * map_width;
    /*
    $.getJSON("https://api.foursquare.com/v2/venues/search", {
        ll: ll,
        radius: metres,
        limit: 50,
        intent: "browse",
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

    $.getJSON("http://ws.audioscrobbler.com/2.0/", {
        method: "geo.getevents",
        long: center.lng,
        lat: center.lat,
        api_key: lastfm_api_key,
        format: "json",
        distance: metres/1000
    }).done(function(data) {
        $.each(data.events.event, function(i, item) {
            add_gig(item);
        });
        hide_show_markers();
    });
*/
    var query_string = 'SELECT eid FROM event_member WHERE uid IN (SELECT page_id FROM place WHERE distance(latitude, longitude, "' + center.lat + '", "' + center.lng + '") < 3000) AND start_time < "1367331612" AND start_time > "1366381212"';
    FB.api(
        {
            method: 'fql.query',            
            access_token: fb_access_token,
            query: query_string
        },
        function(response) {
            console.log(response);
            $.each(response, function(i, item) {
                console.log(item.eid);
                FB.api('/' + item.eid, function(response){
                    console.log(response);
                    var venue_id = response.venue.id;
                    FB.api('/' + venue_id, function(venue_response) {
                        console.log(venue_response);
                    })
                });
            });
        }
    );
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