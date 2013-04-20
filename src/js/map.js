/* global L */
var map = L.map('map');

var tileUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var attrib='Map data © OpenStreetMap contributors';
var tileLayer = new L.TileLayer(tileUrl, {minZoom: 8, maxZoom: 18, attribution: attrib});

map.addLayer(tileLayer);

map.locate({setView: true, maxZoom: 18});
