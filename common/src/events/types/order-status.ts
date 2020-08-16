export enum OrderStatus {
    // When order has been created but ticket has not been reserved
    // or paid for
    Created = 'created',

    // When the ticket is *trying* to be reserved or when the user
    // cancelled the order. 
    // The order expires before payment (timer)
    Cancelled = 'cancelled',

    // When the order has successfully reserved the ticket
    AwaitingPayment = 'awaiting:payment',

    // The order was reserved and the user paid for the ticket
    // successfully
    Complete = 'complete',
}