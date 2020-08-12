import { Subjects, Publisher, OrderCancelledEvent } from '@goosenest/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}