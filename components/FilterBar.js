// ============================================================
// FilterBar.js — zoeken (F3) en filteren (F4) op de homepagina
// ============================================================
// Bewust een ouderwets GET-formulier zonder JavaScript:
// bij "Filter" doet de browser gewoon een nieuwe request naar
// bijv. /?q=galatasaray&min=80 en de homepagina (een server
// component) leest die waarden uit de URL en filtert de
// database-query. Simpel en betrouwbaar.

/**
 * @param {Object} props
 * @param {string[]} props.clubs  - Alle clubnamen voor de dropdown
 * @param {{q:string, club:string, min:string, max:string}} props.filters
 *        De huidige filterwaarden uit de URL (om ze ingevuld te laten staan)
 */
export default function FilterBar({ clubs, filters }) {
    return (
        <div className="box">
            <form method="get" action="/" className="row filter-row">
                {/* Zoekveld (F3) — zoekt in de productnaam */}
                <div className="grow2">
                    <input
                        className="input"
                        type="text"
                        name="q"
                        placeholder="Zoeken"
                        defaultValue={filters.q}
                    />
                </div>

                {/* Clubfilter (F4) */}
                <div className="grow1">
                    <select name="club" className="input" defaultValue={filters.club}>
                        <option value="">Club</option>
                        {clubs.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* Prijsrange (F4): minimum en maximum in euro's */}
                <div className="grow1">
                    <input
                        className="input"
                        type="number"
                        step="0.01"
                        min="0"
                        name="min"
                        placeholder="Min €"
                        defaultValue={filters.min}
                    />
                </div>

                <div className="grow1">
                    <input
                        className="input"
                        type="number"
                        step="0.01"
                        min="0"
                        name="max"
                        placeholder="Max €"
                        defaultValue={filters.max}
                    />
                </div>

                <div><button className="btn" type="submit">Filter</button></div>

                {/* Reset = gewoon naar "/" zonder query-parameters */}
                <div><a className="btn alt" href="/">Reset</a></div>
            </form>
        </div>
    );
}
