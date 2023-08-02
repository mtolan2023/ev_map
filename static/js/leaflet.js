// Zipcode Zoom on Map
// Define button and input field for zoom
var btn = document.getElementById("btn");
btn.addEventListener("click", function() {
    // Deliver Zip input
    var zipRead = parseInt(document.getElementById('zip').value);
    console.log("Zip Query", zipRead);
    


    // Search DB for zipcode match/Return coordinates and zoom to position
    d3.json('input/us_zip.json').then(function(zipData) {
        for (let i = 0; i < zipData.length; i++) {
            if (zipData[i].zip === zipRead) {
                myMap.flyTo([zipData[i].lat, zipData[i].lon], 13);
            }
        }
    });


});

// Building Choropleth Map

// Creating the map object
let myMap = L.map("map", {
    center: [37.8, -96],
    zoom: 4,

});
// Set base tile layer that will always be present so that toggling to "geojson" does not remove street map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);

// Second instance for baselayer toggle (not added at initiation)
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });


// define map
let geojson;

d3.json('input/us_state_geojson.json').then(function(data) {

// From Colorbrewer2- define color palette for choropleth
    function getColor(d) {
        return d > 100000 ? '#005a32' :
               d > 50000  ? '#238443' :
               d > 20000  ? '#41ab5d' :
               d > 10000  ? '#78c679' :
               d > 5000   ? '#addd8e' :
               d > 1000   ? '#d9f0a3' :
               d > 500    ? '#f7fcb9' :
                            '#ffffe5';
    }

// Set initial colors for choropleth
    function style(feature) {
        return {
            fillColor: getColor(feature.properties.EV_COUNT),
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: .7
        };
    }
// Function for highlight/info display update
    function highlightFeature(e) {
        var layer = e.target;
        info.update(layer.feature.properties);
    
        layer.setStyle({
            weight: 2,
            color: 'white',
            dashArray: '',
            fillOpacity: 0.5
        });
        // Extra code for browser support from leaflet documentation
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }
    // Function to reset highlight
    function resetHighlight(e) {
        info.update();
        geojson.resetStyle(e.target);
    }
    // Listener for highlighting/state data display
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight

        });
    }

    // Define info field to display pop/registrations data for each state
    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>EV Registration vs. Population per State (2022)</h4>' +  (props ?
            '<b>' + props.NAME + '</b><br />'+ 'EV Registrations: ' + props.EV_COUNT + '</b><br />'
            + 'Population: ' + props.POP + '</b><br />'+ 'EV registrations per capita: ' + (props.EV_COUNT/props.POP * 100).toFixed(4) + '%'
            :'Hover to view');
    };


    // Add info layer
    info.addTo(myMap);
    
    // Main geoJSON layer to plot coordinates for states
    geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(myMap);

    // Build the legend based on leaflet example
    var myLegend = L.control({position: 'bottomright'});

        myLegend.onAdd = function (map) {
        
            var div = L.DomUtil.create('div', 'info legend'),
                ev_count = [0, 500, 1000, 5000, 10000, 20000, 50000, 100000],
                labels = [];
            
            div.innerHTML = '<h4>EV Registrations</h4>'
                
        
            // loop through our registration scale and generate a label with a colored square for each interval
            for (var i = 0; i < ev_count.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(ev_count[i] + 1) + '"></i> ' +
                    ev_count[i] + (ev_count[i + 1] ? '&ndash;' + ev_count[i + 1] + '<br>' : '+');
            }
            return div;
        };
    // Add legend to map
    myLegend.addTo(myMap);
    
    // Bind legend and info to "Population/Registration" layer so that they are hidden when layer is changed
    myMap.on('baselayerchange', function (eventLayer) {
        // Switch to the Population legend...
        if (eventLayer.name === 'Population/Registration') {
            myLegend.addTo(myMap);
            info.addTo(myMap);
        
        } else { // Or switch to the Population Change legend...
            myMap.removeControl(myLegend);
            myMap.removeControl(info)
            
        }
    });

