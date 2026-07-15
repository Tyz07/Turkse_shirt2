"use client";
// ============================================================
// Price.js — toont een bedrag in de gekozen valuta (F10)
// ============================================================
// Klein maar belangrijk component: overal waar een prijs staat
// gebruiken we <Price amount={...} /> in plaats van het bedrag
// direct te printen. Zo schakelt élke prijs automatisch mee
// wanneer de gebruiker in de header op € of ₺ klikt.

import { useShop } from "@/components/ShopProvider";
import { formatPrice } from "@/lib/money";

/**
 * @param {{ amount: number|string }} props - Het bedrag in euro's
 */
export default function Price({ amount }) {
    const { currency } = useShop(); // huidige valuta uit de globale state
    return <>{formatPrice(Number(amount), currency)}</>;
}
