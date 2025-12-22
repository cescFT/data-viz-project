async function stackedAreaPerMethodAndYear() {
    try {
        // Carrega la BD
        const db = await loadSQLiteDatabase("ive_cat.sqlite");
        const rows = runQuery(db, `
            SELECT COUNT(*) as total, metode, any
            from ive_cat
            group by metode, any
            order by any
        `);

        // Configuració del SVG
        const margin = {top: 30, right: 30, bottom: 50, left: 60};
        const width = 800 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#stackedAreaPerMethodAndYear")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Extreure anys i mètodes únics
        const years = Array.from(new Set(rows.map(d => d.any))).sort((a,b) => a-b);
        const methods = Array.from(new Set(rows.map(d => d.metode)));

        // Reorganitzar les dades per any
        const dataByYear = years.map(year => {
            const entry = {any: year};
            methods.forEach(m => {
                const row = rows.find(r => r.any === year && r.metode === m);
                entry[m] = row ? +row.total : 0;
            });
            return entry;
        });

        // Escalats
        const x = d3.scaleLinear()
            .domain(d3.extent(years))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(dataByYear, d => d3.sum(methods, m => d[m]))])
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain(methods)
            .range(d3.schemeCategory10);

        // Crear stack
        const stack = d3.stack()
            .keys(methods);

        const stackedData = stack(dataByYear);

        // Àrees
        const area = d3.area()
            .x(d => x(d.data.any))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]));

        svg.selectAll("path")
            .data(stackedData)
            .enter()
            .append("path")
            .attr("fill", d => color(d.key))
            .attr("d", area);

        // Eixos
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // any com a enter

        svg.append("g")
            .call(d3.axisLeft(y));

        // Llegenda
        const legend = svg.selectAll(".legend")
            .data(methods)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d,i) => `translate(0,${i*20})`);

        legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(d => d);


        // Mostrar SVG i amagar spinner
        $("#stackedAreaPerMethodAndYear").show();
        $("#stackedAreaPerMethodAndYear").closest('div').find('.fa-spinner').hide();
    } catch (err) {
        console.error("Error:", err);
    }
}
