async function sunburstDiagramNationalityStudy() {
    try {
        const db = await loadSQLiteDatabase("ive_cat.sqlite");

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

        const detailedMap = {};
        detailed.forEach(d => {
            if (!detailedMap[d.primera_nacionalitat]) detailedMap[d.primera_nacionalitat] = [];
            detailedMap[d.primera_nacionalitat].push({
                name: d.situacio_laboral,
                value: d.total
            });
        });

        const hierarchyData = {
            name: "IVE Catalunya",
            children: totals.map(d => ({
                name: d.primera_nacionalitat,
                total: d.total,
                children: detailedMap[d.primera_nacionalitat] || []
            }))
        };

        const width = 650;
        const radius = width / 2;

        const colorScale = {
            "Espanyola": { base: "#5B8FF9", light: "#8CB3FF" },
            "No Espanyola": { base: "#F6BD16", light: "#FFD666" }
        };

        let activeNationalities = new Set(); // buit → mostrar tot

        const svg = d3.select("#sunburstNationalityStudy");
        svg.selectAll("*").remove();

        const g = svg
            .attr("width", width)
            .attr("height", width + 120)
            .append("g")
            .attr("transform", `translate(${radius},${radius + 40})`);

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

        const paths = g.selectAll("path")
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

        function updateVisibility() {
            const filterSet = activeNationalities.size === 0
                ? new Set(Object.keys(colorScale))
                : activeNationalities;

            paths.transition()
                .duration(200)
                .attr("opacity", d => {
                    const natNode = d.depth === 1
                        ? d
                        : d.ancestors().find(a => a.depth === 1);
                    return filterSet.has(natNode.data.name) ? 1 : 0.2;
                });

            // Llegenda: opacitat i border
            legendItems.each(function(ld) {
                const rect = d3.select(this).select("rect");
                if (activeNationalities.size === 0) {
                    d3.select(this).attr("opacity", 1);
                    rect.attr("stroke-width", 0);
                } else {
                    d3.select(this).attr("opacity", activeNationalities.has(ld.label) ? 1 : 0.3);
                    rect.attr("stroke-width", activeNationalities.has(ld.label) ? 2 : 0);
                    rect.attr("stroke", "#000");
                }
            });
        }

        // Text interior
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
            .text(d => `${d.data.name} (${((d.value / root.value) * 100).toFixed(1)}%)`);

        // Text exterior
        g.selectAll("text.outer")
            .data(root.descendants().filter(d => d.depth === 2))
            .enter()
            .append("text")
            .attr("class", "outer")
            .attr("transform", d => {
                const angle = (d.x0 + d.x1) / 2 * 180 / Math.PI;
                const r = (d.y0 + d.y1) / 2;
                return `rotate(${angle - 90}) translate(${r},0) rotate(${angle < 180 ? 0 : 180})`;
            })
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("font-size", "11px")
            .attr("fill", "#000")
            .text(d => {
                const parentValue = d.parent.value;
                const percent = ((d.value / parentValue) * 100).toFixed(1);
                let name = d.data.name;
                if (name === "Aturada o a la recerca de la primera feina remunerada") name = "Aturada";
                return `${name} (${percent}%)`;
            });

        // Llegenda
        const legendData = [
            { label: "Espanyola", color: colorScale["Espanyola"].base },
            { label: "No Espanyola", color: colorScale["No Espanyola"].base }
        ];

        const legend = svg.append("g")
            .attr("transform", "translate(20,20)");

        const legendItems = legend.selectAll("g")
            .data(legendData)
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`)
            .style("cursor", "pointer")
            .attr("opacity", 1)
            .on("click", function (event, d) {
                if (activeNationalities.has(d.label)) activeNationalities.delete(d.label);
                else activeNationalities.add(d.label);

                updateVisibility();
            });

        legendItems.append("rect")
            .attr("width", 14)
            .attr("height", 14)
            .attr("fill", d => d.color)
            .attr("stroke", "#000")
            .attr("stroke-width", 0);

        legendItems.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(d => d.label)
            .attr("font-size", "12px");

        updateVisibility();

        $("#sunburstNationalityStudy").show();
        $("#sunburstNationalityStudy").closest("div").find(".fa-spinner").hide();

    } catch (err) {
        console.error(err);
    }
}
