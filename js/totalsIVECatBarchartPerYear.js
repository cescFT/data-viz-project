async function totalsIVECatBarchartPerYearIVEPerYear() {
    try {
        // Carrega la BD
        const db = await loadSQLiteDatabase("ive_cat.sqlite");

        const rows = runQuery(db, `
            SELECT count(*) as total, any
            FROM ive_cat
            GROUP BY any
            ORDER BY any
        `);

        const margin = { top: 30, right: 30, bottom: 50, left: 70 },
              width = 900 - margin.left - margin.right,
              height = 450 - margin.top - margin.bottom;

        // SVG
        const svg = d3.select("#totalsIVECatBarchartPerYear")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Escala X (anys)
        const x = d3.scaleBand()
            .domain(rows.map(d => d.any))
            .range([0, width])
            .padding(0.2);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        // Escala Y (nombre de casos)
        const y = d3.scaleLinear()
            .domain([0, d3.max(rows, d => d.total)])
            .nice()
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y));

        // Barres
        svg.selectAll("rect")
            .data(rows)
            .enter()
            .append("rect")
            .attr("x", d => x(d.any))
            .attr("y", d => y(d.total))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.total))
            .attr("fill", "#5B8FF9");

            
        // ===== ETIQUETES DE VALOR =====
        svg.selectAll(".bar-label")
            .data(rows)
            .enter()
            .append("text")
            .attr("class", "bar-label")
            .attr("x", d => x(d.any) + x.bandwidth() / 2)
            .attr("y", d => y(d.total) - 5)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#333")
            .text(d => d.total.toLocaleString());

        // Etiqueta eix Y
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("x", -height / 2)
            .attr("text-anchor", "middle")
            .text("Nombre de casos");

        // Etiqueta eix X
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .text("Any");

        // Spinner off
        $("#totalsIVECatBarchartPerYear")
            .closest("div")
            .find("i.fa-spinner")
            .remove();

        $("#totalsIVECatBarchartPerYear").show();

    } catch (err) {
        console.error("Error:", err);
    }
}
