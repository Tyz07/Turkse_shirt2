import { notFound } from "next/navigation";
import Link from "next/link";
import pool from "@/lib/db";
import Price from "@/components/Price";
import AddToCartForm from "@/components/AddToCartForm";
import WishlistButton from "@/components/WishlistButton";

export const dynamic = "force-dynamic";

// Productdetailpagina (F2): grote foto, omschrijving, voorraad per maat
export default async function ProductPage({ params }) {
    const { id } = await params;

    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    if (rows.length === 0) {
        notFound();
    }
    const product = { ...rows[0], price: Number(rows[0].price) };

    const [variants] = await pool.query(
        "SELECT size, stock FROM product_variants WHERE product_id = ? ORDER BY FIELD(size,'S','M','L','XL','XXL')",
        [id]
    );
    const sizes = variants.filter((v) => v.stock > 0).map((v) => v.size);

    return (
        <>
            <p className="breadcrumb">
                <Link href="/">Producten</Link> / {product.name}
            </p>

            <div className="detail">
                <div className="detail-img">
                    <img src={`/img/${product.image}`} alt={product.name} />
                    <WishlistButton product={product} />
                </div>

                <div className="detail-info">
                    <div className="badge">{product.club}</div>
                    <h2>{product.name}</h2>
                    <p className="desc">{product.description}</p>

                    <div className="price">
                        <Price amount={product.price} />
                    </div>

                    {/* Voorraad per maat */}
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

                    <AddToCartForm product={product} sizes={sizes} />
                </div>
            </div>
        </>
    );
}
