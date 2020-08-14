import { Subjects, Publisher, ExpirationCompleteEvent } from '@goosenest/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete  = Subjects.ExpirationComplete;
}