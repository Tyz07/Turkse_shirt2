"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DISCOUNT_CODES } from "@/lib/discounts";

// Globale winkel-state: valuta, winkelmand, verlanglijst en korting.
// Alles wordt bewaard in localStorage zodat het blijft staan na een refresh.
const ShopContext = createContext(null);

const STORAGE_KEY = "voetbalshop2";

export function ShopProvider({ children }) {
    const [currency, setCurrency] = useState("EUR");
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [discount, setDiscount] = useState(null); // { code, percent }
    const [loaded, setLoaded] = useState(false);

    // Opgeslagen state inladen (pas na eerste render, i.v.m. server-side rendering)
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            if (saved.currency) setCurrency(saved.currency);
            if (Array.isArray(saved.cart)) setCart(saved.cart);
            if (Array.isArray(saved.wishlist)) setWishlist(saved.wishlist);
            if (saved.discount) setDiscount(saved.discount);
        } catch {
            // corrupte data negeren
        }
        setLoaded(true);
    }, []);

    // Elke wijziging opslaan
    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ currency, cart, wishlist, discount })
        );
    }, [loaded, currency, cart, wishlist, discount]);

    // ---- Winkelmand (F7, F8) ----
    // Zelfde product + maat + bedrukking = één regel, aantal opgeteld.
    function addToCart(product, size, customName, qty) {
        const key = `${product.id}|${size}|${customName}`;
        setCart((prev) => {
            const existing = prev.find((it) => it.key === key);
            if (existing) {
                return prev.map((it) =>
                    it.key === key ? { ...it, qty: it.qty + qty } : it
                );
            }
            return [
                ...prev,
                {
                    key,
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image,
                    size,
                    customName,
                    qty,
                },
            ];
        });
    }

    function removeFromCart(key) {
        setCart((prev) => prev.filter((it) => it.key !== key));
    }

    function updateQty(key, qty) {
        if (qty <= 0) {
            removeFromCart(key);
            return;
        }
        setCart((prev) =>
            prev.map((it) => (it.key === key ? { ...it, qty } : it))
        );
    }

    function clearCart() {
        setCart([]);
        setDiscount(null);
    }

    // ---- Verlanglijst (F12) ----
    function toggleWishlist(product) {
        setWishlist((prev) => {
            if (prev.some((p) => p.id === product.id)) {
                return prev.filter((p) => p.id !== product.id);
            }
            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image,
                    club: product.club,
                },
            ];
        });
    }

    function inWishlist(productId) {
        return wishlist.some((p) => p.id === productId);
    }

    // ---- Kortingscode (F11) ----
    // Geeft true terug als de code geldig is.
    function applyDiscount(code) {
        const normalized = code.trim().toUpperCase();
        if (DISCOUNT_CODES[normalized]) {
            setDiscount({ code: normalized, percent: DISCOUNT_CODES[normalized] });
            return true;
        }
        setDiscount(null);
        return false;
    }

    const cartTotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
    const cartCount = cart.reduce((sum, it) => sum + it.qty, 0);

    return (
        <ShopContext.Provider
            value={{
                currency,
                setCurrency,
                cart,
                cartTotal,
                cartCount,
                addToCart,
                removeFromCart,
                updateQty,
                clearCart,
                wishlist,
                toggleWishlist,
                inWishlist,
                discount,
                applyDiscount,
            }}
        >
            {children}
        </ShopContext.Provider>
    );
}

export function useShop() {
    return useContext(ShopContext);
}
