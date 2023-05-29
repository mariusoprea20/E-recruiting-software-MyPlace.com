/**
 * @author Marius Oprea
 * @studentID w20039534
 */
import './App.css';
import { Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Menu from './Components/Menu.js';
import Login from './Components/Login.js';
import Signup from './Components/Signup.js';
import EmployerProfile from './Components/employer/EmployerProfile.js';
import PrivateRoute from './PrivateRoute';
import SeekerProfile from './Components/jobseeker/SeekerProfile.js';
import JobSearchPage from './Components/jobseeker/JobSearchPage.js';
import ChatApp from "./ChatApp.js";


function App() {

  //define stated to retrieve all user details from database at a higher level
  const [userDetails, setUserDetails] = useState([]);
  // constant for storing the authenticated status of a user
  const [authenticated, setAuthenticated] = useState(false);
  //user type: if user is an employer or jobseeker
  const [userType, setUserType] = useState("");

  //define a function to handle and store the userType from Login.js form
  const handleUserType = (userType) => {
    setUserType(userType);
  }
  //define a function to update the authenticated status from Login.js form
  const handleAuthenticated = (isAuthenticated,) => {
    setAuthenticated(isAuthenticated)
  };
  //update useEffect
  const [updated, setUpdated] = useState(0);
  const handleUpdate = () => { setUpdated(updated + 1) }

  const token = localStorage.getItem('token'); // get the token if user logged in

  //use useEffect to retrieve all users from DB and store them into the userDetails status
  useEffect(() => {
    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/user")
      .then(
        (response) => response.json()
      )
      .then(
        (json) => {
          //set user details once json data is retrieved
          setUserDetails(json.data);
        }
      )
      .catch((err) => {
        console.log(err.message);
      });

  }, []);
  //return routes 
  return (
    <div className="App">
      {/** */}

      {/*Top menu displayed based on the authenticated status and user type.
         Each user type will have a different menu
      */}
      <Menu authenticated={authenticated} userType={userType} />
      <Routes>
        {/*Set Log in as the base path and update states */}
        <Route path="/" element={
          <Login
            handleUserType={handleUserType}
            authenticated={authenticated}
            handleAuthenticated={handleAuthenticated}
          />} />
        {/*Define private route that can only be accessed if the user is logged in*/}
        <Route element={<PrivateRoute authenticated={authenticated} />}>
          {/**Call priver routes based on usertype */}
          {/**Pass handleAuthenticated to update the authenticated status if the user deletes the account */}
          {userType === "employer" && <Route path="/employerProfile" element={<EmployerProfile handleAuthenticated={handleAuthenticated} />} />}
          {userType === "jobseeker" && <Route path="/seekerProfile" element={<SeekerProfile handleAuthenticated={handleAuthenticated} />} />}
          {userType === "jobseeker" && <Route path="/searchJobs" element={<JobSearchPage />} />}
          <Route path="/chat" element={<ChatApp />} />
          {/*If the paths are not entered correctly, display Not Found message!*/}
          <Route path="*" element={<p>Not Found!</p>} />
        </Route>
        {/*Call SignUp.js inside the route to access the sign up page.*/}
        <Route path="/signup" element={<Signup data={userDetails} authenticated={authenticated} />} />
        <Route path="*" element={<p>Not Found!</p>} />
      </Routes>
    </div>
  );
}

export default App;

