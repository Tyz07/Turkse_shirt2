"use client";
// ============================================================
// AddToCartForm.js — het formulier onder elk product
// ============================================================
// Hiermee kiest de gebruiker een maat (F5), zet eventueel een
// naam op het shirt (F6) en stopt het product in de mand (F7).
// Wordt op twee plekken gebruikt: op de productkaartjes (home)
// én op de productdetailpagina.

import { useState } from "react";
import { useShop } from "@/components/ShopProvider";

/**
 * @param {Object} props
 * @param {{id:number, name:string, price:number|string, image:string}} props.product
 * @param {string[]} props.sizes - Alleen maten die op voorraad zijn (bijv. ["S","M","L"])
 */
export default function AddToCartForm({ product, sizes }) {
    const { addToCart } = useShop();

    // Lokale state: wat er nu in dít formulier is ingevuld
    const [size, setSize] = useState("");           // gekozen maat ("" = nog niks)
    const [customName, setCustomName] = useState(""); // naam op het shirt
    const [qty, setQty] = useState(1);               // aantal
    const [added, setAdded] = useState(false);       // net toegevoegd? (voor de knoptekst)

    /** Wordt aangeroepen bij klikken op "In mand". */
    function handleSubmit(e) {
        e.preventDefault(); // voorkom dat de browser de pagina herlaadt
        if (!size) return;  // geen maat gekozen -> niks doen (select is ook 'required')

        addToCart(product, size, customName.trim(), Math.max(1, qty));

        // Knop verandert 1,5 seconde in "✓ Toegevoegd" als bevestiging
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                {/* Maat kiezen (F5) — alleen maten met voorraad staan erin */}
                <select
                    className="input"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    required
                >
                    <option value="">Kies maat</option>
                    {sizes.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                {/* Naam op het shirt (F6), mag leeg blijven */}
                <input
                    className="input"
                    type="text"
                    maxLength={30}
                    placeholder="Naam op shirt (optioneel)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                />

                {/* Aantal */}
                <input
                    className="input qty"
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                />

                {/* Toevoegen aan de mand (F7) */}
                <button className="btn" type="submit">
                    {added ? "✓ Toegevoegd" : "In mand"}
                </button>
            </div>
        </form>
    );
}
