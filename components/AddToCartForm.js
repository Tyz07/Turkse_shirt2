"use client";

import { useState } from "react";
import { useShop } from "@/components/ShopProvider";

// Formulier: maat kiezen (F5), naam op shirt (F6), aantal en toevoegen aan mand (F7)
export default function AddToCartForm({ product, sizes }) {
    const { addToCart } = useShop();
    const [size, setSize] = useState("");
    const [customName, setCustomName] = useState("");
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();
        if (!size) return;

        addToCart(product, size, customName.trim(), Math.max(1, qty));

        // korte bevestiging tonen op de knop
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
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

                <input
                    className="input"
                    type="text"
                    maxLength={30}
                    placeholder="Naam op shirt (optioneel)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                />

                <input
                    className="input qty"
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                />

                <button className="btn" type="submit">
                    {added ? "✓ Toegevoegd" : "In mand"}
                </button>
            </div>
        </form>
    );
}
