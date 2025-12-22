async function groupedBarChartPerYearAndHospitalCenterType() {
    try {
        // Carrega la BD
        const db = await loadSQLiteDatabase("ive_cat.sqlite");

        const rows = runQuery(db, `
            SELECT COUNT(*) as total, tipus_centre, any
            FROM ive_cat
            GROUP BY tipus_centre, any
            ORDER BY any;
        `);

        const data = rows;

        /* =========================
           NORMALITZACIÓ
        ========================= */
        data.forEach(d => {
            d.tipus_centre = (d.tipus_centre || "No especificat").trim();
        });

        const svg = d3.select("#groupedBarChartHospitalPerYearsAndIVEType");
        svg.selectAll("*").remove();

        const margin = { top: 80, right: 30, bottom: 100, left: 60 },
              width  = +svg.attr("width")  - margin.left - margin.right,
              height = +svg.attr("height") - margin.top  - margin.bottom;

        const g = svg.append("g")
                     .attr("transform", `translate(${margin.left},${margin.top})`);

        const anys = [...new Set(data.map(d => d.any))];
        const centres = [...new Set(data.map(d => d.tipus_centre))];

        /* =========================
           ESTAT SELECCIÓ MÚLTIPLE
        ========================= */
        const centresSeleccionats = new Set();

        /* =========================
           ESCALES
        ========================= */
        const x0 = d3.scaleBand()
                     .domain(anys)
                     .range([0, width])
                     .paddingInner(0.15);

        const x1 = d3.scaleBand()
                     .domain(centres)
                     .range([0, x0.bandwidth() * 0.9])
                     .padding(0.25);

        const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.total)])
                    .nice()
                    .range([height, 0]);

        /* =========================
           EIXOS
        ========================= */
        g.append("g")
         .attr("transform", `translate(0,${height})`)
         .call(d3.axisBottom(x0))
         .selectAll("text")
         .attr("transform", "rotate(-25)")
         .style("text-anchor", "end");

        g.append("g")
         .call(d3.axisLeft(y));

        /* =========================
           ETIQUETES EIXOS
        ========================= */
        svg.append("text")
           .attr("x", margin.left + width / 2)
           .attr("y", height + margin.top + 60)
           .attr("text-anchor", "middle")
           .text("Any");

        svg.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 15)
           .attr("x", -(margin.top + height / 2))
           .attr("text-anchor", "middle")
           .text("Ocurrències");

        /* =========================
           AGRUPACIÓ
        ========================= */
        const grups = g.selectAll(".grup")
            .data(d3.group(data, d => d.any))
            .enter()
            .append("g")
            .attr("class", "grup")
            .attr("transform", d => {
                const offset = (x0.bandwidth() - x1.range()[1]) / 2;
                return `translate(${x0(d[0]) + offset},0)`;
            });

        /* =========================
           BARRES
        ========================= */
        const bars = grups.selectAll("rect")
            .data(d => d[1])
            .enter()
            .append("rect")
            .attr("x", d => x1(d.tipus_centre))
            .attr("y", d => y(d.total))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.total))
            .attr("fill", d => colorMap[d.tipus_centre] || "#999999");

        /* =========================
           ETIQUETES BARRES
        ========================= */
        const labels = grups.selectAll("text.label")
            .data(d => d[1])
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => x1(d.tipus_centre) + x1.bandwidth() / 2)
            .attr("y", d => y(d.total) - 6)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .text(d => d.total);

        /* =========================
           FUNCIÓ ACTUALITZACIÓ (GRISOS + BORDER)
        ========================= */
        function updateHighlight() {
            const hiHaSeleccio = centresSeleccionats.size > 0;

            bars
                .attr("opacity", d =>
                    !hiHaSeleccio || centresSeleccionats.has(d.tipus_centre) ? 1 : 0.2
                )
                .attr("stroke", d =>
                    centresSeleccionats.has(d.tipus_centre) ? "#000" : "none"
                )
                .attr("stroke-width", d =>
                    centresSeleccionats.has(d.tipus_centre) ? 1.5 : 0
                );

            labels
                .attr("opacity", d =>
                    !hiHaSeleccio || centresSeleccionats.has(d.tipus_centre) ? 1 : 0.2
                );
        }

        /* =========================
           LLEGENDA CLICABLE (MULTI)
        ========================= */
        const legend = svg.append("g")
                          .attr("transform", `translate(${margin.left},20)`);

        centres.forEach((c, i) => {
            const gLegend = legend.append("g")
                .attr("transform", `translate(${i * 180},0)`)
                .style("cursor", "pointer")
                .on("click", () => {
                    if (centresSeleccionats.has(c)) {
                        centresSeleccionats.delete(c);
                    } else {
                        centresSeleccionats.add(c);
                    }
                    updateHighlight();
                    updateLegend();
                });

            gLegend.append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", colorMap[c] || "#999999")
                .attr("class", "legend-rect");

            gLegend.append("text")
                .attr("x", 28)
                .attr("y", 15)
                .style("font-size", "12px")
                .text(c);

            gLegend.datum(c);
        });

        function updateLegend() {
            legend.selectAll("g")
                .select("rect")
                .attr("stroke", d =>
                    centresSeleccionats.has(d) ? "#000" : "none"
                )
                .attr("stroke-width", d =>
                    centresSeleccionats.has(d) ? 2 : 0
                )
                .attr("opacity", d =>
                    centresSeleccionats.size === 0 || centresSeleccionats.has(d) ? 1 : 0.3
                );
        }

        /* =========================
           SPINNER OFF
        ========================= */
        $("#groupedBarChartHospitalPerYearsAndIVEType")
            .closest("div")
            .find("i.fa-spinner")
            .remove();

        $("#groupedBarChartHospitalPerYearsAndIVEType").show();

    } catch (err) {
        console.error("Error:", err);
    }
}
