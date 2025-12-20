function treemapMethodTypeIVE() {

    fetch('static-data/IVE_methods_hierarchy.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {

            const hierarchyData = {
                name: "IVE Catalunya",
                children: Object.entries(data.Types).map(([type, arr]) => ({
                    name: type,
                    children: arr.map(d => ({ name: d.name, value: d.count }))
                }))
            };

            const width = 900;
            const legendHeight = 40;
            const height = 500;

            const svg = d3.select("#treemapMethodTypeIVE")
                .attr("width", width)
                .attr("height", height);

            
            svg.selectAll("*").remove();

            const legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(20,10)");

            const legendItem = legend.selectAll(".legend-item")
                .data(data.LegendData)
                .enter()
                .append("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(${i * 250}, 0)`);

            legendItem.append("rect")
                .attr("width", 14)
                .attr("height", 14)
                .attr("rx", 2)
                .attr("ry", 2)
                .attr("fill", d => d.color);

            legendItem.append("text")
                .attr("x", 22)
                .attr("y", 12)
                .text(d => d.label)
                .attr("font-size", "13px")
                .attr("fill", "#333");


            const root = d3.hierarchy(hierarchyData)
                .sum(d => d.value)
                .sort((a, b) => b.value - a.value);

            d3.treemap()
                .size([width, height - legendHeight])
                .padding(2)
                (root);


            const tooltip = d3.select("#treemapTooltip");

            const nodes = svg.selectAll("g")
                .data(root.leaves())
                .enter()
                .append("g")
                .attr("transform", d => `translate(${d.x0},${d.y0 + legendHeight})`);

            // RECTANGLES
            nodes.append("rect")
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", d => {
                    const parentName = d.parent.data.name;
                    if (parentName === "Mètodes quirúrgics") return "#5B8FF9";
                    if (parentName === "Mètodes farmacològics") return "#5AD8A6";
                    return "#F6BD16";
                })
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
                    tooltip
                        .style("left", (event.offsetX + 15) + "px")
                        .style("top", (event.offsetY + 15) + "px");
                })
                .on("mouseout", function () {
                    d3.select(this)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 1);

                    tooltip
                        .style("opacity", 0)
                        .style("display", "none");
                });

            // TEXT
            nodes.append("text")
                .attr("x", 5)
                .attr("y", 18)
                .text(d => d.data.name)
                .attr("font-size", "11px")
                .attr("fill", "#fff")
                .attr("pointer-events", "none");


            $("#treemapMethodTypeIVE").closest("div").find(".fa-spinner").remove();
            $("#treemapMethodTypeIVE").show();

        })
        .catch(error => console.error('Failed to fetch data:', error));
}
