
import { useNavigate, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import defaultProfileImage from './img/profile.png';


function Signup(props) {

    //define states to store values
    const [isEmployer, setIsEmployer] = useState(false);
    const [email, setEmail] = useState(''); // store new email
    const [password, setPassword] = useState(''); // store new password
    const [firstName, setFirstName] = useState('');//store first name
    const [lastName, setLastName] = useState('');// store last name
    const [city, setCity] = useState('');// store city
    const [postcode, setPostcode] = useState('');// store postcode
    const [telNumber, setTelNumber] = useState('');// store tel number
    const [succesMessage, setSuccessMessage] = useState(false);// store success message boolean
    const [repeatPassword, setRepeatPassword] = useState('');// store repeatPassword
    const [passwordErrorMessage, setPasswordErrorMessage] = useState(''); // store passwordErrorMessage
    const [passwordMatch, setPasswordMatch] = useState(false);//store password match boolean
    const [formErrorMessage, setFormErrorMessage] = useState(''); // store formErrorMessage 
    const [fieldsCheck, setFieldsCheck] = useState(true); // store if fields are checked boolean
    const navigate = useNavigate(); // invoke useNavigate()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //define email regex
    //define postcode regex
    const postcodeRegex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/;
    const ukPhoneNumberRegex = /^(\+44|0)\d{10}$/;// define uk phone number regex
    const [isValidEmail, setIsValidEmail] = useState(true);// store isValidEmail boolean state
    const [isValidPostcode, setIsValidPostcode] = useState(true);//store isValidPostcode boolean state
    const [isValidTelNumber, setIsValidTelNumber] = useState(true);//store isValidTel number boolean state
    const [isExistingEmail, setIsExistingEmail] = useState(false);//store isExistingEmail boolean state

    /*useEffect to make sure the password and RepeatPassword match.
    * If not, display an error message in real time by passing 
    * password and RepeatPassword as dependencies of useEffect 
    */
    useEffect(() => {
        setPasswordMatch(password === repeatPassword);
        setPasswordErrorMessage(passwordMatch ? '' : 'Passwords do not match');
    }, [password, repeatPassword]);
    /**
     * useEffect to make sure the email,postcode and tel number are valid.
     * If not, for each of the state, display an error message in real time
     */
    useEffect(() => {
        //test email,postcodem uk number regex against user inputs
        //set boolean states to true or false. If false, the boolean states will return null in sendForm function
        emailRegex.test(email) === true || email === '' ? setIsValidEmail(true) : setIsValidEmail(false);
        postcodeRegex.test(postcode) === true || postcode === '' ? setIsValidPostcode(true) : setIsValidPostcode(false);
        ukPhoneNumberRegex.test(telNumber) === true || telNumber === '' ? setIsValidTelNumber(true) : setIsValidTelNumber(false);
    }, [email, postcode, telNumber]);

    /**
     * useEffect to check if the user is already authenticated. 
     * If user is authenticated and tries to access this page,
     * user must be redirected by getting props.authenticated status
     * from App.js and use navigate();
     */
    useEffect(() => {
        if (props.authenticated) {
            setTimeout(() => {
                navigate('/');
            });
        }
    });

    async function fetchImageAsBlob(url) {
        //fetch the image from the given url and wait for the operation before proceeding
        const response = await fetch(url);
        //convert the response into an arrayBuffer and await before proceeding
        const arrayBuffer = await response.arrayBuffer();
        //create a new Blob object using the ArrayBuffer and specify the MIME type of the image 
        const blob = new Blob([arrayBuffer], { type: 'image/png' });
        return blob;
      }
      

    /** 
     * send the form function called in the return statement.
    */
    const sendForm = async (event) => {
        /**
         * Check if all fields are not empty. If so, just return null and display error message
         */
        if (isEmployer === '' || email === '' || password === '' || firstName === ''
            || lastName === '' || city === '' || postcode === '' || telNumber === 0) {
            //set error form to a message warning
            setFormErrorMessage("Please complete all fields");
            //set fieldCheck to false as there are empty fields
            setFieldsCheck(false);
            return;
        }
        //if the email is invalid, return null
        if (!isValidEmail) {
            return;
        }
        //if email entered is already included in the array, setExisting email true
        //and return null
        if (isExistingEmailMessage.includes(email)) {
            setIsExistingEmail(true);
            return;
        }
        // Check that the passwords match before submitting the form
        //return null and display error message
        if (!passwordMatch) {
            setPasswordErrorMessage('Passwords do not match');
            return;
        }
        //if invalid postcode, return null
        if (!isValidPostcode) {
            return;
        }
        //if invalid tel number, return null
        if (!isValidTelNumber) {
            return;
        }
        //call the defaultImageBlob function and pass the default image
        const defaultImageBlob = await fetchImageAsBlob(defaultProfileImage);
        //create a form data
        const formData = new FormData();
        // add the values of each input field to the form data object
        formData.append('usertype', isEmployer ? 'employer' : 'jobseeker');
        formData.append('email', email);
        formData.append('password', password);
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('city', city);
        formData.append('postcode', postcode);
        formData.append('telNumber', telNumber);
        //append the default image blob to the FormData object with the key 'file'. 
        //the third parameter 'defaultProfileImage.png' is the filename for the blob.
        formData.append('file', defaultImageBlob, 'defaultProfileImage.png');


        //access the endpoing using fetch and send the formData through POST method
        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/signup",
            {
                //set the method
                method: 'POST',
                //set the body data
                body: formData,
            })
            .then(
                (response) => response.text()

            )
            .then(
                (json) => {
                    //once successfuly completed, navigate to the log in page
                    setSuccessMessage(true);
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);

                })
            .catch(
                (e) => {
                    console.log(e.message)
                })
    }

    /**
     * App.js passed all data from database.
     * Return all emails and store in array
     */
    const isExistingEmailMessage = props.data.map(
        (value) => {
            return value.email;
        }
    );

    //handle userType
    const handleUserTypeChange = (event) => {
        //return true if employer entered or false for jobseeker
        setIsEmployer(event.target.value === 'employer');
    };
    //handle email
    const handleEmail = (event) => {
        //store email value from user input
        setEmail(event.target.value);
        //fieldcheck true to remove the email error message when user types
        setFieldsCheck(true);
        //update state of existing email
        setIsExistingEmail(false);
    };
    const handlePassword = (event) => {
        //store pw
        setPassword(event.target.value);
        //fieldcheck true to remove the pw error message when user types
        setFieldsCheck(true);
    };
    const handleRepeatPw = (event) => {
        //store repeat pw input value
        setRepeatPassword(event.target.value);
        //fieldcheck true to remove the repeatpw error message when user types
        setFieldsCheck(true);
    };
    const handleFirstName = (event) => {
        //store first name
        setFirstName(event.target.value);
        //fieldcheck true to remove the firstname error message when user types
        setFieldsCheck(true);
    };
    const handleLastName = (event) => {
        //store last name
        setLastName(event.target.value);
        //fieldcheck true to remove the lastname error message when user types
        setFieldsCheck(true);
    };
    const handleCity = (event) => {
        //store city
        setCity(event.target.value);
        //fieldcheck true to remove the city error message when user types
        setFieldsCheck(true);
    };
    const handlePostcode = (event) => {
        //store postcode
        setPostcode(event.target.value);
        //fieldcheck true to remove the postcode error message when user types
        setFieldsCheck(true);
    };
    const handleTelNumber = (event) => {
        //store tel number
        setTelNumber(event.target.value);
        //fieldcheck true to remove the tell number error message when user types
        setFieldsCheck(true);
    };


    return (
        //div parrent
        <div className='signUp'>
            <form style={{
                backgroundColor: '#fefefe',
                margin: '7% auto 2% auto',
                border: '1px solid #888',
                width: '50%',
            }} >

                {/** Display title if successMessage is false */}
                {!succesMessage && <div><h2>Create MyPlace Account</h2></div>}
                {/** Display the formErrorMessage initiated in sendForm() if the security checks are not met*/}
                {!fieldsCheck && <div><h6 style={{ color: 'red' }}>{formErrorMessage}</h6></div>}
                {/** Display success message if successMessage is true */}
                {succesMessage && <div> <h2 style={{ color: '#00FF00' }}>Succesfully created</h2></div>}
                {/*input for user type that has a disabled value asking the user to input the userType*/}
                <div>
                    <select
                        required
                        style={{
                            borderRadius: "20px",
                            width: '80%',
                            padding: '12px 20px',
                            margin: '8px 0',
                            display: 'inline-block',
                            border: '1px solid #ccc',
                            boxSizing: 'border-box'
                        }}
                        defaultValue='disabled' // defaulted value  for the select component acts as a placeholder
                        onChange={handleUserTypeChange}

                    >
                        <option value='disabled' disabled hidden style={{ color: 'gray' }}>What are you?</option>
                        <option value='jobseeker' style={{ fontSize: '20px' }}>Job Seeker</option>
                        <option value='employer' style={{ fontSize: '20px' }}>Employer</option>
                    </select>
                </div>
                {/*input for email*/}
                <input
                    type="email"
                    placeholder="email"
                    style={{
                        borderRadius: "20px",
                        width: '80%',
                        padding: '12px 20px',
                        margin: '8px 0',
                        display: 'inline-block',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                    onChange={handleEmail}
                />
                {/**Display error messages if the user is not valid or if the email already exists */}
                {!isValidEmail && <div><p style={{ color: 'red' }}>Enter valid email address</p></div>}
                {isExistingEmail && <div style={{ color: 'red' }}>{<p>Email already existing</p>}</div>}
                {/*input for password*/}
                <input
                    type="password"
                    placeholder="enter password"
                    style={{
                        borderRadius: "20px",
                        width: '80%',
                        padding: '12px 20px',
                        margin: '8px 0',
                        display: 'inline-block',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                    onChange={handlePassword}
                />
                {/*input for repeat password*/}
                <input
                    type="password"
                    placeholder="repeat password"
                    style={{
                        borderRadius: "20px",
                        width: '80%',
                        padding: '12px 20px',
                        margin: '8px 0',
                        display: 'inline-block',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                    onChange={handleRepeatPw}
                />
                {/**if password and repeatePw do not match, display passwordErrorMessage set in useEffect() */}
                {!passwordMatch && repeatPassword != '' && <div style={{ color: 'red' }}>{passwordErrorMessage}</div>}
                {/*input for first name / company name*/}
                <input
                    type="text"
                    placeholder={isEmployer ? "company name" : "first name"}
                    style={{
                        borderRadius: "20px",
                        width: '80%',
                        padding: '12px 20px',
                        margin: '8px 0',
                        display: 'inline-block',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                    onChange={handleFirstName}
                />
                {/*input for second name*/}
                <input
                    type="text"
                    placeholder={isEmployer ? "limited type" : "last name"}
                    style={{
                        borderRadius: "20px",
                        width: '80%',
                        padding: '12px 20px',
                        margin: '8px 0',
                        display: 'inline-block',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                    onChange={handleLastName}
                />
                {/*input for city*/}
                <input
                    type="text"
                    placeholder="city"
                    style={{
                        borderRadius: "20px",
                        width: '80%',
                        padding: '12px 20px',
                        margin: '8px 0',
                        display: 'inline-block',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                    onChange={handleCity}
                // TODO : list="uk-cities"
                />
                {/*input for postcode*/}
                <input
                    type="text"
                    placeholder="postcode"
                    style={{
                        borderRadius: "20px",
                        width: '80%',
                        padding: '12px 20px',
                        margin: '8px 0',
                        display: 'inline-block',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                    onChange={handlePostcode}
                />
                {/**If postcode is invalid, display error message */}
                {!isValidPostcode && <div><p style={{ color: 'red' }}>Enter valid postcode</p></div>}
                {/*input for tel number*/}
                <input
                    type="number"
                    placeholder="tel number"
                    style={{
                        borderRadius: "20px",
                        width: '80%',
                        padding: '12px 20px',
                        margin: '8px 0',
                        display: 'inline-block',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box'
                    }}
                    onChange={handleTelNumber}
                />
                {!isValidTelNumber && <div><p style={{ color: 'red' }}>Enter valid tel number</p></div>}
                <br />
                {/*input for create button*/}
                <input
                    type="button"
                    value="Create"
                    style={{
                        backgroundColor: '#62B1F6',
                        borderRadius: "20px",
                        color: 'white',
                        padding: '14px 20px',
                        margin: '8px 0',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    onClick={sendForm}
                    onMouseOver={e => e.target.style.backgroundColor='#4CAF50'}
                    onMouseOut={e => e.target.style.backgroundColor='#62B1F6'}
                />
                {" "}
                {/*input for cancel button created as a link*/}
                <Link to="/"
                    style={{
                        backgroundColor: '#62B1F6',
                        borderRadius: "20px",
                        color: 'white',
                        padding: '14px 20px',
                        margin: '8px 0',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-block',
                        textDecoration: 'none'

                    }}
                    onMouseOver={e => e.target.style.backgroundColor='#f44336'}
                    onMouseOut={e => e.target.style.backgroundColor='#62B1F6'}
                    >Cancel</Link>
            </form>
        </div>

    )

}
export default Signup;
