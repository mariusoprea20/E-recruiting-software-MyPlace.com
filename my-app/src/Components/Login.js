
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Buffer } from 'buffer';
import EmployerDashboard from './employer/EmployerDashboard.js';
import SeekerDashboard from './jobseeker/SeekerDashboard.js';
import { useNavigate } from 'react-router-dom';
import loginLogo from './loginLogo.png';


function Login(props) {

  //define states to store username and password
  const [userid, setUserID] = useState(0); // store user id
  const [username, setUsername] = useState(""); // store username
  const [password, setPassword] = useState("");// store password
  const [userType, setUserType] = useState(""); // set user type
  const [updated, setUpdated] = useState(0); // update useEffect
  const [firstName, setFirstName] = useState("");//set first name
  const handleUpdate = () => { setUpdated(updated + 1) } // handle update for useEffect
  const token = localStorage.getItem('token'); // get the token when user loggs in
  const [wrMessage, setWrMessage] = useState("");//set wrong cresidential message if details does not exist
  const navigate = useNavigate(); // invoke the navigation hook 


  // reads the token stored in the localStorage 
  //and keeps the user logged in if token is still valid
  useEffect(
    () => {
      if (localStorage.getItem('token')) {
        props.handleAuthenticated(true)
      } else{
        navigate('/')
      }
    }
    , []);


  /**
   * Log in function that sends the username and password in base64 format
   * checked in backend endpoint with Authorisation token that will be decoded
   */
  const handleLogIn = () => {
    const encodedString = Buffer.from(
      username + ":" + password
    ).toString('base64');
    //send the request to the endpoint
    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/authenticate",
      {
        method: 'POST',
        headers: new Headers({ "Authorization": "Basic " + encodedString })
      })
      .then(
        (response) => {
          return response.json()
        }
      )
      .then(
        (json) => {
          //if successfully connected
          if (json.message === "success") {
            setUserID(json.dbdata[0].user_id); // set userid
            setFirstName(json.dbdata[0].firstName);//set fistname
            props.handleUserType(json.dbdata[0].user_type);//set usertype
            //authenticate the user and pass it back to app.js
            props.handleAuthenticated(true);
            //store the token in the localStorage
            localStorage.setItem('token', json.data.token);
            handleUpdate(); // update useEffect
            setWrMessage("") // display wrong cresidential message
          } else {
            // if username or password do not match in the backend, display wrong message
            setWrMessage("Wrong username or password!")
          }
        }
      )
      .catch(
        (e) => {
          console.log(e.message)
        }
      )
  }
  /**
   * if token is stored, retrieve same details from the endpoint.
   * This useEffect is needed to load the data each time the website is reloaded and user is logged in
   */
  useEffect(
    () => {
      if (localStorage.getItem('token')) {
        props.handleAuthenticated(true);

        //access the endpoing by sending the bearer token and formData through headers
        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/userauth",
          {
            //set the method
            method: 'POST',
            //set the bearer token
            headers: new Headers({ "Authorization": "Bearer " + token })
          })
          .then(
            (response) => response.json()
          )
          .then(
            (json) => {
              if (json.message === "success") {
                setUserID(json.data[0].user_id);
                setUserType(json.data[0].user_type);
                setFirstName(json.data[0].firstName);
                props.handleUserType(json.data[0].user_type);
              }
            })
          .catch(
            (e) => {
              console.log(e.message)
            })
      }
    }
    , [updated]);

  //reads username from keyboard
  const handleUsername = (event) => {
    setUsername(event.target.value);
  }
  //reads pasword from keyboard
  const handlePassword = (event) => {
    setPassword(event.target.value);
  }
  //log out the user
  const handleLogOut = () => {
    props.handleAuthenticated(false);
    localStorage.removeItem('token');
    setUsername("");
    setPassword("");
  }


  return (
    <div >
      {/**use conditional rendering give or deny access to the user */}
      {/**display dashboard related to the user type that logged in */}
      {props.authenticated && userType === "employer" && <div>
        <EmployerDashboard handleLogOut={handleLogOut} userid={userid} firstName={firstName} />
      </div>}
      {/**display dashboard related to the user type that logged in */}
      {props.authenticated && userType === "jobseeker" && <div>
        <SeekerDashboard handleLogOut={handleLogOut} userid={userid} firstName={firstName} />
      </div>}

      {/**if the user is not authenticated, display the log in form */}
      {!props.authenticated &&
        <div  className="loginForm" style={{
          backgroundColor: '#fefefe',
          margin: '15% auto auto auto',
          border: '1px solid #888',
          width: '50%',
          position: 'relative',
        }}>
          <img src={loginLogo} style={{width:"10%", height:"10%"}}/>
          <h2>Welcome to MyPlace.com</h2>
          {/**username input */}
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={handleUsername}
            style={{
              borderRadius: "20px",
              width: '80%',
              padding: '12px 20px',
              margin: '8px 0',
              display: 'inline-block',
              border: '1px solid #ccc',
              boxSizing: 'border-box',
            }}
          />
          <br />
          {/**password input */}
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={handlePassword}
            style={{
              borderRadius: "20px",
              width: '80%',
              padding: '12px 20px',
              margin: '8px 0',
              display: 'inline-block',
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
          <br />
          {/**button input */}
          <input
            type="button"
            value="Log in"
            style={{
              backgroundColor: '#62B1F6',
              borderRadius: "20px",
              color: 'white',
              padding: '14px 20px',
              margin: '8px 0',
              border: 'none',
              cursor: 'pointer',
              width: '80%'
            }}
            onClick={handleLogIn}
          />
          <br />
          {/**display a link to the sign up where non-existing users can access the sign up form */}
          <div style={{ padding: '10px', backgroundColor: '#f1f1f1' }}>
            <p>Don't have an account? <Link to="/signup" style={{ textDecoration: 'none' }}>Sign up</Link></p>
          </div>
        </div>}
      <div>
        {/**display wrong cresidential message */}
        <h6 style={{
          paddingTop: '3%',
          color: '#C52006'
        }}>{wrMessage}</h6>
      </div>

    </div>
  )

}
export default Login;