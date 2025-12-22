async function groupedBarChartPerGroupYearAndMethod(colorMap) {
    try {
        // Carrega la BD
        const db = await loadSQLiteDatabase("ive_cat.sqlite");

        const rows = runQuery(db, `
            SELECT count(*) AS total,
                   grup_edat,
                   metode_tipus_general AS metode
            FROM ive_cat
            GROUP BY grup_edat, metode_tipus_general
            ORDER BY grup_edat, metode_tipus_general;
        `);

        const data = rows;

        /* =========================
           NORMALITZACIÓ
        ========================= */
        data.forEach(d => {
            d.metode = (d.metode || "No especificat").trim();
        });

        const svg = d3.select("#groupedBarChartPerYearsAndIVEType");
        svg.selectAll("*").remove();

        const margin = { top: 80, right: 30, bottom: 100, left: 60 },
              width  = +svg.attr("width")  - margin.left - margin.right,
              height = +svg.attr("height") - margin.top  - margin.bottom;

        const g = svg.append("g")
                     .attr("transform", `translate(${margin.left},${margin.top})`);

        const grupsEdat = [...new Set(data.map(d => d.grup_edat))];
        const metodes   = [...new Set(data.map(d => d.metode))];

        /* =========================
           ESTAT SELECCIÓ MÚLTIPLE
        ========================= */
        const metodesSeleccionats = new Set();

        /* =========================
           ESCALES
        ========================= */
        const x0 = d3.scaleBand()
                     .domain(grupsEdat)
                     .range([0, width])
                     .paddingInner(0.15);

        const x1 = d3.scaleBand()
                     .domain(metodes)
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
           .text("Grups d'edat");

        svg.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 15)
           .attr("x", -(margin.top + height / 2))
           .attr("text-anchor", "middle")
           .text("Vegades utilitzat");

        /* =========================
           AGRUPACIÓ
        ========================= */
        const grups = g.selectAll(".grup")
            .data(d3.group(data, d => d.grup_edat))
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
            .attr("x", d => x1(d.metode))
            .attr("y", d => y(d.total))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.total))
            .attr("fill", d => colorMap[d.metode] || "#999999");

        /* =========================
           ETIQUETES BARRES
        ========================= */
        const labels = grups.selectAll("text.label")
            .data(d => d[1])
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => x1(d.metode) + x1.bandwidth() / 2)
            .attr("y", d => y(d.total) - 6)
            .attr("text-anchor", "middle")
            .style("font-size", "11px")
            .text(d => d.total);

        /* =========================
           FUNCIÓ ACTUALITZACIÓ (GRISOS + BORDER)
        ========================= */
        function updateHighlight() {
            const hiHaSeleccio = metodesSeleccionats.size > 0;

            bars
                .attr("opacity", d =>
                    !hiHaSeleccio || metodesSeleccionats.has(d.metode) ? 1 : 0.2
                )
                .attr("stroke", d =>
                    metodesSeleccionats.has(d.metode) ? "#000" : "none"
                )
                .attr("stroke-width", d =>
                    metodesSeleccionats.has(d.metode) ? 1.5 : 0
                );

            labels
                .attr("opacity", d =>
                    !hiHaSeleccio || metodesSeleccionats.has(d.metode) ? 1 : 0.2
                );
        }

        /* =========================
           LLEGENDA CLICABLE (MULTI)
        ========================= */
        const legend = svg.append("g")
                          .attr("transform", `translate(${margin.left},20)`);

        metodes.forEach((m, i) => {
            const gLegend = legend.append("g")
                .attr("transform", `translate(${i * 180},0)`)
                .style("cursor", "pointer")
                .on("click", () => {
                    if (metodesSeleccionats.has(m)) {
                        metodesSeleccionats.delete(m);
                    } else {
                        metodesSeleccionats.add(m);
                    }
                    updateHighlight();
                    updateLegend();
                });

            gLegend.append("rect")
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", colorMap[m] || "#999999")
                .attr("class", "legend-rect");

            gLegend.append("text")
                .attr("x", 28)
                .attr("y", 15)
                .style("font-size", "12px")
                .text(m);

            gLegend.datum(m);
        });

        function updateLegend() {
            legend.selectAll("g")
                .select("rect")
                .attr("stroke", d =>
                    metodesSeleccionats.has(d) ? "#000" : "none"
                )
                .attr("stroke-width", d =>
                    metodesSeleccionats.has(d) ? 2 : 0
                )
                .attr("opacity", d =>
                    metodesSeleccionats.size === 0 || metodesSeleccionats.has(d) ? 1 : 0.3
                );
        }

        /* =========================
           SPINNER OFF
        ========================= */
        $("#groupedBarChartPerYearsAndIVEType")
            .closest("div")
            .find("i.fa-spinner")
            .remove();

        $("#groupedBarChartPerYearsAndIVEType").show();

    } catch (err) {
        console.error("Error:", err);
    }
}
