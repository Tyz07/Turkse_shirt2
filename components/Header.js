"use client";
// ============================================================
// Header.js — de donkere bovenbalk op elke pagina
// ============================================================
// Bevat: logo, navigatie (met tellers) en de valuta-switch (F10).
// Moet een client component zijn ("use client") omdat hij live
// meekijkt met de winkel-state: de tellers achter "Winkelmand" en
// "Verlanglijst" lopen direct mee als je iets toevoegt.

import Link from "next/link";
import { useShop } from "@/components/ShopProvider";

export default function Header() {
    // Data uit de globale winkel-state halen
    const { currency, setCurrency, cartCount, wishlist } = useShop();

    return (
        <header className="hdr">
            <div className="wrap">
                {/* Logo: klik = terug naar de homepagina */}
                <Link className="logo" href="/">Voetbalshop</Link>

                <nav>
                    <Link href="/">Producten</Link>

                    {/* De teller wordt alleen getoond als er iets in zit,
                        bijv. "Verlanglijst (2)" */}
                    <Link href="/wishlist">
                        Verlanglijst{wishlist.length > 0 && ` (${wishlist.length})`}
                    </Link>
                    <Link href="/cart">
                        Winkelmand{cartCount > 0 && ` (${cartCount})`}
                    </Link>
                </nav>

                {/* Valuta-switch (F10): de actieve knop kleurt rood.
                    setCurrency verandert de globale state, waardoor ALLE
                    prijzen op de pagina direct omschakelen. */}
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
