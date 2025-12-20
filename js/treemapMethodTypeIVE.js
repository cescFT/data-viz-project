function treemapMethodTypeIVE() {

    fetch('static-data/IVE_methods_hierarchy.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {

            // ---------------------------
            // 1. Jerarquia
            // ---------------------------
            const hierarchyData = {
                name: "IVE Catalunya",
                children: Object.entries(data.Types).map(([type, arr]) => ({
                    name: type,
                    children: arr.map(d => ({ name: d.name, value: d.count }))
                }))
            };

            // ---------------------------
            // 2. Dimensions
            // ---------------------------
            const width = 900;
            const legendHeight = 40;
            const treemapHeight = 500;
            const height = legendHeight + treemapHeight;

            const svg = d3.select("#treemapMethodTypeIVE")
                          .attr("width", width)
                          .attr("height", height);

            svg.selectAll("*").remove();

            // ---------------------------
            // 3. Llegenda
            // ---------------------------
            const colorMap = {
                "Mètodes quirúrgics": "#5B8FF9",
                "Mètodes farmacològics": "#5AD8A6",
                "No especificat": "#F6BD16"
            };

            const legendData = Object.entries(colorMap).map(([label, color]) => ({ label, color }));

            const legend = svg.append("g")
                              .attr("class", "legend")
                              .attr("transform", "translate(20,10)");

            const legendItem = legend.selectAll(".legend-item")
                .data(legendData)
                .enter()
                .append("g")
                .attr("class", "legend-item")
                .attr("transform", (d, i) => `translate(${i * 260}, 0)`);

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

            // ---------------------------
            // 4. Jerarquia + Treemap
            // ---------------------------
            const root = d3.hierarchy(hierarchyData)
                           .sum(d => d.value)
                           .sort((a, b) => b.value - a.value);

            d3.treemap()
                .size([width, treemapHeight])
                .padding(2)
                (root);

            const treemapGroup = svg.append("g").attr("class", "treemap-group");
            const tooltip = d3.select("#treemapTooltip");
            const container = d3.select("#treemapMethodTypeIVE").node().parentNode;
            const containerRect = container.getBoundingClientRect();

            const nodes = treemapGroup.selectAll("g")
                .data(root.leaves())
                .enter()
                .append("g")
                .attr("transform", d => `translate(${d.x0},${d.y0 + legendHeight})`);

            // ---------------------------
            // 5. Rectangles
            // ---------------------------
            nodes.append("rect")
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", d => colorMap[d.parent.data.name] || "#ccc")
                .attr("stroke", "#fff")
                .on("mouseover", function(event, d) {
                    d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);
                    tooltip.style("display", "block")
                           .style("opacity", 1)
                           .html(`<strong>${d.data.name}</strong><br/>Tipus: ${d.parent.data.name}<br/>Casos: ${d.value.toLocaleString()}`);
                })
                .on("mousemove", function(event) {
                    tooltip.style("left", (event.clientX - containerRect.left + 10) + "px")
                           .style("top", (event.clientY - containerRect.top + 10) + "px");
                })
                .on("mouseout", function() {
                    d3.select(this).attr("stroke", "#fff").attr("stroke-width", 1);
                    tooltip.style("display", "none").style("opacity", 0);
                });

            // ---------------------------
            // 6. Text
            // ---------------------------
            nodes.append("text")
                .attr("x", 5)
                .attr("y", 16)
                .text(d => d.data.name)
                .attr("font-size", "11px")
                .attr("fill", "#fff")
                .attr("pointer-events", "none");

            // ---------------------------
            // 7. Finalització
            // ---------------------------
            $("#treemapMethodTypeIVE").closest("div").find(".fa-spinner").remove();
            $("#treemapMethodTypeIVE").show();

        })
        .catch(error => console.error('Failed to fetch data:', error));
}
