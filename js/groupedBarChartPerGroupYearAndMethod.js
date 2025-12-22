async function groupedBarChartPerGroupYearAndMethod() {
    try {
        // Carrega la BD
        const db = await loadSQLiteDatabase("ive_cat.sqlite");

        const rows = runQuery(db, `
            SELECT count(*) as total, grup_edat, metode_tipus_general as metode
            FROM ive_cat
            GROUP BY grup_edat, metode_tipus_general
            ORDER BY grup_edat, metode_tipus_general;
        `);

        const data = rows;

        const svg = d3.select("#groupedBarChartPerYearsAndIVEType");
        svg.selectAll("*").remove(); // Neteja l'SVG

        const margin = { top: 80, right: 30, bottom: 100, left: 60 },
              width = +svg.attr("width") - margin.left - margin.right,
              height = +svg.attr("height") - margin.top - margin.bottom;

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const grupsEdat = [...new Set(data.map(d => d.grup_edat))];
        const metodes = [...new Set(data.map(d => d.metode))];

        // Escales amb més espai
        const x0 = d3.scaleBand()
                     .domain(grupsEdat)
                     .range([0, width])
                     .paddingInner(0.3); // més espai entre grups

        const x1 = d3.scaleBand()
                     .domain(metodes)
                     .range([0, x0.bandwidth()])
                     .padding(0.2); // més espai entre barres

        const y = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.total)]).nice()
                    .range([height, 0]);

        const color = d3.scaleOrdinal()
                        .domain(metodes)
                        .range(d3.schemeSet2);

        // Eixos
        g.append("g")
         .attr("class", "x-axis")
         .attr("transform", `translate(0,${height})`)
         .call(d3.axisBottom(x0))
         .selectAll("text")
         .attr("transform", "translate(0,5) rotate(-25)")
         .style("text-anchor", "end");

        g.append("g")
         .attr("class", "y-axis")
         .call(d3.axisLeft(y));

        // Labels dels eixos
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

        // Barres
        const grups = g.selectAll(".grup")
                        .data(data.reduce((acc, d) => {
                            const existing = acc.find(e => e.grup_edat === d.grup_edat);
                            if (existing) existing.values.push(d);
                            else acc.push({ grup_edat: d.grup_edat, values: [d] });
                            return acc;
                        }, []))
                        .enter()
                        .append("g")
                        .attr("class", "grup")
                        .attr("transform", d => `translate(${x0(d.grup_edat)},0)`);

        grups.selectAll("rect")
              .data(d => d.values)
              .enter()
              .append("rect")
              .attr("x", d => x1(d.metode))
              .attr("y", d => y(d.total))
              .attr("width", x1.bandwidth())
              .attr("height", d => height - y(d.total))
              .attr("fill", d => color(d.metode))
              .on("mouseover", function(event, d) {
                  d3.selectAll("rect")
                    .attr("opacity", 0.3);
                  d3.select(this)
                    .attr("opacity", 1)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 1.5);
              })
              .on("mouseout", function() {
                  d3.selectAll("rect")
                    .attr("opacity", 1)
                    .attr("stroke", "none");
              });

        // Etiquetes sobre les barres
        grups.selectAll("text.label")
              .data(d => d.values)
              .enter()
              .append("text")
              .attr("class", "label")
              .attr("x", d => x1(d.metode) + x1.bandwidth() / 2)
              .attr("y", d => y(d.total) - 5)
              .attr("text-anchor", "middle")
              .text(d => d.total);

        // Llegenda amb noms dels mètodes distribuïda horitzontalment
        const legend = svg.append("g")
                          .attr("transform", `translate(${margin.left}, 20)`);

        metodes.forEach((m, i) => {
            const gLegend = legend.append("g")
                                  .attr("transform", `translate(${i * 120},0)`); // més separació horitzontal

            gLegend.append("rect")
                   .attr("width", 20)
                   .attr("height", 20)
                   .attr("fill", color(m));

            gLegend.append("text")
                   .attr("x", 25)
                   .attr("y", 15)
                   .text(m)
                   .style("font-size", "12px");
        });

        $("#groupedBarChartPerYearsAndIVEType")
            .closest("div")
            .find("i.fa-spinner")
            .remove();

        $("#groupedBarChartPerYearsAndIVEType").show();
    } catch (err) {
        console.error("Error:", err);
    }
}
