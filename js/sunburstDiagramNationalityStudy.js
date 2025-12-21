async function sunburstDiagramNationalityStudy() {
    try {
        const db = await loadSQLiteDatabase("ive_cat.sqlite");

        const totals = runQuery(db, `
            SELECT count(*) as total, primera_nacionalitat
            FROM ive_cat
            GROUP BY primera_nacionalitat;
        `);

        const unemployed = runQuery(db, `
            SELECT count(*) as total, primera_nacionalitat
            FROM ive_cat
            WHERE situacio_laboral = 'Aturada o a la recerca de la primera feina remunerada'
              AND ingressos = 'No'
            GROUP BY primera_nacionalitat;
        `);

        const employed = runQuery(db, `
            SELECT count(*) as total, primera_nacionalitat
            FROM ive_cat
            WHERE situacio_laboral = 'Treballadora'
              AND ingressos = 'Sí'
            GROUP BY primera_nacionalitat;
        `);

        /* ---------------------------
           Mapes auxiliars
        --------------------------- */
        const totalMap = {};
        totals.forEach(d => totalMap[d.primera_nacionalitat] = d.total);

        const unemployedMap = {};
        unemployed.forEach(d => unemployedMap[d.primera_nacionalitat] = d.total);

        const employedMap = {};
        employed.forEach(d => employedMap[d.primera_nacionalitat] = d.total);

        /* ---------------------------
           Jerarquia
        --------------------------- */
        const hierarchyData = {
            name: "IVE Catalunya",
            children: totals.map(d => {
                const total = d.total;
                const u = unemployedMap[d.primera_nacionalitat] || 0;
                const e = employedMap[d.primera_nacionalitat] || 0;

                return {
                    name: d.primera_nacionalitat,
                    total: total,
                    children: [
                        {
                            name: "Aturada / Sense ingressos",
                            value: u,
                            percent: (u / total) * 100
                        },
                        {
                            name: "Treballadora / Amb ingressos",
                            value: e,
                            percent: (e / total) * 100
                        }
                    ]
                };
            })
        };

        /* ---------------------------
           Dimensions
        --------------------------- */
        const width = 650;
        const radius = width / 2;

        const colorScale = {
            "Espanyola": ["#5B8FF9", "#8CB3FF"],
            "No espanyola": ["#F6BD16", "#FFD666"]
        };

        const svg = d3.select("#sunburstNationalityStudy");
        svg.selectAll("*").remove();

        const g = svg
            .attr("width", width)
            .attr("height", width)
            .append("g")
            .attr("transform", `translate(${radius},${radius})`);

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
            .data(root.descendants().filter(d => d.depth))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => {
                const nat = d.ancestors().find(a => a.depth === 1).data.name;
                return d.depth === 1
                    ? colorScale[nat][0]
                    : colorScale[nat][1];
            })
            .attr("stroke", "#fff");

        /* ---------------------------
           Etiquetes
        --------------------------- */
        g.selectAll("text")
            .data(root.descendants().filter(d => d.depth === 2))
            .enter()
            .append("text")
            .attr("transform", d => {
                const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                const y = (d.y0 + d.y1) / 2;
                return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
            })
            .attr("dx", "-15")
            .attr("dy", ".35em")
            .attr("font-size", "11px")
            .attr("text-anchor", "middle")
            .text(d => `${d.data.percent.toFixed(1)}%`);

        /* ---------------------------
           Llegenda
        --------------------------- */
        const legend = svg.append("g")
            .attr("transform", "translate(10,10)");

        const legendData = [
            { label: "Espanyola", color: "#5B8FF9" },
            { label: "No espanyola", color: "#F6BD16" },
            { label: "Aturada / Sense ingressos", color: "#DDD" },
            { label: "Treballadora / Amb ingressos", color: "#AAA" }
        ];

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


    $("#sunburstNationalityStudy").show();
    $("#sunburstNationalityStudy").closest('div').find('.fa-spinner').hide();
    } catch (err) {
        console.error(err);
    }
}
