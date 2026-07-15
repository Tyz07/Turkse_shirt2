"use client";
// ============================================================
// WishlistButton.js — het hartje op elke productfoto (F12)
// ============================================================
// Leeg hartje (♡) = product staat nog niet op de verlanglijst.
// Vol hartje (♥) + rode achtergrond = staat erop.
// Klikken wisselt tussen die twee (toggle).

import { useShop } from "@/components/ShopProvider";

/**
 * @param {{ product: {id:number, name:string, price:number|string, image:string, club:string} }} props
 */
export default function WishlistButton({ product }) {
    const { inWishlist, toggleWishlist } = useShop();
    const active = inWishlist(product.id); // staat dit product er al op?

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
