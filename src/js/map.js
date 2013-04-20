/* global L */
var map = L.map('map')

var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib='Map data © OpenStreetMap contributors';
var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});

map.setView(new L.LatLng(51.3, 0.7),9);
map.addLayer(osm);