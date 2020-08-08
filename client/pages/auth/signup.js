import { useState } from 'react';
import Router from 'next/router';
import useRequest from '../../hooks/use-request';

export default () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { doRequest, errors } = useRequest({
        url: '/api/users/signup',
        method: 'post',
        body: {
            email, password
        },
        onSuccess: () => Router.push('/')
    });
    //const [errors, setErrors] = useState([]);

    const onSubmit = async event => {
        // Prevent page from self-submitting
        event.preventDefault();
        doRequest();
    };

    return (
    <form onSubmit={onSubmit}>
        <h1> Sign Up</h1>
        <div className="form-group">
            <label>Email Address</label>
            <input value={email} onChange={event => setEmail(event.target.value)} 
            className="form-control" 
            />
        </div>
        <div className="form-group">
            <label>Password</label>
            <input value={password} onChange={event => setPassword(event.target.value)}
            type="password" className="form-control" 
            />
        </div>
        {errors}
        <button className="btn btn-primary">Sign Up</button>
    </form>
    );
};