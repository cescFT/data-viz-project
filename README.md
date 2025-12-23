# data-viz-project: Estudi de les interrupcions voluntàries d'embaràs a Catalunya
Projecte visualització de dades per a l'assignatura Visualització de Dades del Màster Universitari de Ciències de Dades (UOC)

## Dades

Les dades de les visualitzacions s'obtenen a través de consultes a la base de dades *ive_cat.sqlite*, que conté la informació disponible en el CSV original, que es pot descarregar prement a l'enllaç https://analisi.transparenciacatalunya.cat/Salut/Interrupcions-volunt-ries-d-embar-s-IVE-a-Cataluny/5qx5-hkkr/about_data.

A part, he creat alguna columna extra en l'única taula disponible en la base de dades, que és una agrupació dels tipus de mètodes utilitzats.

## Carpetes del repositori

* img: Carpeta on hi ha totes les imatges que hi ha disponibles en la pàgina web.
* js: Carpeta on hi ha tots els fitxers javascript responsables de la creació / interacció del mapa i les visualitzacions
* pages: Carpeta on hi ha la pàgina extra on hi ha el mapa interactiu
* static-data: Carpeta on hi ha informació estàtica necessària per a la realització del projecte

## Tecnologia usada

* HTML
* Per a poder tenir un control de versions del projecte i poder fer *rollbacks* he usat git.
* Per a fer les visualitzacions he usat la llibreria D3.js.
* Per a fer el mapa he usat la llibreria Leaflet.js.
* Per a poder fer la connectivitat amb la base de dades, he usat la llibreria sql.js.
* Per a donar interactivitat amb la pàgina, he usat la llibreria jquery.js.
* Per a donar-li estil he usat bootstrap5.
* Per a posar icones he usat la llibreria font-awesome.
* Per a poder fer el mapa he necessitat les comarques de catalunya en format geojson, disponibles aqui: https://github.com/aariste/GeoJSON-Mapas

