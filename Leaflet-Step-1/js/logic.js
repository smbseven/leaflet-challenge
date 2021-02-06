// Create q_url variable to start data query to USGS URL
// Picked "significant" eartquake data, although it works with anything
const q_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";

// GET request to the query URL
d3.json(q_url).then(data => {
  console.log(data);
  map_features(data.features);
});
// Feature function - from data create features on map and pop-up
function map_features(earthquakeData) {

    function onEachFeature(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag +
        "<div>"+"Depth: " + feature.geometry.coordinates[2] + " km"+ "</div>" +
        "<div>"+"Location: " + feature.properties.place + "</div>" +

        "<hr><p>" + "Time: "+ new Date(feature.properties.time) + "</p>");
    };
    
    // Create GeoJson layer that contains feature array
    let map_props = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: (feature, latlng) => {
      return new L.Circle(latlng, {
        radius: Math.pow(2,feature.properties.mag/1.1)*10000,
        fillOpacity: 100,
        fillColor: d_color(feature.geometry.coordinates[2]),
        stroke: true,
        color: "black",
        weight: 1 
      });
    }
   });

   // Send earthquakes layer (map_props) to the create_map function
   create_map(map_props);
}  

function create_map(map_props) {
  
  // Define map layers
  let usgs_map = L.map("map", {
    center: [
      0, 0],
    zoom: 3,
    layers: [map_props]
   });

   // Add light-v10 for visualization
   L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
   }).addTo(usgs_map);

   // Add legend
    let legend = L.control({ position: "bottomright" });
        
    legend.onAdd = function (usgs_map) {
        var div = L.DomUtil.create("div", "info legend");
        depths = [0,10,30,50,70,90]
  
    let legend_info = `<h3>Earthquake <br> Depth (km) </h3>`;
    div.innerHTML = legend_info;

      for (var i = 0; i < depths.length; i++) {
        div.innerHTML += 
        '<i style="background:' + d_color(depths[i]) + '"></i> ' + 
        depths[i] + (depths[i + 1] ? '&ndash;' + ((depths[i + 1]) -1) + '<br>' : '+');
      }
      return div;
    };
  
    // Add the legend to the map
    legend.addTo(usgs_map);

}; 
// depth color function (d_color)is used to represent the colors in the legend.
function d_color(d) {
  return d >= 90   ? '#ff4000' :
         d >= 70   ? '#ff8000' :
         d >= 50   ? '#ffbf00' :
         d >= 30   ? '#ffff00' :
         d >= 10   ? '#bfff00' :
         d >= 0    ? '#80ff00' :
                    '#00ff00';
};