/* global L */
var map = L.map('map');

var tileUrl='http://{s}.tile.cloudmade.com/364b324514d240c8afdd7ba132fd4841/997/256/{z}/{x}/{y}.png';
var attrib='Map data © OpenStreetMap contributors';
var tileLayer = new L.TileLayer(tileUrl, {minZoom: 8, maxZoom: 18, attribution: attrib});

map.addLayer(tileLayer);

map.locate({setView: true, maxZoom: 18});
