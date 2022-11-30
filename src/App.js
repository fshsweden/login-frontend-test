
import './App.css';
import { useEffect, useState } from 'react';
import "./styles.css";

let BASE_URL = "http://localhost:5001";

function App() {

    // token and loggedIn are both used to indicate that you are logged in
    // (loggedIn flag could be removed - but is easy to use and understand)
    const [token, setToken] = useState(null)
    const [loggedIn, setLoggedIn] = useState(false)
    const [text, setText] = useState({ text: "", color: "black" })

    useEffect(() => {

        console.log("useEffect - setting up setInterval()");
        const intervalId = setInterval(() => {

            if (loggedIn) {
                console.log("fetchData /status...");
                fetchData(BASE_URL + "/status").then(([code, data]) => {
                    console.log(code, data);
                    if (code != 200) {
                        console.log("Setting token to null and loggedIn to false");
                        setToken(prevState => null);
                        setLoggedIn(prevState => false);
                    }
                });
            }
            else {
                setText({
                    text: "not loggedIn so doing nothing",
                    color: "red"
                });

                console.log("not loggedIn so doing nothing...");
            }
        }, 5000);

        return () => {
            console.log("Running cleanup function");
            clearInterval(intervalId);
        }
    }, [loggedIn]); // <-- IMPORTANT! this is the dependency array


    /*
        handleSubmit doesn't use fetchData(), because it needs to do some extra non-default handling.
        It is possible to change fetchData() to support /login though
    */
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
            fetch(BASE_URL + "/login",
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
                .then(([statusCode, data]) => {
                    console.log(statusCode);
                    console.log(data);
                    if (data.access_token !== undefined) {
                        let newToken = data.access_token;
                        setToken(prevState => newToken); // Temp!
                        localStorage.setItem("access_token", newToken);

                        setText({
                            text: "Successfully logged in!",
                            color: "green"
                        });

                        setLoggedIn(prevState => true);
                        // setLoggedIn(true);
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

    /*
        fetchData is a generic function that can be used to fetch data from any endpoint.
        It attaches the "token" to the request header, and returns the response.
        It assumes JSON is being used.
    */
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
            }).then(async (response) => {
                // console.log(response);
                const statusCode = await response.status;
                const data = await response.json();
                
                console.log(data);

                // New
                if (data.access_token) {
                    setToken(prevState => data.access_token);
                    console.log("Setting new token:" + data.access_token);
                    localStorage.setItem("access_token", data.access_token);
                }
                else {
                    console.error("data did not contain access_token!");
                }

                return Promise.all([statusCode, data]);
            });
        }
        catch (err) {
            console.error(err);
        }
    }


    /*
        This function is called when the user clicks the "Profile" button.
    */
    const handleProfileClick = (event) => {
        event.preventDefault();
        try {
            fetchData(BASE_URL + "/profile").then(([code, data]) => {
                console.log(data);
                setText({
                    text: data.about,
                    color: "blue"
                });
            });
        } catch (err) {
            console.error(err);
            setToken(null);
        }
    };

    /*
        This function is called when the user clicks the "Logout" button.
    */
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
                    setToken(null);
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

    /*
        This function renders the page when loggedIn
    */
    const RenderLoggedInState = () => {
        return <div>
            <h1>You are logged in!</h1>
            <button onClick={handleProfileClick}>Profile</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    }

    /*
        This function renders the page when not loggedIn. 
        It is the Login Form
    */
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
        </div>
    }

    /*
        Main render function
    */
    return (<div className="app">
        {token === null ? renderLoginForm() : RenderLoggedInState()}
        <p style={{ maxWidth: "300px", wordWrap: "break-word" }}>{token}</p>
        <p style={{ fontSize: 30, color: text.color }}>
            {text.text}
        </p>
    </div>);
}

export default App;


