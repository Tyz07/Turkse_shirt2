import pool from "@/lib/db";
import FilterBar from "@/components/FilterBar";
import ProductCard from "@/components/ProductCard";

// Altijd verse data uit de database halen
export const dynamic = "force-dynamic";

// Homepagina: productoverzicht (F1) met zoeken (F3) en filteren (F4)
export default async function HomePage({ searchParams }) {
    const sp = await searchParams;
    const filters = {
        q: sp.q ?? "",
        club: sp.club ?? "",
        min: sp.min ?? "",
        max: sp.max ?? "",
    };

    // Query opbouwen op basis van de ingevulde filters
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (filters.q) {
        sql += " AND name LIKE ?";
        params.push(`%${filters.q}%`);
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

    const [products] = await pool.query(sql, params);
    const [clubRows] = await pool.query(
        "SELECT DISTINCT club FROM products ORDER BY club"
    );
    const [variantRows] = await pool.query(
        "SELECT product_id, size FROM product_variants WHERE stock > 0 ORDER BY FIELD(size,'S','M','L','XL','XXL')"
    );

    // Map: product_id => [beschikbare maten]
    const sizeMap = {};
    for (const v of variantRows) {
        (sizeMap[v.product_id] ??= []).push(v.size);
    }

    return (
        <>
            <FilterBar clubs={clubRows.map((r) => r.club)} filters={filters} />

            {products.length === 0 ? (
                <div className="box">
                    <p className="empty">Geen producten gevonden. Probeer een ander filter.</p>
                </div>
            ) : (
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
