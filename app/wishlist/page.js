"use client";
// ============================================================
// wishlist/page.js — het verlanglijstje / favorieten (F12)
// ============================================================
// Client component: de verlanglijst leeft in de browser
// (ShopProvider + localStorage), niet in de database.
// Producten komen erop/eraf via het hartje (WishlistButton)
// of de "Verwijder"-knop hieronder.

import Link from "next/link";
import { useShop } from "@/components/ShopProvider";
import Price from "@/components/Price";

export default function WishlistPage() {
    const { wishlist, toggleWishlist } = useShop();

    return (
        <div className="box">
            <h2>Verlanglijst</h2>

            {wishlist.length === 0 ? (
                // Lege verlanglijst
                <>
                    <p className="empty">Nog geen favorieten. Klik op het hartje bij een product.</p>
                    <Link className="btn" href="/">Bekijk producten</Link>
                </>
            ) : (
                // Grid met favoriete producten
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
                                    {/* toggleWishlist haalt hem eraf (hij staat er al op) */}
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
