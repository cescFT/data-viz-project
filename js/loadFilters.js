async function loadFilters() {
    try {
        const db = await loadSQLiteDatabase("../ive_cat.sqlite");

        const rows = runQuery(db, `
            SELECT distinct any
            from ive_cat
            order by any
        `);

        const filterYears = $("[name='years']");

        rows.forEach(row => {
            filterYears.append(`<option value="${row.any}">${row.any}</option>`);
        });

        filterYears.select2({
            placeholder: "Selecciona anys",
            allowClear: true,
            width: '200px'
        });

    } catch (err) {
        console.error("Error:", err);
    }
}