// Reset Zoom Feature
(function() {
	var control = new L.Control({position:'topleft'});
	control.onAdd = function(map) {
			var azoom = L.DomUtil.create('a','resetzoom');
			azoom.innerHTML = "<h6>(Reset Zoom)<h6>";
			L.DomEvent
				.disableClickPropagation(azoom)
				.addListener(azoom, 'click', function() {
					map.setView(map.options.center, map.options.zoom);
                    document.getElementById('zip').value=null;
				},azoom);
			return azoom;
            
		};
	return control;
}())
.addTo(myMap);
});

// Charging Station Marker Cluster Layer

d3.json('input/alt_fuel_stations.json').then(function(stationData) {
    // console.log("JSON output", stationData);

    // Add group for each charger type
    let teslaGroup = L.markerClusterGroup({showCoverageOnHover:false});
    let jGroup = L.markerClusterGroup({showCoverageOnHover:false});
    let chademoGroup = L.markerClusterGroup({showCoverageOnHover:false});
    let nemaGroup = L.markerClusterGroup({showCoverageOnHover:false});

    // Loop through the data.
    for (let i = 0; i < stationData.length; i++) {
  
      // Set the data location property to a variable.
      let location = stationData[i];
      let charge = location.ev_connector_array
  
      // Check for the location property.
      if (charge.includes("TESLA")) {
      
        // Add a new marker to the cluster group, and bind a popup.
        teslaGroup.addLayer(L.marker([location.latitude, location.longitude])
          .bindPopup('<strong>' + location.station_name + '</strong>' + '</b><br />'+ location.address + '</b><br />' + 
          location.city + ', ' + location.state + ' '+ location.zip + '</b><br />'+ 'Phone: ' + location.phone + 
          '</b><br />' + "Charger Type: " + charge));  
        }
        else if (charge.includes("J1772")) {
  
        // Add a new marker to the cluster group, and bind a popup.
        jGroup.addLayer(L.marker([location.latitude, location.longitude])
        .bindPopup('<strong>' + location.station_name + '</strong>' + '</b><br />'+ location.address + '</b><br />' + 
          location.city + ', ' + location.state + ' '+ location.zip + '</b><br />'+ 'Phone: ' + location.phone + 
          '</b><br />' + "Charger Type: " + charge));     
        }
        else if (charge.includes("CHADEMO")) {
      
        // Add a new marker to the cluster group, and bind a popup.
        chademoGroup.addLayer(L.marker([location.latitude, location.longitude])
        .bindPopup('<strong>' + location.station_name + '</strong>' + '</b><br />'+ location.address + '</b><br />' + 
          location.city + ', ' + location.state + ' '+ location.zip + '</b><br />'+ 'Phone: ' + location.phone + 
          '</b><br />' + "Charger Type: " + charge));   
        }

        else if (charge.includes("NEMA")) {
        
        // Add a new marker to the cluster group, and bind a popup.
        nemaGroup.addLayer(L.marker([location.latitude, location.longitude])
        .bindPopup('<strong>' + location.station_name + '</strong>' + '</b><br />'+ location.address + '</b><br />' + 
          location.city + ', ' + location.state + ' '+ location.zip + '</b><br />'+ 'Phone: ' + location.phone + 
          '</b><br />' + "Charger Type: " + charge));   
        };
    };

    // Set base layer group for map
    let baseLayers = {
        "Population/Registration": geojson,
        "Street View": street
    };

    // Set overlays (charger types)
    let overlays = {
        "J1772 Chargers": jGroup,
        "Tesla Chargers": teslaGroup,
        "Chademo Chargers": chademoGroup,
        "NEMA Chargers": nemaGroup
    };
    
    // Set up layer control
    L.control.layers(baseLayers,  overlays, {style: {fillOpacity: .7}, position: 'topleft', collapsed: false}).addTo(myMap)


});



