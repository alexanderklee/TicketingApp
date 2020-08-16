import { Subjects, Publisher, PaymentCreatedEvent } from '@goosenest/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}