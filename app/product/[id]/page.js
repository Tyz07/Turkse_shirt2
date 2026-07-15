// ============================================================
// product/[id]/page.js — de productdetailpagina (F2)
// ============================================================
// De mapnaam [id] betekent: dit stuk van de URL is variabel.
// /product/1 -> params.id = "1", /product/7 -> params.id = "7".
// Net als de homepagina is dit een server component die zelf
// de database bevraagt.

import { notFound } from "next/navigation";
import Link from "next/link";
import pool from "@/lib/db";
import Price from "@/components/Price";
import AddToCartForm from "@/components/AddToCartForm";
import WishlistButton from "@/components/WishlistButton";

// Nooit cachen: voorraad moet actueel zijn
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
    // In Next.js 15 is params een Promise -> eerst awaiten
    const { id } = await params;

    // Product opzoeken; het ?-teken wordt veilig ingevuld door mysql2
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    if (rows.length === 0) {
        notFound(); // bestaat niet -> toon de 404-pagina van Next.js
    }
    // Prijs komt als string uit MySQL (DECIMAL) -> omzetten naar number
    const product = { ...rows[0], price: Number(rows[0].price) };

    // Alle maten + voorraad van dit product, in kledingvolgorde
    const [variants] = await pool.query(
        "SELECT size, stock FROM product_variants WHERE product_id = ? ORDER BY FIELD(size,'S','M','L','XL','XXL')",
        [id]
    );
    // Voor het formulier: alleen de maten die nog op voorraad zijn
    const sizes = variants.filter((v) => v.stock > 0).map((v) => v.size);

    return (
        <>
            {/* Kruimelpad terug naar het overzicht */}
            <p className="breadcrumb">
                <Link href="/">Producten</Link> / {product.name}
            </p>

            <div className="detail">
                {/* Links: grote foto met verlanglijst-hartje */}
                <div className="detail-img">
                    <img src={`/img/${product.image}`} alt={product.name} />
                    <WishlistButton product={product} />
                </div>

                {/* Rechts: alle info + bestelformulier */}
                <div className="detail-info">
                    <div className="badge">{product.club}</div>
                    <h2>{product.name}</h2>
                    <p className="desc">{product.description}</p>

                    <div className="price">
                        <Price amount={product.price} />
                    </div>

                    {/* Voorraad per maat, uitverkocht in het rood */}
                    <ul className="stock-list">
                        {variants.map((v) => (
                            <li key={v.size}>
                                <strong>{v.size}</strong>:{" "}
                                {v.stock > 0 ? (
                                    <span className="stock-ok">{v.stock} op voorraad</span>
                                ) : (
                                    <span className="stock-out">uitverkocht</span>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Maat + bedrukking + aantal + "In mand" (F5, F6, F7) */}
                    <AddToCartForm product={product} sizes={sizes} />
                </div>
            </div>
        </>
    );
}
