// ============================================================
// page.js — de homepagina: productoverzicht (F1)
// ============================================================
// Dit is een SERVER component: hij draait op de server en mag
// dus rechtstreeks de database in. De browser krijgt alleen de
// kant-en-klare HTML.
//
// Zoeken (F3) en filteren (F4) werken via de URL:
//   /?q=galatasaray&club=Galatasaray&min=50&max=90
// De FilterBar stuurt het formulier daarheen, en deze pagina
// leest de waarden uit searchParams en bouwt er een SQL-query van.

import pool from "@/lib/db";
import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";

// "force-dynamic" = deze pagina nooit cachen, altijd verse data
// uit de database halen (anders zie je oude voorraad/prijzen).
export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }) {
    // In Next.js 15 is searchParams een Promise -> eerst awaiten
    const sp = await searchParams;
    const filters = {
        q: sp.q ?? "",       // zoekterm
        club: sp.club ?? "", // gekozen club
        min: sp.min ?? "",   // minimumprijs
        max: sp.max ?? "",   // maximumprijs
    };

    // ---- SQL-query stap voor stap opbouwen ----
    // "WHERE 1=1" is een trucje: daardoor kun je alle filters
    // met "AND ..." aanplakken zonder te checken of het de eerste is.
    // De ?-tekens zijn placeholders: mysql2 vult ze veilig in
    // (beschermt tegen SQL-injectie).
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (filters.q) {
        sql += " AND name LIKE ?";
        params.push(`%${filters.q}%`); // %...% = "komt ergens in de naam voor"
    }
    if (filters.club) {
        sql += " AND club = ?";
        params.push(filters.club);
    }
    if (filters.min !== "" && !isNaN(Number(filters.min))) {
        sql += " AND price >= ?";
        params.push(Number(filters.min));
    }
    if (filters.max !== "" && !isNaN(Number(filters.max))) {
        sql += " AND price <= ?";
        params.push(Number(filters.max));
    }
    sql += " ORDER BY name";

    // ---- Drie queries: producten, clublijst en beschikbare maten ----
    const [products] = await pool.query(sql, params);
    const [clubRows] = await pool.query(
        "SELECT DISTINCT club FROM products ORDER BY club"
    );
    // FIELD(...) sorteert de maten in kledingvolgorde i.p.v. alfabetisch
    const [variantRows] = await pool.query(
        "SELECT product_id, size FROM product_variants WHERE stock > 0 ORDER BY FIELD(size,'S','M','L','XL','XXL')"
    );

    // Ombouwen naar een handige map: { productId: ["S","M","L"], ... }
    // (??= betekent: maak eerst een lege array als die er nog niet is)
    const sizeMap = {};
    for (const v of variantRows) {
        (sizeMap[v.product_id] ??= []).push(v.size);
    }

    return (
        <>
            {/* Zoek- en filterbalk (F3, F4) */}
            <FilterBar clubs={clubRows.map((r) => r.club)} filters={filters} />

            {products.length === 0 ? (
                // Niets gevonden met deze filters
                <div className="box">
                    <p className="empty">Geen producten gevonden. Probeer een ander filter.</p>
                </div>
            ) : (
                // Het grid met productkaartjes (F1)
                <div className="grid">
                    {products.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={{ ...p, price: Number(p.price) }}
                            sizes={sizeMap[p.id] ?? []}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
