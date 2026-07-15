"use client";
// ============================================================
// ShopProvider.js — de globale "winkel-state" van de hele app
// ============================================================
// Dit is het hart van de webshop aan de client-kant. Hier leven:
//   - de gekozen valuta (EUR of TRY)          -> F10
//   - de winkelmand                            -> F7, F8
//   - de verlanglijst                          -> F12
//   - de toegepaste kortingscode               -> F11
//
// Hoe werkt het?
//   React Context = een soort "globale variabele" voor componenten.
//   Elke component kan met useShop() bij deze data en functies.
//   Alles wordt óók opgeslagen in localStorage (opslag in de browser),
//   zodat de mand blijft staan na een refresh of het sluiten van de tab.
//
// "use client" bovenaan betekent: dit component draait in de browser
// (nodig voor useState/useEffect en localStorage).

import { createContext, useContext, useEffect, useState } from "react";
import { DISCOUNT_CODES } from "@/lib/discounts";

/**
 * Eén regel in de winkelmand.
 * @typedef {Object} CartItem
 * @property {string} key        - Unieke sleutel: "productId|maat|bedrukking"
 * @property {number} id         - Product-id uit de database
 * @property {string} name       - Productnaam (bijv. "Galatasaray Thuisshirt 24/25")
 * @property {number} price      - Prijs per stuk in euro's
 * @property {string} image      - Bestandsnaam van de foto (bijv. "galatasaray.png")
 * @property {string} size       - Gekozen maat (S t/m XXL)
 * @property {string} customName - Naam op het shirt (leeg = geen bedrukking)
 * @property {number} qty        - Aantal
 */

/**
 * Een product op de verlanglijst (compacter dan een CartItem).
 * @typedef {Object} WishlistItem
 * @property {number} id
 * @property {string} name
 * @property {number} price
 * @property {string} image
 * @property {string} club
 */

// De context zelf. Componenten lezen hem via useShop() (zie onderaan).
const ShopContext = createContext(null);

// De sleutel waaronder alles in localStorage wordt bewaard
const STORAGE_KEY = "voetbalshop2";

export function ShopProvider({ children }) {
    // ---- Alle state van de winkel ----
    const [currency, setCurrency] = useState("EUR");   // "EUR" of "TRY"
    const [cart, setCart] = useState([]);               // CartItem[]
    const [wishlist, setWishlist] = useState([]);       // WishlistItem[]
    const [discount, setDiscount] = useState(null);     // { code, percent } of null
    const [loaded, setLoaded] = useState(false);        // true zodra localStorage is ingelezen

    // ---- Opgeslagen state inladen bij het openen van de site ----
    // Dit gebeurt in een useEffect (dus pas ná de eerste render), omdat
    // de server geen localStorage heeft. Zou je het eerder doen, dan
    // krijg je een "hydration mismatch"-fout van React.
    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
            if (saved.currency) setCurrency(saved.currency);
            if (Array.isArray(saved.cart)) setCart(saved.cart);
            if (Array.isArray(saved.wishlist)) setWishlist(saved.wishlist);
            if (saved.discount) setDiscount(saved.discount);
        } catch {
            // corrupte data in localStorage? Dan gewoon met een lege winkel starten
        }
        setLoaded(true);
    }, []);

    // ---- Elke wijziging meteen opslaan in localStorage ----
    // De array [loaded, currency, cart, ...] betekent: draai dit effect
    // opnieuw zodra één van deze waarden verandert.
    useEffect(() => {
        if (!loaded) return; // niet opslaan vóórdat we geladen hebben (anders overschrijf je alles met leeg)
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ currency, cart, wishlist, discount })
        );
    }, [loaded, currency, cart, wishlist, discount]);

    // ============================================================
    // Winkelmand (F7 toevoegen, F8 verwijderen)
    // ============================================================

    /**
     * Product toevoegen aan de mand (F7).
     * Zelfde product + zelfde maat + zelfde bedrukking = één regel,
     * daarvan wordt alleen het aantal opgehoogd.
     *
     * @param {{id:number, name:string, price:number|string, image:string}} product
     * @param {string} size       - Gekozen maat
     * @param {string} customName - Naam op het shirt ("" = geen)
     * @param {number} qty        - Aantal om toe te voegen
     */
    function addToCart(product, size, customName, qty) {
        const key = `${product.id}|${size}|${customName}`;
        setCart((prev) => {
            const existing = prev.find((it) => it.key === key);
            if (existing) {
                // Regel bestaat al -> alleen het aantal verhogen
                return prev.map((it) =>
                    it.key === key ? { ...it, qty: it.qty + qty } : it
                );
            }
            // Nieuwe regel achteraan toevoegen
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

    /**
     * Eén regel uit de mand verwijderen (F8).
     * @param {string} key - De unieke sleutel van de regel
     */
    function removeFromCart(key) {
        setCart((prev) => prev.filter((it) => it.key !== key));
    }

    /**
     * Aantal van een regel aanpassen. Aantal 0 of lager = regel weg.
     * @param {string} key
     * @param {number} qty
     */
    function updateQty(key, qty) {
        if (qty <= 0) {
            removeFromCart(key);
            return;
        }
        setCart((prev) =>
            prev.map((it) => (it.key === key ? { ...it, qty } : it))
        );
    }

    /** Mand + korting leegmaken (na een geslaagde bestelling). */
    function clearCart() {
        setCart([]);
        setDiscount(null);
    }

    // ============================================================
    // Verlanglijst (F12)
    // ============================================================

    /**
     * Product aan de verlanglijst toevoegen, of eraf halen als het
     * er al op staat (daarom heet het "toggle").
     * @param {{id:number, name:string, price:number|string, image:string, club:string}} product
     */
    function toggleWishlist(product) {
        setWishlist((prev) => {
            if (prev.some((p) => p.id === product.id)) {
                return prev.filter((p) => p.id !== product.id); // stond erop -> eraf
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

    /**
     * Staat dit product op de verlanglijst? (voor het rode hartje)
     * @param {number} productId
     * @returns {boolean}
     */
    function inWishlist(productId) {
        return wishlist.some((p) => p.id === productId);
    }

    // ============================================================
    // Kortingscode (F11)
    // ============================================================

    /**
     * Kortingscode proberen toe te passen.
     * @param {string} code - Wat de gebruiker intypte (hoofdletters maakt niet uit)
     * @returns {boolean} true als de code geldig was
     */
    function applyDiscount(code) {
        const normalized = code.trim().toUpperCase();
        if (DISCOUNT_CODES[normalized]) {
            setDiscount({ code: normalized, percent: DISCOUNT_CODES[normalized] });
            return true;
        }
        setDiscount(null); // ongeldige code -> eventuele oude korting ook weg
        return false;
    }

    // ---- Afgeleide waarden (worden elke render opnieuw berekend) ----
    // reduce = loop over de array en tel alles bij elkaar op
    const cartTotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0); // totaal in euro's
    const cartCount = cart.reduce((sum, it) => sum + it.qty, 0);            // totaal aantal stuks

    // Alles wat componenten via useShop() kunnen gebruiken:
    return (
        <ShopContext.Provider
            value={{
                currency, setCurrency,
                cart, cartTotal, cartCount,
                addToCart, removeFromCart, updateQty, clearCart,
                wishlist, toggleWishlist, inWishlist,
                discount, applyDiscount,
            }}
        >
            {children}
        </ShopContext.Provider>
    );
}

/**
 * Hook om overal bij de winkel-state te kunnen, bijv.:
 *   const { cart, addToCart, currency } = useShop();
 */
export function useShop() {
    return useContext(ShopContext);
}
