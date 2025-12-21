async function sunburstDiagramNationalityStudy() {
    try {
        const db = await loadSQLiteDatabase("ive_cat.sqlite");

        /* ---------------------------
           Consultes
        --------------------------- */
        const totals = runQuery(db, `
            SELECT count(*) as total, primera_nacionalitat
            FROM ive_cat
            GROUP BY primera_nacionalitat;
        `);

        const detailed = runQuery(db, `
            SELECT count(*) as total, primera_nacionalitat, situacio_laboral
            FROM ive_cat
            GROUP BY primera_nacionalitat, situacio_laboral;
        `);

        /* ---------------------------
           Mapes per jerarquia
        --------------------------- */
        const detailedMap = {};
        detailed.forEach(d => {
            if (!detailedMap[d.primera_nacionalitat]) detailedMap[d.primera_nacionalitat] = [];
            detailedMap[d.primera_nacionalitat].push({
                name: d.situacio_laboral,
                value: d.total
            });
        });

        /* ---------------------------
           Jerarquia
        --------------------------- */
        const hierarchyData = {
            name: "IVE Catalunya",
            children: totals.map(d => ({
                name: d.primera_nacionalitat,
                total: d.total,
                children: detailedMap[d.primera_nacionalitat] || []
            }))
        };

        /* ---------------------------
           Dimensions i colors
        --------------------------- */
        const width = 650;
        const radius = width / 2;

        const colorScale = {
            "Espanyola": { base: "#5B8FF9", light: "#8CB3FF" },
            "No Espanyola": { base: "#F6BD16", light: "#FFD666" }
        };

        const svg = d3.select("#sunburstNationalityStudy");
        svg.selectAll("*").remove();

        const g = svg
            .attr("width", width)
            .attr("height", width + 120)
            .append("g")
            .attr("transform", `translate(${radius},${radius + 40})`);

        /* ---------------------------
           Layout
        --------------------------- */
        const root = d3.hierarchy(hierarchyData)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        d3.partition()
            .size([2 * Math.PI, radius])
            (root);

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);

        /* ---------------------------
           Arcs
        --------------------------- */
        g.selectAll("path")
            .data(root.descendants().filter(d => d.depth > 0))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => {
                if (d.depth === 1) return colorScale[d.data.name].base;
                if (d.depth === 2) {
                    const natNode = d.ancestors().find(a => a.depth === 1);
                    return colorScale[natNode.data.name].light;
                }
                return "#ccc";
            })
            .attr("stroke", "#fff");

        /* ---------------------------
           Text interior (nacionalitat + percentatge)
        --------------------------- */
        g.selectAll("text.inner")
            .data(root.descendants().filter(d => d.depth === 1))
            .enter()
            .append("text")
            .attr("class", "inner")
            .attr("transform", d => {
                const angle = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                const r = (d.y0 + d.y1) / 2;
                return `rotate(${angle - 90}) translate(${r},0) rotate(${angle < 180 ? 0 : 180})`;
            })
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "12px")
            .attr("fill", "#000")
            .text(d => {
                const percent = ((d.value / root.value) * 100).toFixed(1);
                return `${d.data.name} (${percent}%)`;
            });

        /* ---------------------------
           Llegenda
        --------------------------- */
        const legendData = [
            { label: "Espanyola", color: colorScale["Espanyola"].base },
            { label: "No Espanyola", color: colorScale["No Espanyola"].base }
        ];

        const legend = svg.append("g")
            .attr("transform", "translate(20,20)");

        legend.selectAll("g")
            .data(legendData)
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`)
            .each(function (d) {
                d3.select(this)
                    .append("rect")
                    .attr("width", 14)
                    .attr("height", 14)
                    .attr("fill", d.color);

                d3.select(this)
                    .append("text")
                    .attr("x", 20)
                    .attr("y", 12)
                    .text(d.label)
                    .attr("font-size", "12px");
            });

        /* ---------------------------
           Mostrar
        --------------------------- */
        $("#sunburstNationalityStudy").show();
        $("#sunburstNationalityStudy").closest("div").find(".fa-spinner").hide();

    } catch (err) {
        console.error(err);
    }
}
