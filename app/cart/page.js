"use client";
// ============================================================
// cart/page.js — de winkelmand
// ============================================================
// Hier kan de gebruiker:
//   - aantallen aanpassen (0 invullen = regel verwijderen)
//   - een regel direct verwijderen met de knop (F8)
//   - een kortingscode toepassen (F11): KORTING10 of KORTING20
// De mand zelf leeft in ShopProvider (browser/localStorage);
// deze pagina toont hem alleen en roept de functies aan.

import { useState } from "react";
import Link from "next/link";
import { useShop } from "@/components/ShopProvider";
import Price from "@/components/Price";

export default function CartPage() {
    const {
        cart, cartTotal, updateQty, removeFromCart,
        discount, applyDiscount,
    } = useShop();

    // Lokale state voor het kortingscode-formulier
    const [code, setCode] = useState(discount?.code ?? ""); // ingevulde code
    const [message, setMessage] = useState("");             // ✅ of ❌ melding

    // Bedragen uitrekenen (percent is bijv. 0.10 voor 10%)
    const discountAmount = discount ? cartTotal * discount.percent : 0;
    const newTotal = cartTotal - discountAmount;

    /** Klik op "Toepassen": kortingscode checken (F11). */
    function handleDiscount(e) {
        e.preventDefault(); // geen pagina-herlaad
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
                // Lege mand
                <>
                    <p className="empty">Leeg</p>
                    <Link className="btn" href="/">Verder winkelen</Link>
                </>
            ) : (
                <>
                    {/* Eén rij per mand-regel */}
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
                                        {/* Bedrukking alleen tonen als die er is */}
                                        {it.customName && <> — {it.customName}</>}
                                    </td>
                                    <td><Price amount={it.price} /></td>
                                    <td>
                                        {/* Aantal aanpassen; 0 = regel verwijderen */}
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
                                        {/* Regel verwijderen (F8) */}
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

                    {/* Kortingscode-formulier (F11) */}
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

                    {/* Totaal; de kortingsregels alleen tonen als er korting is */}
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
