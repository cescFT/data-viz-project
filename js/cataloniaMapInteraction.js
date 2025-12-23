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


async function executeFilters(map, filtersSelected) {
    try {

        let query = `SELECT COUNT(*) as total, nom_comarca_residencia
                    FROM ive_cat
                    WHERE `;

        let endQuery = `GROUP BY nom_comarca_residencia
            ORDER BY total`; 


        let conditions = [];
        for (const [filterName, selectedValues] of Object.entries(filtersSelected)) {
            let objectData = Object.values(selectedValues);
            if (objectData[0].length > 0) {
                let field = objectData[1];
                conditions.push(`${field} IN (${objectData[0].map(v => `'${v}'`).join(', ')})`);
            }
        }


        if (conditions.length > 0) {
            query += conditions.join(' AND ') + ' ' + endQuery;
        }

        console.log(query);

        fetch('../static-data/comarques_catalunya.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: styleComarcaTest('Alt Camp')
            }).addTo(map);
        })
        .catch(err => console.error('Error carregant GeoJSON comarques:', err));

    } catch (error) {
        console.error('Error executant els filtres:', error);
    }

}