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

        let query = `SELECT COUNT(*) as total, nom_comarca_residencia FROM ive_cat WHERE `;
        let endQuery = ` GROUP BY nom_comarca_residencia ORDER BY total`;
        
        let conditions = [];
        for (const [filterName, selectedValues] of Object.entries(filtersSelected)) {
            let objectData = Object.values(selectedValues);
            if (objectData[0].length > 0) {
                let field = objectData[1];
                conditions.push(`${field} IN (${objectData[0].map(v => `'${v}'`).join(', ')})`); } 
        }
                
        if (conditions.length > 0) {
            query += conditions.join(' AND ') + ' ' + endQuery;
        }

        const db = await loadSQLiteDatabase("../ive_cat.sqlite");
        const rows = runQuery(db, query);

        if (!rows || rows.length === 0) {
            alert("No s'han trobat dades");
            $("#loadingResults").hide();
            $("#catMap").show();
            return;
        }

        const comarcaTotals = {};
        rows.forEach(r => {
            comarcaTotals[r.nom_comarca_residencia] = r.total;
        });

        const totals = rows.map(r => r.total);
        const min = Math.min(...totals);
        const max = Math.max(...totals);

        const mode = max <= 10 ? "discrete" : "intervals";

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

        // Netejar capes anteriors
        map.eachLayer(layer => {
            if (layer instanceof L.GeoJSON) {
                map.removeLayer(layer);
            }
        });

        const geojson = await fetch("../static-data/comarques_catalunya.geojson").then(r => r.json());

        L.geoJSON(geojson, {
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

        // ---------- LLEGENDA MIN–MAX ----------

        if (legendControl) {
            map.removeControl(legendControl);
        }

        const legend = L.control({ position: "bottomright" });

        legend.onAdd = function () {
            const div = L.DomUtil.create("div", "info legend");
            div.style.background = "white";
            div.style.padding = "10px";
            div.style.borderRadius = "6px";
            div.style.fontSize = "12px";
            div.style.minWidth = "140px";

            if (mode === "discrete") {
                div.innerHTML = `
                    <strong>Casos</strong><br>
                    <div><span style="background:#e0e0e0"></span> 0</div>
                    <div><span style="background:#cfe8ff"></span> 1</div>
                    <div><span style="background:#9ecae1"></span> 2</div>
                    <div><span style="background:#2171b5"></span> ≥3</div>
                `;
            } else {
                const minColor = getIntervalColor(min, min, max);
                const maxColor = getIntervalColor(max, min, max);

                div.innerHTML = `
                    <strong>Casos</strong><br>
                    <div style="
                        height: 12px;
                        margin: 6px 0;
                        background: linear-gradient(to right, ${minColor}, ${maxColor});
                    "></div>
                    <div style="display:flex; justify-content:space-between">
                        <span>${min}</span>
                        <span>${max}</span>
                    </div>
                `;
            }

            return div;
        };

        legend.addTo(map);
        legendControl = legend;

        $("#loadingResults").hide();
        $("#catMap").show();

    } catch (error) {
        console.error("Error executant els filtres:", error);
    }
}
