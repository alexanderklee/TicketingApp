import 'bootstrap/dist/css/bootstrap.css';

// using bootstrap CSS as the global CSS for the app
// This will force Next to pass its generated pages
// through this global CSS 
export default ({ Component, pageProps}) => {
    return <Component {...pageProps} />
};
