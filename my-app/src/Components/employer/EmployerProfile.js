import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import UploadProfileImage from "./UploadProfileImage.js";
import "./employerCSS/EmpProfile.css";
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function EmployerProfile(props) {
  const [loading, setLoading] = useState(true);//loading state
  const [editMode, setEditMode] = useState(false);// used for editing the existing user details
  const [firstName, setFirstName] = useState("");//set first name
  const [lastName, setLastName] = useState("");//set last name
  const [userid, setUserID] = useState(0); // set userid 
  const [telNumber, setTelNumber] = useState(0);//set tel number
  const [city, setCity] = useState("");//set city
  const [postcode, setPostcode] = useState("");//set postcode
  const [description, setDescription] = useState("");//set description
  const [updated, setUpdated] = useState(0);//update the useEffects
  const handleUpdate = () => { setUpdated(updated + 1) }
  const navigate = useNavigate();//used for navigation
  //uk postcode regex
  const postcodeRegex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/;
  //uk tel number regex
  const ukPhoneNumberRegex = /^(\+44|0)\d{10}$/;
  //number regex
  const [isValidPostcode, setIsValidPostcode] = useState(true);//flag to detect if the postcode is valid
  const [isValidTelNumber, setIsValidTelNumber] = useState(true);//flag to detect if tel number is valid
  const [formErrorMessage, setFormErrorMessage] = useState('');//flag to detect if salary is a number
  const [fieldsCheck, setFieldsCheck] = useState(true);//flag to detect if all inputs are correct when editing the profile
  const token = localStorage.getItem('token');//get the token

  //check if the inputs are correct when editing by using the regex above
  useEffect(() => {
    postcodeRegex.test(postcode) === true || postcode === '' ? setIsValidPostcode(true) : setIsValidPostcode(false);
    ukPhoneNumberRegex.test(telNumber) === true || telNumber === '' ? setIsValidTelNumber(true) : setIsValidTelNumber(false);
  }, [postcode, telNumber]);

  //get all user info from userauth endpoint
  useEffect(() => {

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
            //set all user details
            setUserID(json.data[0].user_id);
            setFirstName(json.data[0].firstName);
            setLastName(json.data[0].lastName);
            setTelNumber(json.data[0].telNumber);
            setCity(json.data[0].city);
            setPostcode(json.data[0].postcode);
            setDescription(json.data[0].description);
          }
          setLoading(false);//loaded
        })
      .catch(
        (e) => {
          console.log(e.message)
        })

  }, [updated]);

  //create a FormData() that will be sent when user is editing the profile
  const dataForm = new FormData();
  dataForm.append("userid", userid);
  dataForm.append("firstName", firstName);
  dataForm.append("lastName", lastName);
  dataForm.append("city", city);
  dataForm.append("postcode", postcode);
  dataForm.append("description", description);
  dataForm.append("telNumber", telNumber);

  //function to update the user profile
  const handleUpdateClick = () => {
    //check if all inputs are not empty and the details are valid
    if (userid === '' || firstName === '' || lastName === '' || firstName === ''
      || city === '' || postcode === '' || telNumber === 0 || telNumber === '') {
      setFormErrorMessage("Please complete all fields");
      setFieldsCheck(false);
      return;
    }
    if (!isValidPostcode) {
      return;
    }
    if (!isValidTelNumber) {
      return;
    }
    //confirm with user this update
    const confirmed = window.confirm('Update the user profile?');
    if (confirmed) {
      fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/updateemployer",
        {
          //set the method
          method: 'POST',
          //set the bearer token
          headers: new Headers({ "Authorization": "Bearer " + token }),

          body: dataForm
        })
        .then(
          (response) => response.json()
        )
        .then(
          (json) => {
            if (json.message === "success") {
              //update all other useEffects
              handleUpdate();
              //set the edit mode to false
              setEditMode(false);
            }
          })
        .catch(
          (e) => {
            console.log(e.message)
          })
    }
  };
  //define a new FormData called deleteUserData if user wants to delete his profile and append his userid
  const deleteUserData = new FormData();
  deleteUserData.append("userid", userid);
  //function to delete the account
  const handleDeleteAccount = () => {
    const confirmed = window.confirm('Are you sure you want to deletea your account?');
    if (confirmed) {
      fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/deleteuser",
        {
          //set the method
          method: 'POST',
          //set the bearer token
          headers: new Headers({ "Authorization": "Bearer " + token }),

          body: deleteUserData
        })
        .then(
          (response) => response.json()
        )
        .then(
          (json) => {
            if (json.message === "success") {
              props.handleAuthenticated(false);//set auth to false
              localStorage.removeItem('token');//remove the token
              //navigate to the log in page if user deleted his account
              setTimeout(() => {
                navigate('/');
              });
            }
          })
        .catch(
          (e) => {
            console.log(e.message)
          })

    }
  }
  //handle edit mode
  const handleEditClick = () => {
    setEditMode(true);
  };

  //handle cancel button
  const handleCancelClick = () => {
    setEditMode(false);
  };
  //handle first name
  const handleFirstName = (event) => {
    setFirstName(event.target.value);
    setFieldsCheck(true);
  };
  //handle last name
  const handleLastName = (event) => {
    setLastName(event.target.value);
    setFieldsCheck(true);
  };
  //handle tel number
  const handleTelNumber = (event) => {
    setTelNumber(event.target.value);
    setFieldsCheck(true);
  };
  //handle city
  const handleCity = (event) => {
    setCity(event.target.value);
    setFieldsCheck(true);
  };
  //handle postcode
  const handlePostcode = (event) => {
    setPostcode(event.target.value);
    setFieldsCheck(true);
  };
  //handle description
  const handleDescription = (event) => {
    setDescription(event.target.value);
    setFieldsCheck(true);
  };

  return (
    <div>
      {/** Show Spinner until the data gets fetched */}
      {loading ? (
        <h4 className="d-flex justify-content-center" style={{ marginTop: '20%' }}>
          <Spinner animation="border" role="status">
          </Spinner>
          <span> Loading Data...</span>
        </h4>
      ) : (
        <div className="profileContainer">
          {/**Invoke the UploadProfileImage to display and update the image profile */}
          < div className="profile-img">
            <UploadProfileImage userid={userid} />
            <h2 className="profileTitle">My Profile</h2>
          </div>
          {/** if edit mode is false, display unedited user details*/}
          {
            !editMode ?
              <div className="profileNotEditing">
                <div className="display-profile">
                  <label htmlFor="firstName">First Name:</label>
                  <p name="firstName">{firstName}</p>
                </div>
                <div className="display-profile">
                  <label htmlFor="lastName">Limited:</label>
                  <p name="lastName">{lastName}</p>
                </div>
                <div className="display-profile">
                  <label htmlFor="description">Description:</label>
                  <p name="description">{description}</p>
                </div>
                <div className="display-profile">
                  <label htmlFor="city">City:</label>
                  <p name="city">{city}</p>
                </div>
                <div className="display-profile">
                  <label htmlFor="postcode">Postcode:</label>
                  <p name="postcode">{postcode}</p>
                </div>
                <div className="display-profile">
                  <label htmlFor="telNumber">Tel Number:</label>
                  <p name="telNumber">{telNumber}</p>
                </div>
                <div className="editProfileBTN">
                  <button onClick={handleEditClick}>Edit</button>
                </div>
                <div className="deleteAccoutBtn">
                  <button onClick={handleDeleteAccount}>Delete Account</button>
                </div>
              </div> :
              <div className="profileEditing">
                {/** If edit mode true, display fields and edit the user details*/}
                {!fieldsCheck && <div style={{ color: 'red' }}><h6>{formErrorMessage}</h6></div>}
                <div className="input-profile">
                  <label htmlFor="inputFirstName">First Name:</label>
                  <input type="text" name="inputFirstName" value={firstName} onChange={handleFirstName} />
                </div>
                <div className="input-profile">
                  <label htmlFor="inputLastName">Last Name:</label>
                  <input type="text" name="inputLastName" value={lastName} onChange={handleLastName} />
                </div>
                <div className="input-profile">

                  <label htmlFor="inputDescription">Description:</label>
                  <textarea name="inputDescription" value={description} onChange={handleDescription} />
                </div>
                <div className="input-profile">
                  <label htmlFor="inputCity">City:</label>
                  <input type="text" name="inputCity" value={city} onChange={handleCity} />
                </div>
                <div className="input-profile">
                  <label htmlFor="inputPostcode">Postcode:</label>
                  <input type="text" name="inputPostcode" value={postcode} onChange={handlePostcode} />
                </div>
                {!isValidPostcode && <div><p style={{ color: 'red' }}>Enter valid postcode</p></div>}
                <div className="input-profile">
                  <label htmlFor="inputTelNumber">Tel Number:</label>
                  <input type="number" name="inputTelNumber" value={telNumber} onChange={handleTelNumber} />
                </div>
                {!isValidTelNumber && <div><p style={{ color: 'red' }}>Enter valid tel number</p></div>}
                <div className="input-profileBTN">
                  <button onClick={handleUpdateClick}>Save</button>
                  <button onClick={handleCancelClick}>Cancel</button>
                </div>
              </div>
          }
        </div>)}
    </div >
  );
}

export default EmployerProfile;


