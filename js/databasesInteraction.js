// ---------------------------------------------------------------
// Carrega un fitxer SQLite i executa consultes SQL (client-side)
// Dependència: sql.js (SQLite compilat a WebAssembly)
// ---------------------------------------------------------------

async function loadSQLiteDatabase(dbPath) {
    // Inicialitza sql.js (important: locateFile apunta al CDN)
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    // Carrega el fitxer SQLite com a ArrayBuffer
    const response = await fetch(dbPath);
    if (!response.ok) throw new Error("No s'ha pogut carregar la base de dades SQLite");

    const buffer = await response.arrayBuffer();

    // Crea la instància de la BD carregant el buffer
    const db = new SQL.Database(new Uint8Array(buffer));

    return db;
}


// ---------------------------------------------------------------
// Executa una consulta SQL i retorna els resultats com a array
// d’objectes JS (columns + values)
// ---------------------------------------------------------------

function runQuery(db, sql) {
    const results = db.exec(sql);

    if (results.length === 0) return [];

    const result = results[0]; // primera taula retornada
    const columns = result.columns;
    const values = result.values;

    // Converteix a objects [{col: val, ...}, ...]
    return values.map(row =>
        Object.fromEntries(
            row.map((value, index) => [columns[index], value])
        )
    );
}
