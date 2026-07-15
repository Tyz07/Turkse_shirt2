"use client";

import { useShop } from "@/components/ShopProvider";
import { formatPrice } from "@/lib/money";

// Toont een bedrag in de gekozen valuta (F10)
export default function Price({ amount }) {
    const { currency } = useShop();
    return <>{formatPrice(Number(amount), currency)}</>;
}
