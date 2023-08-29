// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place,time, magnitude, and depth of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
  
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: myCircleMarker 
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [37.09, -95.71],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let colors = ["#0feb2d", "#eef131", "#f7ca04", "#f78d04", "#f75104", "#d10000" ];
        let limits = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"];
        let labels = [];
    
        let legendInfo = "<h1>Depth<br />color<br />scale</h1>";
        div.innerHTML = legendInfo;
    
        // Create labels for each range
        limits.forEach(function(limit, index) {
            labels.push(                
                '<li>' +
                '<span style="background-color: ' + colors[index] + ';" class="color-box"></span>' +
                '<span class="range-label">' + limit + '</span>' +
                '</li>'
            );
        });
    
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
}

// Implement setFillColor based on the depth of the earth quake
function setFillColor(depth){
    let color = " ";
    if(depth >= -10 && depth < 10)
        color = "#0feb2d";
    else if(depth >= 10 && depth < 30)
        color = "#eef131";
    else if(depth >= 30 && depth < 50)
        color = "#f7ca04";
    else if(depth >= 50 && depth < 70)
        color = "#f78d04";
    else if (depth >= 70 && depth < 90)
        color = "#f75104";
    else
        color = "#d10000";
    return color;
}

// Implement custom circle marker function to set circle radius by magnitude
function myCircleMarker(feature){
    let attributes = {
        radius: feature.properties.mag*5,
        color: "purple",
        weight: 0.7,
        fillColor: setFillColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.7
    }
    let location = L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
    return L.circleMarker(location, attributes);
}