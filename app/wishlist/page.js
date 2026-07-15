"use client";

import Link from "next/link";
import { useShop } from "@/components/ShopProvider";
import Price from "@/components/Price";

// Verlanglijstje / favorieten (F12)
export default function WishlistPage() {
    const { wishlist, toggleWishlist } = useShop();

    return (
        <div className="box">
            <h2>Verlanglijst</h2>

            {wishlist.length === 0 ? (
                <>
                    <p className="empty">Nog geen favorieten. Klik op het hartje bij een product.</p>
                    <Link className="btn" href="/">Bekijk producten</Link>
                </>
            ) : (
                <div className="grid">
                    {wishlist.map((p) => (
                        <div className="card" key={p.id}>
                            <div className="card-img">
                                <Link href={`/product/${p.id}`}>
                                    <img src={`/img/${p.image}`} alt={p.name} />
                                </Link>
                            </div>
                            <div className="p">
                                <div className="badge">{p.club}</div>
                                <h3>
                                    <Link href={`/product/${p.id}`}>{p.name}</Link>
                                </h3>
                                <div className="price"><Price amount={p.price} /></div>
                                <div className="row">
                                    <Link className="btn" href={`/product/${p.id}`}>Bekijk</Link>
                                    <button
                                        className="btn alt"
                                        onClick={() => toggleWishlist(p)}
                                    >
                                        Verwijder
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
