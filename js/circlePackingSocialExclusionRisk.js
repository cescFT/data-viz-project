async function circlePackingSocialExclusionRisk() {
    try {
        const db = await loadSQLiteDatabase("ive_cat.sqlite");

        const rows = runQuery(db, `
            SELECT COUNT(*) as count, situacio_convivència, ingressos, financament_public
            FROM ive_cat
            GROUP BY situacio_convivència, ingressos, financament_public
        `);

        function buildHierarchy(data) {
            const root = { name: "Situació de convivència", children: [] };
            const situacions = d3.group(data, d => d.situacio_convivència);

            situacions.forEach((situData, situKey) => {
                const situNode = { name: situKey, children: [] };
                const ingressosMap = d3.group(situData, d => d.ingressos);

                ingressosMap.forEach((ingData, ingKey) => {
                    const ingNode = { name: ingKey, children: [] };

                    ingData.forEach(d => {
                        ingNode.children.push({ name: d.financament_public, value: d.count });
                    });

                    situNode.children.push(ingNode);
                });

                root.children.push(situNode);
            });

            return root;
        }

        const rootData = buildHierarchy(rows);

        const width = 900;
        const height = 900;

        const root = d3.hierarchy(rootData)
            .sum(d => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        const pack = d3.pack()
            .size([width, height])
            .padding(5);

        pack(root);

        const svgContainer = d3.select("#circlePackingSocialExclusionRisk");
        svgContainer.selectAll("*").remove();
        const svg = svgContainer
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("font", "10px sans-serif");

        const g = svg.append("g");

        // Colors per nivell
        const colorMap = {
            0: "#e0e0e0", // arrel/fons gris
            1: "#a6cee3",  // situacio_convivència
            2: "#b2df8a",  // ingressos
            3: "#ff7f0e"   // finançament_public: un sol color per totes les fulles
        };

        const nodes = g.selectAll("circle")
            .data(root.descendants())
            .join("circle")
            .attr("fill", d => {
                if (d.depth === 0) return colorMap[0];       // arrel/fons gris
                if (d.children) return colorMap[d.depth];   // nodes jeràrquics
                return colorMap[3];                          // fulles: color únic
            })
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .attr("cursor", "pointer")
            .on("click", (event, d) => zoom(d));

        // Labels amb visibilitat segons radi
        const labels = g.selectAll("text")
            .data(root.descendants())
            .join("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .style("pointer-events", "none")
            .style("font-size", d => Math.min(2 * d.r / 5, 12))
            .text(d => d.data.name)
            .style("opacity", d => d.r > 20 ? 1 : 0); // només cercles grans

        const tooltip = d3.select("body").append("div")
            .style("position", "absolute")
            .style("background", "rgba(0,0,0,0.7)")
            .style("color", "#fff")
            .style("padding", "5px 10px")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        nodes.on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 1);
            tooltip.html(d.children ? d.data.name : `${d.data.name}: ${d.value}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        }).on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY - 20) + "px");
        }).on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        });

        let focus = root;
        let view;

        const zoomTo = (v) => {
            const k = width / v[2];
            view = v;

            labels.attr("transform", d => `translate(${(d.x - v[0]) * k + width / 2},${(d.y - v[1]) * k + height / 2})`);
            nodes.attr("transform", d => `translate(${(d.x - v[0]) * k + width / 2},${(d.y - v[1]) * k + height / 2})`);
            nodes.attr("r", d => d.r * k);
        };

        const zoom = (d) => {
            focus = d;

            const transition = svg.transition()
                .duration(750)
                .tween("zoom", () => {
                    const i = d3.interpolateZoom(view, [d.x, d.y, d.r * 2]);
                    return t => zoomTo(i(t));
                });

            labels.transition(transition)
                .style("opacity", l => {
                    const inFocus = l === d || l.parent === d;
                    return l.r > 10 && inFocus ? 1 : 0; // només en focus i suficientment grans
                });
        };

        zoomTo([root.x, root.y, root.r * 2]);

        const legendData = [
            { name: "Situació de convivència", color: colorMap[1] },
            { name: "Ingressos", color: colorMap[2] },
            { name: "Finançament públic", color: colorMap[3] }
        ];

        const legend = svg.append("g")
            .attr("transform", `translate(${width - 180}, 20)`);

        legend.selectAll("rect")
            .data(legendData)
            .join("rect")
            .attr("y", (d,i) => i*25)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => d.color);

        legend.selectAll("text")
            .data(legendData)
            .join("text")
            .attr("x", 24)
            .attr("y", (d,i) => i*25 + 14)
            .text(d => d.name)
            .style("font-size", "12px");

        $("#circlePackingSocialExclusionRisk").show();
        $("#circlePackingSocialExclusionRisk").closest('div').find('.fa-spinner').hide();

    } catch (err) {
        console.error("Error:", err);
    }
}
