"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    // When order has been created but ticket has not been reserved
    // or paid for
    OrderStatus["Created"] = "created";
    // When the ticket is *trying* to be reserved or when the user
    // cancelled the order. 
    // The order expires before payment (timer)
    OrderStatus["Cancelled"] = "cancelled";
    // When the order has successfully reserved the ticket
    OrderStatus["AwaitingPayment"] = "awaiting:payment";
    // The order was reserved and the user paid for the ticket
    // successfully
    OrderStatus["Complete"] = "complete";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
