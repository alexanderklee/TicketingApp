import buildClient from '../api/build-client';

// this is a react component, not a js function (browser)
// no state can be set whle in component space
const LandingPage = ( { currentUser }) => {
    return currentUser ? <h1>You are signed in!</h1> : <h1>You are NOT signed in</h1>
};

// get initial prop is a regular js function and use axios here
// also need to get nginx url for cross domain access
// note: getInitialProps can get invoked on client when user
//       navigating from one page to antoher while in the app.
//       (eg., signin process   --> landing page)
LandingPage.getInitialProps = async (context) => {
    console.log('LANDING PAGE');
    const { data } = await buildClient(context).get('/api/users/currentuser')
    return data;
};

export default LandingPage;