"use client";

import { useState } from "react";
import Link from "next/link";
import { useShop } from "@/components/ShopProvider";
import Price from "@/components/Price";

// Winkelmand: overzicht, aantal aanpassen, verwijderen (F8) en kortingscode (F11)
export default function CartPage() {
    const {
        cart, cartTotal, updateQty, removeFromCart,
        discount, applyDiscount,
    } = useShop();

    const [code, setCode] = useState(discount?.code ?? "");
    const [message, setMessage] = useState("");

    const discountAmount = discount ? cartTotal * discount.percent : 0;
    const newTotal = cartTotal - discountAmount;

    function handleDiscount(e) {
        e.preventDefault();
        if (applyDiscount(code)) {
            setMessage("✅ Kortingscode toegepast");
        } else {
            setMessage("❌ Ongeldige kortingscode");
        }
    }

    return (
        <div className="box">
            <h2>Winkelmand</h2>

            {cart.length === 0 ? (
                <>
                    <p className="empty">Leeg</p>
                    <Link className="btn" href="/">Verder winkelen</Link>
                </>
            ) : (
                <>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Maat / Naam</th>
                                <th>Prijs</th>
                                <th>Aantal</th>
                                <th>Subtotaal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((it) => (
                                <tr key={it.key}>
                                    <td>{it.name}</td>
                                    <td>
                                        {it.size}
                                        {it.customName && <> — {it.customName}</>}
                                    </td>
                                    <td><Price amount={it.price} /></td>
                                    <td>
                                        <input
                                            className="input qty"
                                            type="number"
                                            min={0}
                                            value={it.qty}
                                            onChange={(e) =>
                                                updateQty(it.key, Number(e.target.value))
                                            }
                                        />
                                    </td>
                                    <td><Price amount={it.price * it.qty} /></td>
                                    <td>
                                        <button
                                            className="btn alt small"
                                            onClick={() => removeFromCart(it.key)}
                                        >
                                            Verwijder
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Kortingscode (KORTING10 / KORTING20) */}
                    <form className="row" onSubmit={handleDiscount} style={{ marginTop: 16 }}>
                        <input
                            className="input"
                            style={{ maxWidth: 220 }}
                            placeholder="Kortingscode"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <button className="btn" type="submit">Toepassen</button>
                        {message && <span className={message.startsWith("❌") ? "error" : ""}>{message}</span>}
                    </form>

                    {/* Totaalbedrag, met kortingsregels als er korting is */}
                    <div className="total">
                        {discount && (
                            <>
                                <p>Origineel: <Price amount={cartTotal} /></p>
                                <p>
                                    Korting ({discount.code}):{" "}
                                    -<Price amount={discountAmount} />
                                </p>
                            </>
                        )}
                        <strong>Totaal: <Price amount={newTotal} /></strong>
                    </div>

                    <div className="row">
                        <Link className="btn alt" href="/">Verder winkelen</Link>
                        <Link className="btn" href="/checkout">Afrekenen</Link>
                    </div>
                </>
            )}
        </div>
    );
}
