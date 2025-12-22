function cataloniaMapInteraction() {
    const admin = L.tileLayer('https://geoserveis.icgc.cat/servei/catalunya/mapa-base/wmts/administratiu/MON3857NW/{z}/{x}/{y}.png', {
        maxZoom: 20
    });

    // Creem el mapa amb la capa Administratiu activada per defecte
    const map = L.map('catMap', {
        attributionControl: false,
        minZoom: 6,
        center: [41.8, 1.7],
        zoom: 8,
        layers: [admin]
    });

    // Si vols mantenir el control de capes però només amb Administratiu
    const baseLayers = {
        'Administratiu': admin
    };

    L.control.layers(baseLayers, null, { collapsed: false }).addTo(map);       
}