import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async (done) => {
    // create a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: 'foo',
    });

    // save the ticket to db (init v = 0)
    await ticket.save();

    // fetch the same ticket twice and store ticket in differnet obj
    const firstInstance = await Ticket.findById(ticket.id);
    const secondInstance = await Ticket.findById(ticket.id);

    // make two changes to the fetched tickets to ensure both
    // ticket objects have different versions
    firstInstance!.set({ price: 100 });
    secondInstance!.set({ price: 500 });

    // save the first fetched ticket, mongoose incrementing
    // version
    await firstInstance!.save();

    // save the second fetched ticket and this should fail w/
    // incorrect version

    // Note: expect doesn't work with Jest. Errors with 
    //       unhandled error.
    // expect(async () => {
    //     await secondInstance!.save();
    // }).toThrow();
    
    // workaround: use try/catch instead and return done back to jest so it
    // can work properly. 
    try {
        await secondInstance!.save();
    } catch (err) {
        return done();
    }

    throw new Error('Should not reach this');
});

it('increments the version number on multiple saves', async() => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: 'foobar',
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);

});