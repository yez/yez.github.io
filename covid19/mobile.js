var map = L.map('map', { doubleClickZoom: false }).setView([25, 0], 3);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 18,
  id: 'mapbox/light-v9',
  tileSize: 512,
  zoomOffset: -1
}).addTo(map);


// control that shows info on hover
var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function (props) {
  this._div.innerHTML = '<h4>COVID-19 Deaths by Country</h4>' +  (props ?
    '<b>' + props.ADMIN + '</b><br/>' + (typeof(props.deaths) == 'undefined' ? 0 : props.deaths) + ' people'
    : 'Hover over a country');
};

info.addTo(map);

function getColor(d) {
  return d > 50000 ? '#800026' :
    d > 20000  ? '#BD0026' :
    d > 10000  ? '#E31A1C' :
    d > 1000  ? '#FC4E2A' :
    d > 500   ? '#FD8D3C' :
    d > 100   ? '#FEB24C' :
    d > 10   ? '#FED976' :
    '#FFEDA0';
}

function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
    fillColor: getColor(feature.properties.deaths)
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
  geojson.resetStyle();
  info.update();
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: function(event) {
      resetHighlight(event);
      highlightFeature(event);
    },
  });
}

geojson = L.geoJson(totalDeathsByCountry, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);


var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 10, 100, 500, 1000, 10000, 20000, 50000],
    labels = [],
    from, to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' + getColor(from + 1) + '"></i> ' +
      from + (to ? '&ndash;' + to : '+'));
  }

  div.innerHTML = labels.join('<br>');
  return div;
};

legend.addTo(map);
