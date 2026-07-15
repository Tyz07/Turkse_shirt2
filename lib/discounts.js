// ============================================================
// discounts.js — de geldige kortingscodes van de shop
// ============================================================
// Dit bestand wordt op twee plekken gebruikt:
//   1. In de winkelmand (client): om de code direct te checken (F11)
//   2. In de order-API (server): om de code nog een keer te
//      controleren voordat de bestelling wordt opgeslagen.
//      (waarden uit de browser vertrouw je nooit zomaar!)

/**
 * Geldige kortingscodes: code => kortingspercentage.
 * 0.10 betekent 10% korting, 0.20 betekent 20%.
 *
 * Nieuwe code toevoegen? Gewoon een regel erbij zetten, bijv.:
 *   ZOMER15: 0.15,
 *
 * @type {Record<string, number>}
 */
export const DISCOUNT_CODES = {
    KORTING10: 0.1,
    KORTING20: 0.2,
};
