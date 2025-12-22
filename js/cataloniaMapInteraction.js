function loadCataloniaMapInteraction(map) {

    // Estil general de les comarques
    function styleComarques(feature) {
        return {
            fillColor: '#cccccc',
            weight: 1,
            color: '#555',
            fillOpacity: 0.5
        };
    }


    // Carregar el GeoJSON de comarques
    fetch('../static-data/comarques_catalunya.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: styleComarques
            }).addTo(map);
        })
        .catch(err => console.error('Error carregant GeoJSON comarques:', err));
}

function styleComarcaTest(nomComarca) {
    return function (feature) {
        return {
            fillColor: feature.properties.nom_comar === nomComarca
                ? '#ff0000'
                : '#cccccc',
            weight: 1,
            color: '#555',
            fillOpacity: 0.6
        };
    };
}


function executeFilters(map) {
    fetch('../static-data/comarques_catalunya.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: styleComarcaTest('Alt Camp')
            }).addTo(map);
        })
        .catch(err => console.error('Error carregant GeoJSON comarques:', err));
}