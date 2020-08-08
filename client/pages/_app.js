import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

// NOTE: By defining getInitialProps in App Component, the get
// initialProps in the pages components does not get
// called automatically.

// using bootstrap CSS as the global CSS for the app
// This will force Next to pass its generated pages
// through this global CSS 
const AppComponent = ({ Component, pageProps, currentUser}) => {
    return  (
        <div>
            <Header currentUser={currentUser}/>
            <Component {...pageProps} />
        </div>
    );
};

AppComponent.getInitialProps = async appContext => {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentuser');

    // Calling page getInitialProp here
    let pageProps = {};
    if(appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx);
    }

    return {
        pageProps,
        currentUser: data.currentUser
    }
};

export default AppComponent;