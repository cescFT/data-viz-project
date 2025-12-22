async function stackedAreaPerMethodAndYear() {
    try {
        const db = await loadSQLiteDatabase("ive_cat.sqlite");
        const rows = runQuery(db, `
            SELECT COUNT(*) as total, metode, any
            from ive_cat
            group by metode, any
            order by any
        `);

        const years = Array.from(new Set(rows.map(d => d.any))).sort((a,b) => a-b);
        const methods = Array.from(new Set(rows.map(d => d.metode)));

        const dataByYear = years.map(year => {
            const entry = {any: year};
            methods.forEach(m => {
                const row = rows.find(r => r.any === year && r.metode === m);
                entry[m] = row ? +row.total : 0;
            });
            return entry;
        });

        const legendRectSize = 18;
        const legendSpacing = 5;
        const maxLegendsPerRow = 5;

        const shortMethods = methods.filter(d => d.length <= 20);
        const longMethods = methods.filter(d => d.length > 20);

        const legendRows = Math.ceil(shortMethods.length / maxLegendsPerRow);
        const marginTop = legendRows * (legendRectSize + legendSpacing) + 50; // reservem espai per longMethods
        const margin = {top: marginTop, right: 30, bottom: 50, left: 60};
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        d3.select("#stackedAreaPerMethodAndYear").selectAll("*").remove();

        const svg = d3.select("#stackedAreaPerMethodAndYear")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear()
            .domain(d3.extent(years))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(dataByYear, d => d3.sum(methods, m => d[m]))])
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain(methods)
            .range(d3.schemeCategory10);

        const stack = d3.stack().keys(methods);
        const stackedData = stack(dataByYear);

        const area = d3.area()
            .x(d => x(d.data.any))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]));

        const areas = svg.selectAll(".metode-path")
            .data(stackedData)
            .enter()
            .append("path")
            .attr("class", "metode-path")
            .attr("fill", d => color(d.key))
            .attr("d", area);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        svg.append("g")
            .call(d3.axisLeft(y));

        let selectedMethods = new Set();

        function updateChart() {
            const isAnySelected = selectedMethods.size > 0;

            areas.transition().duration(500)
                .attr("fill", d => !isAnySelected || selectedMethods.has(d.key) ? color(d.key) : "#D3D3D3")
                .style("opacity", d => !isAnySelected || selectedMethods.has(d.key) ? 1 : 0.6);

            svg.selectAll(".legend-rect")
                .transition().duration(300)
                .style("stroke", "#000")
                .style("stroke-width", d => selectedMethods.has(d) ? 3 : 1);

            svg.selectAll(".legend-text")
                .transition().duration(300)
                .style("fill", d => !isAnySelected || selectedMethods.has(d) ? "#000" : "#aaa")
                .style("font-weight", d => selectedMethods.has(d) ? "bold" : "normal");
        }

        const legendXSpacing = width / maxLegendsPerRow;

        function drawLegend(methodArray, startY, isSingleLine = false) {
            methodArray.forEach((d, i) => {
                const row = isSingleLine ? 0 : Math.floor(i / maxLegendsPerRow);
                const col = i % maxLegendsPerRow;
                const xPos = col * legendXSpacing;
                const yPos = startY + row * (legendRectSize + legendSpacing);

                const g = svg.append("g")
                    .attr("class", "legend")
                    .attr("transform", `translate(${xPos},${yPos})`)
                    .style("cursor", "pointer")
                    .on("click", () => {
                        if (selectedMethods.has(d)) selectedMethods.delete(d);
                        else selectedMethods.add(d);
                        updateChart();
                    });

                g.append("rect")
                    .attr("class", "legend-rect")
                    .datum(d)
                    .attr("width", legendRectSize)
                    .attr("height", legendRectSize)
                    .style("fill", color(d))
                    .style("stroke", "#000")
                    .style("stroke-width", 1);

                g.append("text")
                    .attr("class", "legend-text")
                    .datum(d)
                    .attr("x", legendRectSize + 5)
                    .attr("y", legendRectSize / 2)
                    .attr("dy", ".35em")
                    .style("text-anchor", "start")
                    .style("font-size", "12px")
                    .text(d);
            });
        }

        // Curts en quadrícula
        drawLegend(shortMethods, -margin.top);

        // Llargs en línia separada
        drawLegend(longMethods, -margin.top + legendRows * (legendRectSize + legendSpacing), true);

        $("#stackedAreaPerMethodAndYear").show();
        $("#stackedAreaPerMethodAndYear").closest('div').find('.fa-spinner').hide();

    } catch (err) {
        console.error("Error:", err);
    }
}
