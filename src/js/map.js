/* global L, console, foursq_client_id, foursq_client_secret, zooms, lastfm_api_key, lastfm_client_secret */
(function(){
var map = L.map('map');

var pub_ids = [];
var pubs = [];

var last_fm_event_ids = [];
var last_fm_events = [];

var lastfm = new LastFM({
    apiKey : lastfm_api_key,
    apiSecret : lastfm_client_secret
});

// http://stackoverflow.com/questions/1403888/get-url-parameter-with-jquery
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&|#]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}


function do_auth() {
    var auth = getURLParameter('auth');

    if(localStorage.lastfmauth === undefined) {
        if(auth === 'lastfm') {
            var token = getURLParameter('token');
            lastfm.auth.getSession({
                api_key : lastfm_api_key,
                token : token
            }, {success: function(data){
                localStorage.lastfmauth = JSON.stringify(data.session);
            }, error: function(code, message){
                console.log(message);
            }});
        }
    }
    if (localStorage.foursquareauth === undefined) {
        var auth = decodeURIComponent((new RegExp('[?|&|#]' + 'access_token' + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.hash)||[,""])[1].replace(/\+/g, '%20'))||null;
        localStorage.foursquareauth = auth;
    }
    console.log(localStorage.foursquareauth);
}

function hide_show_markers() {
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
}

function add_pub(venue_data) {
    var myIcon = L.icon({
        iconUrl: 'img/beer.png',
        iconSize: [32,32],
        popupAnchor: [0, -16]
    });
    var marker = new L.marker([venue_data.location.lat, venue_data.location.lng], {
        title: venue_data.name,
        icon: myIcon
    });
    marker.bindPopup("<h1>" + venue_data.name + "</h1>");
    if(pub_ids.indexOf(venue_data.id) <= -1) {
        pub_ids.push(venue_data.id);
        pubs.push(marker);
    }
}

function add_recommended_pub(venue_data) {
    var myIcon = L.icon({
        iconUrl: 'img/beer_rec.png',
        iconSize: [48,48],
        popupAnchor: [0, -24]
    });
    var marker = new L.marker([venue_data.location.lat, venue_data.location.lng], {
        title: venue_data.name,
        icon: myIcon
    });
    marker.bindPopup("<h1>" + venue_data.name + "</h1>");
    if(pub_ids.indexOf(venue_data.id) <= -1) {
        pub_ids.push(venue_data.id);
        pubs.push(marker);
    }
}

function add_gig(event_data) {
    var myIcon = L.icon({
        iconUrl: 'img/music.png',
        iconSize: [32,32],
        popupAnchor: [0, -16]
    });
    var marker = new L.marker([event_data.venue.location["geo:point"]["geo:lat"], event_data.venue.location["geo:point"]["geo:long"]], {
        title: event_data.title,
        icon: myIcon
    });
    marker.bindPopup("<h1>" + event_data.title + "</h1><h3>" + event_data.startDate + "</h3><p>" + event_data.venue.name + "</p>");
    if(last_fm_event_ids.indexOf(event_data.id) <= -1) {
        last_fm_event_ids.push(event_data.id);
        last_fm_events.push(marker);
    }
}

function add_recommended_gig(event_data) {
    var myIcon = L.icon({
        iconUrl: 'img/music_rec.png',
        iconSize: [32,32],
        popupAnchor: [0, -16]
    });
    var marker = new L.marker([event_data.venue.location["geo:point"]["geo:lat"], event_data.venue.location["geo:point"]["geo:long"]], {
        title: event_data.title,
        icon: myIcon
    });
    marker.bindPopup("<h1>" + event_data.title + "</h1><h3>" + event_data.startDate + "</h3><p>" + event_data.venue.name + "</p>");
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
    var ll = center.lat + "," + center.lng;
    var map_width = Math.max(map.getSize().x, map.getSize().y);
    var zoom = map.getZoom();
    var metres = Math.min(zooms[zoom] * map_width, 100000);

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
        limit: 30,
        format: "json",
        distance: metres/1000
    }).done(function(data) {
        $.each(data.events.event, function(i, item) {
            add_gig(item);
        });
        hide_show_markers();
    });
    if (localStorage.lastfmauth) {
        var session = JSON.parse(localStorage.lastfmauth);
        lastfm.user.getRecommendedEvents({
            latitude: center.lat,
            longitude: center.lng,
            limit: 40
        }, session=session,
        { success: function(data) {
            $.each(data.events.event, function(i, item) {
                add_recommended_gig(item);
            });
            hide_show_markers();
        }, error: function(code, message) {
            console.log(message);
        }});
    }

    if(localStorage.foursquareauth) {
        $.getJSON("https://api.foursquare.com/v2/venues/explore", {
            ll: ll,
            radius: metres,
            section: 'drinks',
            limit: 50,
            oauth_token: localStorage.foursquareauth,
            v: 20130420
        })
        .done(function(data) {
            $.each(data.response.groups, function(i, group) {
                console.log(group);
                $.each(group.items, function(j, item) {
                    console.log(item.venue.name);
                    add_recommended_pub(item.venue);
                });
            });
            hide_show_markers();
        });        
    }
}


function initmap() {
    var tileUrl='http://{s}.tile.cloudmade.com/364b324514d240c8afdd7ba132fd4841/997/256/{z}/{x}/{y}.png';
    var attrib='Map data © OpenStreetMap contributors';
    var tileLayer = new L.TileLayer(tileUrl, {minZoom: 8, maxZoom: 18, attribution: attrib});

    map.addLayer(tileLayer);
    map.locate({setView: true, maxZoom: 16});

    do_auth();

    map.on('locationerror', onLocationError);
    map.on('locationfound', onLocationFound);
    map.on('moveend', onMoveEnd);
}

initmap();
})();