async function loadFilters() {
    try {
        const db = await loadSQLiteDatabase("../ive_cat.sqlite");

        let rows = runQuery(db, `
            SELECT distinct any
            from ive_cat
            order by any
        `);

        const filtersForm = $("form[name='filters']");

        const filterYears = $("[name='years']");

        rows.forEach(row => {
            filterYears.append(`<option value="${row.any}">${row.any}</option>`);
        });

        filterYears.select2({
            placeholder: "Selecciona anys",
            allowClear: true,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: filtersForm
        });

        rows = runQuery(db, `
            SELECT distinct tipus_centre
            from ive_cat
        `);

        const filterCenterTypes = $("[name='centerType']");

        rows.forEach(row => {
            filterCenterTypes.append(`<option value="${row.tipus_centre}">${row.tipus_centre}</option>`);
        });

        filterCenterTypes.select2({
            placeholder: "Selecciona tipus de centre",
            allowClear: true,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: filtersForm
        });


        rows = runQuery(db, `
            SELECT distinct financament_public
            from ive_cat
        `);

        const filterfinanceType = $("[name='finantialType']");

        rows.forEach(row => {
            filterfinanceType.append(`<option value="${row.financament_public}">${row.financament_public}</option>`);
        });

        filterfinanceType.select2({
            placeholder: "Selecciona tipus de finançament",
            allowClear: true,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: filtersForm
        });


        rows = runQuery(db, `
            SELECT distinct grup_edat
            from ive_cat
        `);

        const filterAgeGroup = $("[name='ageGroupSelect']");

        rows.forEach(row => {
            filterAgeGroup.append(`<option value="${row.grup_edat}">${row.grup_edat}</option>`);
        });

        filterAgeGroup.select2({
            placeholder: "Selecciona grup d'edat",
            allowClear: true,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: filtersForm
        });

        const filterConvivencia = $("[name='situacioConvivenciaSelect']");

        rows = runQuery(db, `
            SELECT distinct situacio_convivència as situacio_convivencia
            from ive_cat
        `);

        rows.forEach(row => {
            filterConvivencia.append(`<option value="${row.situacio_convivencia}">${row.situacio_convivencia}</option>`);
        });

        filterConvivencia.select2({
            placeholder: "Selecciona situació de convivència",
            allowClear: true,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: filtersForm
        });

        const sonsSelect = $("[name='sonsSelect']");

        rows = runQuery(db, `
            SELECT distinct fills_carrec
            from ive_cat
        `);

        rows.forEach(row => {
            sonsSelect.append(`<option value="${row.fills_carrec}">${row.fills_carrec}</option>`);
        });

        sonsSelect.select2({
            placeholder: "Selecciona fills a càrrec",
            allowClear: true,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: filtersForm
        });

        const sonsAlive = $("[name='sonsAlive']");

        rows = runQuery(db, `
            SELECT distinct fills_vius
            from ive_cat
        `);

        rows.forEach(row => {
            sonsAlive.append(`<option value="${row.fills_vius}">${row.fills_vius}</option>`);
        });

        sonsAlive.select2({
            placeholder: "Selecciona fills vius",
            allowClear: true,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: filtersForm
        });


        const jobSituationSelect = $("[name='jobSituationSelect']");

        rows = runQuery(db, `
            SELECT distinct situacio_laboral
            from ive_cat
        `);

        rows.forEach(row => {
            jobSituationSelect.append(`<option value="${row.situacio_laboral}">${row.situacio_laboral}</option>`);
        });

        jobSituationSelect.select2({
            placeholder: "Selecciona situació laboral",
            allowClear: true,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: filtersForm
        });

        const housingSituationSelect = $("[name='ingressosSelect']");

        rows = runQuery(db, `
            SELECT distinct ingressos
            from ive_cat
        `);

        rows.forEach(row => {
            housingSituationSelect.append(`<option value="${row.ingressos}">${row.ingressos}</option>`);
        });

        housingSituationSelect.select2({
            placeholder: "Selecciona ingressos",
            allowClear: true,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: filtersForm
        });

        const countryBornSelect = $("[name='bornCountrySelect']");
        rows = runQuery(db, `
            select distinct pais_naixement
            from ive_cat
        `);

        rows.forEach(row => {
            countryBornSelect.append(`<option value="${row.pais_naixement}">${row.pais_naixement}</option>`);
        });

        countryBornSelect.select2({
            placeholder: "Selecciona pais de naixement",
            allowClear: true,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: filtersForm
        });

        const firstNationalitySelect = $("[name='firstNationalitySelect']");
        rows = runQuery(db, `
            select distinct primera_nacionalitat
            from ive_cat
        `);

        rows.forEach(row => {
            firstNationalitySelect.append(`<option value="${row.primera_nacionalitat}">${row.primera_nacionalitat}</option>`);
        });

        firstNationalitySelect.select2({
            placeholder: "Selecciona primera nacionalitat",
            allowClear: true,
            width: "100%",
            closeOnSelect: false,
            dropdownParent: filtersForm
        });


    } catch (err) {
        console.error("Error:", err);
    }
}