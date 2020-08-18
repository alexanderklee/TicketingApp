import axios from 'axios';

// send requests to ingress controller
// http://SERVICENAME.NAMESPACE.svc.cluster.local (format)
// http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/<route path>
// kubectl get namespace
// kubectl get services -n ingress-nginx (LoadBalancer)

const Named = ({ req }) => {
    if (typeof window === 'undefined') {
        // we are on server
        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });
    }   else {
            // we are on browser. assume browser will attach
            // base URL
            return axios.create({
                baseURL: '/'
            });
        }
};

export default Named;