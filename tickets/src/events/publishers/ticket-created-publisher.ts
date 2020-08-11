import { Publisher, Subjects, TicketCreatedEvent } from '@goosenest/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    // assigning type and value to subject to avoid modification else
    // where in the code. 
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}