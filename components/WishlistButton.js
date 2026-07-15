"use client";

import { useShop } from "@/components/ShopProvider";

// Hartje om een product aan de verlanglijst toe te voegen / te verwijderen (F12)
export default function WishlistButton({ product }) {
    const { inWishlist, toggleWishlist } = useShop();
    const active = inWishlist(product.id);

    return (
        <button
            type="button"
            className={"wish-btn" + (active ? " active" : "")}
            title={active ? "Verwijder van verlanglijst" : "Voeg toe aan verlanglijst"}
            onClick={() => toggleWishlist(product)}
        >
            {active ? "♥" : "♡"}
        </button>
    );
}
