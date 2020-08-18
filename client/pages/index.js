import Link from 'next/link';

//import buildClient from '../api/build-client';


// this is a react component, not a js function (browser)
// no state can be set whle in component space
const LandingPage = ({ currentUser, tickets }) => {
    // helper function to make JSX section look cleaner
    const ticketList = tickets.map((ticket) => {
        return (
            <tr key={ticket.id}>
                <td>{ticket.title}</td>
                <td>{ticket.price}</td>
                <td>
                    <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                    <a>View</a>
                    </Link>
                </td>
            </tr>
        );
    });

    return (
        <div>
            <h1>Available Tickets</h1>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    );
};

// get initial prop is a regular js function and use axios here
// also need to get nginx url for cross domain access
// note: getInitialProps can get invoked on client when user
//       navigating from one page to antoher while in the app.
//       (eg., signin process   --> landing page)
LandingPage.getInitialProps = async (context, client, currentUser) => {
    const { data } = await client.get('/api/tickets');
    return { tickets: data };
};

export default LandingPage;