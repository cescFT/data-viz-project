function treemapMethodTypeIVE() {
    fetch('static-data/IVE_methods_hierarchy.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();  
                })
                .then(data => {
                    hierarchyData = {
                        name: "IVE Catalunya",
                        children: Object.entries(data.Types).map(([type, arr]) => ({
                            name: type,
                            children: arr.map(d => ({ name: d.name, value: d.count }))
                        }))
                    }

                    width = 900
                    height = 500;

                    const svg = d3.select("#treemapMethodTypeIVE")
                    .attr("width", width)
                    .attr("height", height);

                    // Neteja contingut anterior
                    svg.selectAll("*").remove();

                    // Crear jerarquia
                    const root = d3.hierarchy(hierarchyData)
                        .sum(d => d.value)
                        .sort((a, b) => b.value - a.value);

                    // Treemap
                    d3.treemap()
                        .size([width, height])
                        .padding(2)
                        (root);

                    // Dibuixar rectangles
                    const nodes = svg.selectAll("g")
                        .data(root.leaves())
                        .enter()
                        .append("g")
                        .attr("transform", d => `translate(${d.x0},${d.y0})`);

                    nodes.append("rect")
                        .attr("width", d => d.x1 - d.x0)
                        .attr("height", d => d.y1 - d.y0)
                        .attr("fill", d => {
                            // Color segons tipus de mètode
                            const parentName = d.parent.data.name;
                            if (parentName === "Mètodes quirúrgics") return "#5B8FF9";
                            if (parentName === "Mètodes farmacològics") return "#5AD8A6";
                            return "#F6BD16"; // No especificat
                        })
                        .attr("stroke", "#fff");

                    // Afegir etiquetes
                    nodes.append("text")
                        .attr("x", 5)
                        .attr("y", 20)
                        .text(d => `${d.data.name} (${d.value})`)
                        .attr("font-size", "11px")
                        .attr("fill", "#fff")
                        .attr("pointer-events", "none"); // evitar conflictes amb hover

                })  
                .catch(error => console.error('Failed to fetch data:', error)); 
}