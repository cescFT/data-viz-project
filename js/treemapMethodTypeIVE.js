function treemapMethodTypeIVE(colorMap) {

    fetch('static-data/IVE_methods_hierarchy.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {

            const width = 900;
            const legendHeight = 40;
            const treemapHeight = 500;
            const height = legendHeight + treemapHeight;

            let activeTypes = new Set(); // buit → mostra tot

            const svg = d3.select("#treemapMethodTypeIVE")
                .attr("width", width)
                .attr("height", height);

            svg.selectAll("*").remove();

            const tooltip = d3.select("#treemapTooltipIVEMethodType");

            /* ---------------------------
               Llegenda interactiva
            --------------------------- */
            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(20,10)");

            const legendData = Object.entries(colorMap)
                .map(([label, color]) => ({ label, color }));

            const legendItem = legend.selectAll(".legend-item")
                .data(legendData)
                .enter()
                .append("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(${i * 260},0)`)
                .style("cursor", "pointer")
                .attr("opacity", 1)
                .on("click", function (event, d) {

                    if (activeTypes.has(d.label)) {
                        activeTypes.delete(d.label);
                    } else {
                        activeTypes.add(d.label);
                    }

                    if (activeTypes.size === 0) activeTypes = new Set();

                    legendItem.each(function(ld) {
                        const rect = d3.select(this).select("rect");
                        if (activeTypes.size === 0) {
                            d3.select(this).attr("opacity", 1);
                            rect.attr("stroke-width", 0);
                        } else {
                            d3.select(this).attr("opacity", activeTypes.has(ld.label) ? 1 : 0.3);
                            rect.attr("stroke-width", activeTypes.has(ld.label) ? 2 : 0);
                        }
                    });

                    updateTreemap();
                });

            legendItem.append("rect")
                .attr("width", 14)
                .attr("height", 14)
                .attr("rx", 2)
                .attr("ry", 2)
                .attr("fill", d => d.color)
                .attr("stroke", "#000")
                .attr("stroke-width", 0);

            legendItem.append("text")
                .attr("x", 22)
                .attr("y", 12)
                .text(d => d.label)
                .attr("font-size", "13px")
                .attr("fill", "#333");

            /* ---------------------------
               Grup del treemap
            --------------------------- */
            const treemapGroup = svg.append("g")
                .attr("class", "treemap-group")
                .attr("transform", `translate(0,${legendHeight})`);

            /* ---------------------------
               Funció de renderitzat
            --------------------------- */
            function updateTreemap() {

                treemapGroup.selectAll("*").remove();

                const filterSet = activeTypes.size === 0 ? new Set(Object.keys(colorMap)) : activeTypes;

                const filteredHierarchy = {
                    name: "IVE Catalunya",
                    children: Object.entries(data.Types)
                        .filter(([type]) => filterSet.has(type))
                        .map(([type, arr]) => ({
                            name: type,
                            children: arr.map(d => ({
                                name: d.name,
                                value: d.count
                            }))
                        }))
                };

                if (filteredHierarchy.children.length === 0) return;

                const root = d3.hierarchy(filteredHierarchy)
                    .sum(d => d.value)
                    .sort((a, b) => b.value - a.value);

                d3.treemap()
                    .size([width, treemapHeight])
                    .padding(2)
                    (root);

                const nodes = treemapGroup.selectAll("g")
                    .data(root.leaves(), d => d.data.name)
                    .enter()
                    .append("g")
                    .attr("transform", d => `translate(${d.x0},${d.y0})`);

                nodes.append("rect")
                    .attr("width", d => d.x1 - d.x0)
                    .attr("height", d => d.y1 - d.y0)
                    .attr("fill", d => colorMap[d.parent.data.name])
                    .attr("stroke", "#fff")
                    .on("mouseover", function (event, d) {
                        d3.select(this)
                            .attr("stroke", "#000")
                            .attr("stroke-width", 2);

                        tooltip
                            .style("display", "block")
                            .style("opacity", 1)
                            .html(`
                                <strong>${d.data.name}</strong><br/>
                                Tipus: ${d.parent.data.name}<br/>
                                Casos: ${d.value.toLocaleString()}
                            `);
                    })
                    .on("mousemove", function (event) {
                        // Tooltip intel·ligent dins del div parent
                        const parent = d3.select(this.closest("svg")).node().parentNode;
                        const rect = parent.getBoundingClientRect();

                        let x = event.clientX - rect.left + 10;
                        let y = event.clientY - rect.top + 10;

                        // Limitar perquè no surti fora del div
                        const tooltipNode = tooltip.node();
                        const tooltipWidth = tooltipNode.offsetWidth;
                        const tooltipHeight = tooltipNode.offsetHeight;

                        if (x + tooltipWidth > rect.width) x = rect.width - tooltipWidth - 5;
                        if (y + tooltipHeight > rect.height) y = rect.height - tooltipHeight - 5;

                        tooltip
                            .style("left", x + "px")
                            .style("top", y + "px");
                    })
                    .on("mouseout", function () {
                        d3.select(this)
                            .attr("stroke", "#fff")
                            .attr("stroke-width", 1);

                        tooltip
                            .style("opacity", 0)
                            .style("display", "none");
                    });

                nodes.append("text")
                    .attr("x", 5)
                    .attr("y", 16)
                    .text(d => d.data.name)
                    .attr("font-size", "11px")
                    .attr("fill", "#fff")
                    .attr("pointer-events", "none");
            }

            updateTreemap();

            $("#treemapMethodTypeIVE").closest("div").find(".fa-spinner").remove();
            $("#treemapMethodTypeIVE").show();
        })
        .catch(error => console.error(error));
}
