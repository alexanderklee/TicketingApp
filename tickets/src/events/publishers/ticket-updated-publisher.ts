import { Publisher, Subjects, TicketUpdatedEvent } from '@goosenest/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    // assigning type and value to subject to avoid modification else
    // where in the code. 
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}