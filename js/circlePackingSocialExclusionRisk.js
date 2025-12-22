async function circlePackingSocialExclusionRisk() {
    try {
        const db = await loadSQLiteDatabase("ive_cat.sqlite");

        const rows = runQuery(db, `
            SELECT COUNT(*) as count, situacio_convivència, ingressos, financament_public
            FROM ive_cat
            GROUP BY situacio_convivència, ingressos, financament_public
        `);

        // Transformem les dades a jerarquia
        function buildHierarchy(data) {
            const root = {name: "Arrel", children: []};
            const situacions = d3.group(data, d => d.situacio_convivència);

            situacions.forEach((situData, situKey) => {
                const situNode = {name: situKey, children: []};
                const ingressosMap = d3.group(situData, d => d.ingressos);

                ingressosMap.forEach((ingData, ingKey) => {
                    const ingNode = {name: ingKey, children: []};

                    ingData.forEach(d => {
                        ingNode.children.push({name: d.financament_public, value: d.count});
                    });

                    situNode.children.push(ingNode);
                });

                root.children.push(situNode);
            });

            return root;
        }

        const rootData = buildHierarchy(rows);

        // D3 Circle Packing
        const width = 700;
        const height = 700;

        const root = d3.hierarchy(rootData)
            .sum(d => d.value ? d.value : 0)
            .sort((a, b) => b.value - a.value);

        const pack = d3.pack()
            .size([width, height])
            .padding(8); // més separació per evitar sobreposició

        pack(root);

        // Afegim SVG al body
        const svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const node = svg.selectAll("g")
            .data(root.descendants())
            .join("g")
            .attr("transform", d => `translate(${d.x},${d.y})`);

        node.append("circle")
            .attr("r", d => d.r)
            .attr("fill", d => {
                if (!d.children) {
                    return d.data.name === "Sí" ? "#1f77b4" : "#ff7f0e"; // fulles
                } else {
                    return "#ccc"; // nodes intermedis
                }
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);

        // Mostrem text només si el cercle és prou gran
        node.append("text")
            .filter(d => d.r > 20) 
            .text(d => d.children ? d.data.name : d.data.name)
            .style("font-size", d => Math.min(2*d.r/5, 12))
            .attr("dy", "0.3em")
            .attr("text-anchor", "middle");

        // Tooltip amb informació completa
        node.append("title")
            .text(d => d.children ? d.data.name : `${d.data.name}: ${d.value}`);

        // Mostrem l'SVG i ocultem el carregant
        $("#circlePackingSocialExclusionRisk").show();
        $("#circlePackingSocialExclusionRisk").closeset('div').find('.fa-spinner').hide();


    } catch (err) {
        console.error("Error:", err);
    }
}
