import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { DISCOUNT_CODES } from "@/lib/discounts";

// Genereert een uniek ordernummer, bijv. TVS-20260715-8K3F9Q
function generateOrderNumber() {
    const now = new Date();
    const date =
        now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0");
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TVS-${date}-${random}`;
}

// POST /api/orders — plaatst een bestelling (F9) en geeft ordernummer terug (F13)
export async function POST(req) {
    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Ongeldige aanvraag." }, { status: 400 });
    }

    const customer = body.customer ?? {};
    const items = Array.isArray(body.items) ? body.items : [];
    const discountCode = (body.discountCode ?? "").trim().toUpperCase();

    // Verplichte klantvelden controleren
    const required = ["first_name", "last_name", "email", "address", "postal_code", "city", "country"];
    for (const field of required) {
        if (!customer[field] || !String(customer[field]).trim()) {
            return NextResponse.json(
                { error: "Vul a.u.b. alle verplichte velden in." },
                { status: 400 }
            );
        }
    }

    if (items.length === 0) {
        return NextResponse.json({ error: "Je winkelmand is leeg." }, { status: 400 });
    }

    // Kortingscode opnieuw controleren op de server (client-waarde nooit vertrouwen)
    let discountPercent = 0;
    if (discountCode) {
        if (!DISCOUNT_CODES[discountCode]) {
            return NextResponse.json({ error: "Ongeldige kortingscode." }, { status: 400 });
        }
        discountPercent = DISCOUNT_CODES[discountCode];
    }

    const conn = await pool.getConnection();
    try {
        // Actuele prijzen en namen uit de database halen (niet uit de client)
        const ids = [...new Set(items.map((it) => Number(it.id)))];
        const [products] = await conn.query(
            "SELECT id, name, price FROM products WHERE id IN (?)",
            [ids]
        );
        const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

        let originalTotal = 0;
        const orderItems = [];

        for (const it of items) {
            const product = productMap[Number(it.id)];
            const qty = Math.max(1, Number(it.qty) || 1);

            if (!product) {
                return NextResponse.json(
                    { error: "Een product in je mand bestaat niet meer." },
                    { status: 400 }
                );
            }

            const unitPrice = Number(product.price);
            const subtotal = unitPrice * qty;
            originalTotal += subtotal;

            orderItems.push({
                productId: product.id,
                name: product.name,
                size: String(it.size),
                customName: String(it.customName ?? "").slice(0, 30),
                qty,
                unitPrice,
                subtotal,
            });
        }

        const discountAmount = originalTotal * discountPercent;
        const total = originalTotal - discountAmount;
        const orderNumber = generateOrderNumber();

        // Order + orderregels in één transactie opslaan
        await conn.beginTransaction();

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
                discountCode || null,
                discountPercent,
            ]
        );
        const orderId = orderResult.insertId;

        for (const it of orderItems) {
            await conn.query(
                `INSERT INTO order_items
                 (order_id, product_id, size, custom_name, quantity, unit_price)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [orderId, it.productId, it.size, it.customName || null, it.qty, it.unitPrice]
            );

            // Voorraad afboeken (niet onder nul)
            await conn.query(
                `UPDATE product_variants
                 SET stock = GREATEST(stock - ?, 0)
                 WHERE product_id = ? AND size = ?`,
                [it.qty, it.productId, it.size]
            );
        }

        await conn.commit();

        return NextResponse.json({
            orderNumber,
            originalTotal,
            discountAmount,
            total,
            items: orderItems,
        });
    } catch (err) {
        await conn.rollback();
        console.error("Bestelling opslaan mislukt:", err);
        return NextResponse.json(
            { error: "Er ging iets mis bij het opslaan van je bestelling." },
            { status: 500 }
        );
    } finally {
        conn.release();
    }
}
