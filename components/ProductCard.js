// ============================================================
// ProductCard.js — één product-kaartje in het overzicht (F1)
// ============================================================
// Dit is een SERVER component (geen "use client" bovenaan):
// het kaartje zelf is statische HTML. De interactieve stukjes
// erin (hartje, prijs, in-mand-formulier) zijn aparte client
// components die hier gewoon ingeplugd worden.

import Link from "next/link";
import Price from "@/components/Price";
import AddToCartForm from "@/components/AddToCartForm";
import WishlistButton from "@/components/WishlistButton";

/**
 * @param {Object} props
 * @param {{id:number, name:string, price:number, club:string, image:string}} props.product
 * @param {string[]} props.sizes - Beschikbare maten (alleen met voorraad)
 */
export default function ProductCard({ product, sizes }) {
    return (
        <div className="card">
            {/* Foto: klikken opent de detailpagina (F2) */}
            <div className="card-img">
                <Link href={`/product/${product.id}`}>
                    <img src={`/img/${product.image}`} alt={product.name} />
                </Link>
                <WishlistButton product={product} />
            </div>

            <div className="p">
                {/* Rood club-badge */}
                <div className="badge">{product.club}</div>

                {/* Titel linkt ook naar de detailpagina (F2) */}
                <h3>
                    <Link href={`/product/${product.id}`}>{product.name}</Link>
                </h3>

                <div className="price">
                    <Price amount={product.price} />
                </div>

                {/* Maat + bedrukking + aantal + "In mand" (F5, F6, F7) */}
                <AddToCartForm product={product} sizes={sizes} />
            </div>
        </div>
    );
}
