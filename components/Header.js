"use client";

import Link from "next/link";
import { useShop } from "@/components/ShopProvider";

// Bovenbalk: logo, navigatie en valuta-switch (F10)
export default function Header() {
    const { currency, setCurrency, cartCount, wishlist } = useShop();

    return (
        <header className="hdr">
            <div className="wrap">
                <Link className="logo" href="/">Voetbalshop</Link>

                <nav>
                    <Link href="/">Producten</Link>
                    <Link href="/wishlist">
                        Verlanglijst{wishlist.length > 0 && ` (${wishlist.length})`}
                    </Link>
                    <Link href="/cart">
                        Winkelmand{cartCount > 0 && ` (${cartCount})`}
                    </Link>
                </nav>

                {/* Schakelen tussen euro en Turkse lira */}
                <div className="currency-switch">
                    <button
                        className={currency === "EUR" ? "active" : ""}
                        onClick={() => setCurrency("EUR")}
                    >
                        €
                    </button>
                    <button
                        className={currency === "TRY" ? "active" : ""}
                        onClick={() => setCurrency("TRY")}
                    >
                        ₺
                    </button>
                </div>
            </div>
        </header>
    );
}
