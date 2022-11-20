
import './App.css';
// import { Form, Button } from "react-bootstrap";
import { useState } from 'react';

import "./styles.css";

let BASE_URL = "http://localhost:5000";

function App() {

    // const [errorMessages, setErrorMessages] = useState({});
    // const [isSubmitted, setIsSubmitted] = useState(false);
    // const loggedIn = localStorage.getItem("access_token") == null;
    const [token, setToken] = useState(0)
    const [text, setText] = useState({ text: "", color: "black" })
    const [loggedIn, setLoggedIn] = useState(false) // { token } != null ? true : false

    console.log("access_token: ", token)
    console.log("logged in: ", loggedIn)

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log(event);

        // Prevent page reload
        const email_value = event.target.name.value
        const password_value = event.target.password.value

        const info = {
            email: email_value,
            password: password_value
        }

        try {
            await fetch(BASE_URL + "/login",
                {
                    method: "POST",
                    body: JSON.stringify(info),
                    headers: {
                        "Content-Type": "application/json;charset=UTF-8",
                        "Accept": "application/json"
                    }
                })
                .then((response) => {
                    const statusCode = response.status;
                    const data = response.json();
                    return Promise.all([statusCode, data]);
                })
                .then((data) => {
                    data = data[1];
                    if (data.access_token) {
                        setToken(data.access_token); // Temp!
                        localStorage.setItem("access_token", data.access_token);
                        setText({
                            text: "Sucessfully logged in!",
                            color: "green"
                        });
                        setLoggedIn(true);
                    } else {
                        setText({
                            text: "Incorrect email or password",
                            color: "red"
                        });
                    }

                });
        } catch (err) {
            console.error(err);
        }


    };

    const fetchData = async (url) => {
        let token = localStorage.getItem("access_token");
        try {
            return fetch(url, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json;charset=UTF-8",
                    "Accept": "application/json",
                    "Authorization": "Bearer " + token
                }
            }).then((response) => {
                const statusCode = response.status;
                const data = response.json();
                return Promise.all([statusCode, data]);
            });
        }
        catch (err) {
            console.error(err);
        }
    }
            
                    
    const handleProfileClick = (event) => {

        event.preventDefault();

        try {
            fetch(BASE_URL + "/profile",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json;charset=UTF-8",
                        "Accept": "application/json",
                        "Authorization": "Bearer " + token
                    }
                    if (json.about) {
                        setText({ text: "HEJ", color: "black" })
                    }

                });
        } catch (err) {
            console.error(err);
            setToken(0);
        }


    };

    const handleLogout = (event) => {
        event.preventDefault();

        try {
            fetch(BASE_URL + "/logout",
                {
                    method: "POST",
                    headers: {
                        "Authorization": "Bearer " + token
                    }
                })
                .then((response) => {
                    const statusCode = response.status;
                    const data = response.json();
                    return Promise.all([statusCode, data]);
                })
                .then((data) => {
                    console.log(data)
                    localStorage.removeItem("access_token");
                    setToken(0);
                    setText({
                        text: "Succesfully logged out!",
                        color: "green"
                    })
                    setLoggedIn(false)
                })
        } catch (err) {
            console.log(err);
        }
    };

    const RenderLoggedInState = () => {
        return <div>
            <h1>You are logged in!</h1>
            <button onClick={handleProfileClick}>Profile</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    }

    const renderLoginForm = () => {
        return <div className="login-form">
            <div className="form">
                <div className="title">Sign In</div>
                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <label>Username </label>
                        <input type="text" name="name" />
                    </div>
                    <div className="input-container">
                        <label>Password</label>
                        <input type="password" name="password" />
                    </div>
                    <div className="button-container">
                        <input type="submit" value="Login" />
                    </div>
                </form>
            </div>
            <div>
                <h5>Do you have an invitation code? If so, signup here!</h5>
            </div>
        </div>
    }

    return (<div className="app">
        {token === 0 ? renderLoginForm() : RenderLoggedInState()}
        {text.text}
    </div>);
}

export default App;


