import Link from "next/link";
import Price from "@/components/Price";
import AddToCartForm from "@/components/AddToCartForm";
import WishlistButton from "@/components/WishlistButton";

// Eén product-kaartje in het overzicht (F1)
export default function ProductCard({ product, sizes }) {
    return (
        <div className="card">
            <div className="card-img">
                <Link href={`/product/${product.id}`}>
                    <img src={`/img/${product.image}`} alt={product.name} />
                </Link>
                <WishlistButton product={product} />
            </div>

            <div className="p">
                <div className="badge">{product.club}</div>

                {/* Titel linkt naar de detailpagina (F2) */}
                <h3>
                    <Link href={`/product/${product.id}`}>{product.name}</Link>
                </h3>

                <div className="price">
                    <Price amount={product.price} />
                </div>

                <AddToCartForm product={product} sizes={sizes} />
            </div>
        </div>
    );
}
