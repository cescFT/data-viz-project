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

async function executeFilters(map, filtersSelected) {
    try {
        $("#loadingResults").show();
        $("#catMap").hide();
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

        const db = await loadSQLiteDatabase("../ive_cat.sqlite");

        const rows = runQuery(db, query);

        if (!rows || rows.length === 0) {
            alert('No s\'han trobat dades per als filtres seleccionats.');
            $("#loadingResults").hide();
            $("#catMap").show();
            return;
        }

        let lastElementTotal = rows[rows.length - 1].total;

        let comarcaTotals = [];
        rows.forEach(row => {
            comarcaTotals[row.nom_comarca_residencia] = row.total;
        });

        let mode = "intervals";
        if (lastElementTotal <= 10) mode =  "discrete";

        function getDiscreteColor(v) {
            if (!v || v === 0) return "#e0e0e0";
            if (v === 1) return "#cfe8ff";
            if (v === 2) return "#9ecae1";
            return "#2171b5";
        }

        function getIntervalColor(v, min, max) {
            if (!v || v === 0) return "#e0e0e0";

            const t = (v - min) / (max - min);
            const r = Math.round(224 - t * 190);
            const g = Math.round(224 - t * 160);
            const b = Math.round(224 + t * 10);

            return `rgb(${r},${g},${b})`;
        }


        // ---------- 6. NETEJAR MAPA ----------
        map.eachLayer(layer => {
            if (layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
        });



        const geojson = await fetch('../static-data/comarques_catalunya.geojson').then(r => r.json());

        const geoLayer = L.geoJSON(geojson, {
            style: feature => {
                const comarca = feature.properties.nom_comar;
                const value = comarcaTotals[comarca] || 0;

                return {
                    fillColor: mode === "discrete"
                        ? getDiscreteColor(value)
                        : getIntervalColor(value, min, max),
                    weight: 1,
                    color: "#555",
                    fillOpacity: 0.7
                };
            },
            onEachFeature: (feature, layer) => {
                const comarca = feature.properties.nom_comar;
                const value = comarcaTotals[comarca] || 0;

                layer.bindTooltip(
                    `<strong>${comarca}</strong><br>Total: ${value}`,
                    { sticky: true }
                );
            }
        }).addTo(map);

        const legend = L.control({ position: "bottomright" });

        legend.onAdd = function () {
            const div = L.DomUtil.create("div", "info legend");
            div.style.background = "white";
            div.style.padding = "8px";
            div.style.borderRadius = "4px";
            div.style.fontSize = "12px";

            if (mode === "discrete") {
                div.innerHTML += `
                    <div><i style="background:#e0e0e0"></i> 0</div>
                    <div><i style="background:#cfe8ff"></i> 1</div>
                    <div><i style="background:#9ecae1"></i> 2</div>
                    <div><i style="background:#2171b5"></i> ≥3</div>
                `;
            } else {
                const steps = 5;
                const stepSize = Math.ceil((max - min) / steps);

                for (let i = 0; i < steps; i++) {
                    const from = min + i * stepSize;
                    const to = Math.min(from + stepSize - 1, max);

                    div.innerHTML += `
                        <div>
                            <i style="background:${getIntervalColor(from, min, max)}"></i>
                            ${from}–${to}
                        </div>
                    `;
                }
            }

            return div;
        };

        legend.addTo(map);

        $("#loadingResults").hide();
        $("#catMap").show();
    } catch (error) {
        console.error('Error executant els filtres:', error);
    }

}