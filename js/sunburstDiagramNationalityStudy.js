async function sunburstDiagramNationalityStudy() {
    try {
        const db = await loadSQLiteDatabase("ive_cat.sqlite");

        const itemsFirstCircle = runQuery(db, `
            SELECT count(*) as total, primera_nacionalitat
            FROM ive_cat
            GROUP BY primera_nacionalitat;
        `);

        const itemsSecondCircle = runQuery(db, `
            SELECT count(*) as total, primera_nacionalitat
            FROM ive_cat
            WHERE situacio_laboral = 'Aturada o a la recerca de la primera feina remunerada'
              AND ingressos = 'No'
            GROUP BY primera_nacionalitat;
        `);

        const itemsThirdCircle = runQuery(db, `
            SELECT count(*) as total, primera_nacionalitat
            FROM ive_cat
            WHERE situacio_laboral = 'Treballadora'
              AND ingressos = 'Sí'
            GROUP BY primera_nacionalitat;
        `);

        /* ---------------------------
           1. Mapes auxiliars
        --------------------------- */
        const aturadesMap = {};
        itemsSecondCircle.forEach(d => {
            aturadesMap[d.primera_nacionalitat] = d.total;
        });

        const treballadoresMap = {};
        itemsThirdCircle.forEach(d => {
            treballadoresMap[d.primera_nacionalitat] = d.total;
        });

        /* ---------------------------
           2. Dades jeràrquiques
        --------------------------- */
        const dataHierarchy = {
            name: "IVE Catalunya",
            children: itemsFirstCircle.map(d => ({
                name: d.primera_nacionalitat,
                children: [
                    {
                        name: "Aturada / Sense ingressos",
                        value: aturadesMap[d.primera_nacionalitat] || 0
                    },
                    {
                        name: "Treballadora / Amb ingressos",
                        value: treballadoresMap[d.primera_nacionalitat] || 0
                    }
                ]
            }))
        };

        /* ---------------------------
           3. Dimensions
        --------------------------- */
        const width = 600;
        const radius = width / 2;

        const color = d3.scaleOrdinal()
            .domain([
                "Espanyola",
                "No espanyola",
                "Aturada / Sense ingressos",
                "Treballadora / Amb ingressos"
            ])
            .range(["#5B8FF9", "#F6BD16", "#E8684A", "#52C41A"]);

        const svg = d3.select("#sunburstNationalityStudy");
        svg.selectAll("*").remove();

        const g = svg
            .attr("width", width)
            .attr("height", width)
            .append("g")
            .attr("transform", `translate(${radius},${radius})`);

        const tooltip = d3.select("#sunburstTooltipNationalityStudy");
        const containerRect = svg.node().getBoundingClientRect();

        /* ---------------------------
           4. Jerarquia + partició
        --------------------------- */
        const root = d3.hierarchy(dataHierarchy)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        d3.partition()
            .size([2 * Math.PI, radius])
            (root);

        const arc = d3.arc()
            .startAngle(d => d.x0)
            .endAngle(d => d.x1)
            .innerRadius(d => d.y0)
            .outerRadius(d => d.y1);

        /* ---------------------------
           5. Dibuix
        --------------------------- */
        g.selectAll("path")
            .data(root.descendants().filter(d => d.depth))
            .enter()
            .append("path")
            .attr("d", arc)
            .attr("fill", d => color(d.data.name))
            .attr("stroke", "#fff")
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("stroke", "#000")
                    .attr("stroke-width", 2);

                tooltip
                    .style("opacity", 1)
                    .html(`
                        <strong>${d.data.name}</strong><br/>
                        Casos: ${d.value.toLocaleString()}
                    `);
            })
            .on("mousemove", function (event) {
                tooltip
                    .style("left", (event.clientX - containerRect.left + 10) + "px")
                    .style("top", (event.clientY - containerRect.top + 10) + "px");
            })
            .on("mouseout", function () {
                d3.select(this)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1);

                tooltip.style("opacity", 0);
            });


            $("#sunburstNationalityStudy").closest('div').find('.fa-spinner').hide();
            $("#sunburstNationalityStudy").show();
    } catch (err) {
        console.error("Error:", err);
    }
}
