// Filterbalk: zoeken (F3), club en prijsrange filteren (F4).
// Gewoon een GET-formulier: de homepagina leest de waarden uit de URL.
export default function FilterBar({ clubs, filters }) {
    return (
        <div className="box">
            <form method="get" action="/" className="row filter-row">
                <div className="grow2">
                    <input
                        className="input"
                        type="text"
                        name="q"
                        placeholder="Zoeken"
                        defaultValue={filters.q}
                    />
                </div>

                <div className="grow1">
                    <select name="club" className="input" defaultValue={filters.club}>
                        <option value="">Club</option>
                        {clubs.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

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
                <div><a className="btn alt" href="/">Reset</a></div>
            </form>
        </div>
    );
}
