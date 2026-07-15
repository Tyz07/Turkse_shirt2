// ============================================================
// api/orders/route.js — de API die bestellingen opslaat (F9, F13)
// ============================================================
// Dit is een Next.js "route handler": omdat dit bestand route.js
// heet en een functie POST exporteert, kan de browser er JSON
// naartoe sturen via POST /api/orders (dat doet checkout/page.js).
//
// Belangrijkste principe hier: VERTROUW DE BROWSER NOOIT.
// De client stuurt alleen product-id's, maten en aantallen mee.
// Prijzen, namen en de korting zoeken we hier zélf op — anders
// zou iemand met de browser-devtools zijn eigen prijs kunnen bepalen.

import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { DISCOUNT_CODES } from "@/lib/discounts";

/**
 * Genereert een uniek ordernummer, bijv. "TVS-20260715-8K3F9Q".
 * Opbouw: TVS (Turkse VoetbalShop) + datum + 6 willekeurige tekens.
 * @returns {string}
 */
function generateOrderNumber() {
    const now = new Date();
    const date =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") + // +1 want januari = 0
        String(now.getDate()).padStart(2, "0");
    // Math.random als 0.x36y... -> in base-36 (cijfers+letters) -> 6 tekens
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TVS-${date}-${random}`;
}

export async function POST(req) {
    // ---- Stap 1: JSON uit de request lezen ----
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
    }

    const customer = body.customer ?? {};
    const items = Array.isArray(body.items) ? body.items : [];
    const discountCode = (body.discountCode ?? "").trim().toUpperCase();

    // ---- Stap 2: controleren of alle verplichte velden ingevuld zijn ----
    const required = ["first_name", "last_name", "email", "address", "postal_code", "city", "country"];
    for (const field of required) {
        if (!customer[field] || !String(customer[field]).trim()) {
            // status 400 = "bad request": de fout ligt bij de invoer
            return NextResponse.json(
                { error: "Vul a.u.b. alle verplichte velden in." },
                { status: 400 }
            );
        }
    }

    if (items.length === 0) {
        return NextResponse.json({ error: "Je winkelmand is leeg." }, { status: 400 });
    }

    // ---- Stap 3: kortingscode server-side her-controleren (F11) ----
    let discountPercent = 0;
    if (discountCode) {
        if (!DISCOUNT_CODES[discountCode]) {
            return NextResponse.json({ error: "Ongeldige kortingscode." }, { status: 400 });
        }
        discountPercent = DISCOUNT_CODES[discountCode];
    }

    // Eén vaste verbinding uit de pool pakken: nodig voor een transactie
    // (alle queries van de transactie moeten over dezelfde verbinding gaan)
    const conn = await pool.getConnection();
    try {
        // ---- Stap 4: actuele prijzen en namen uit de database halen ----
        // Set haalt dubbele id's weg (2x hetzelfde shirt in andere maat)
        const ids = [...new Set(items.map((it) => Number(it.id)))];
        const [products] = await conn.query(
            "SELECT id, name, price FROM products WHERE id IN (?)",
            [ids]
        );
        // Van lijst naar opzoek-object: { 1: {id:1, name:..., price:...}, ... }
        const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

        // ---- Stap 5: orderregels opbouwen en totaal berekenen ----
        let originalTotal = 0;
        const orderItems = [];

        for (const it of items) {
            const product = productMap[Number(it.id)];
            const qty = Math.max(1, Number(it.qty) || 1); // minstens 1, nooit NaN

            if (!product) {
                return NextResponse.json(
                    { error: "Een product in je mand bestaat niet meer." },
                    { status: 400 }
                );
            }

            const unitPrice = Number(product.price); // prijs uit de DATABASE
            const subtotal = unitPrice * qty;
            originalTotal += subtotal;

            orderItems.push({
                productId: product.id,
                name: product.name,
                size: String(it.size),
                customName: String(it.customName ?? "").slice(0, 30), // max 30 tekens
                qty,
                unitPrice,
                subtotal,
            });
        }

        const discountAmount = originalTotal * discountPercent;
        const total = originalTotal - discountAmount;
        const orderNumber = generateOrderNumber();

        // ---- Stap 6: alles opslaan in één transactie ----
        // Transactie = alles-of-niets. Gaat er halverwege iets mis,
        // dan draait rollback() álles terug en staat er geen halve
        // bestelling in de database.
        await conn.beginTransaction();

        // De order zelf (klantgegevens + totaal)
        const [orderResult] = await conn.query(
            `INSERT INTO orders
             (order_number, first_name, last_name, email, address, postal_code, city, country, total, discount_code, discount_percent)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNumber,
                String(customer.first_name).trim(),
                String(customer.last_name).trim(),
                String(customer.email).trim(),
                String(customer.address).trim(),
                String(customer.postal_code).trim(),
                String(customer.city).trim(),
                String(customer.country).trim(),
                total,
                discountCode || null, // leeg -> NULL in de database
                discountPercent,
            ]
        );
        // Het automatisch toegekende id van de zojuist ingevoegde order
        const orderId = orderResult.insertId;

        // Per mand-regel: orderregel opslaan + voorraad afboeken
        for (const it of orderItems) {
            await conn.query(
                `INSERT INTO order_items
                 (order_id, product_id, size, custom_name, quantity, unit_price)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, it.productId, it.size, it.customName || null, it.qty, it.unitPrice]
            );

            // GREATEST(x, 0) zorgt dat de voorraad nooit onder nul komt
            await conn.query(
                `UPDATE product_variants
                 SET stock = GREATEST(stock - ?, 0)
                 WHERE product_id = ? AND size = ?`,
                [it.qty, it.productId, it.size]
            );
        }

        // Alles gelukt -> definitief maken
        await conn.commit();

        // ---- Stap 7: bevestiging terugsturen naar de browser (F13) ----
        return NextResponse.json({
            orderNumber,
            originalTotal,
            discountAmount,
            total,
            items: orderItems,
        });
    } catch (err) {
        // Er ging iets mis -> transactie terugdraaien
        await conn.rollback();
        console.error("Bestelling opslaan mislukt:", err);
        // status 500 = "server error": de fout ligt bij ons, niet bij de klant
        return NextResponse.json(
            { error: "Er ging iets mis bij het opslaan van je bestelling." },
            { status: 500 }
        );
    } finally {
        // Verbinding altijd teruggeven aan de pool, ook na een fout
        conn.release();
    }
}
