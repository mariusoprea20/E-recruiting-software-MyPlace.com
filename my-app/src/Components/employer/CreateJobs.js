import React, { useEffect, useState } from "react";
import "./employerCSS/CreateJobs.css"; // import CSS file

function CreateJobs(props) {
    //store all job details to create a new job | list of objects
    const [formData, setFormData] = useState({
        jobName: "",
        jobDesc: "",
        requirements: "",
        jobDuties: "",
        city: "",
        postcode: "",
    });
    //job type
    const [jobType, setJobType] = useState("");
    // get the current job
    const currentDate = new Date();
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' };
    const jobDate = currentDate.toLocaleDateString('en-US', options);
    const [salary, setSalary] = useState(0);//set salary of the job
    const [succesMessage, setSuccessMessage] = useState(false);//success message
    const [isValidPostcode, setIsValidPostcode] = useState(true);//flag to check if postcode is valid
    const [isValidSalary, setIsValidSalary] = useState(true);//flag to check if salary is valid
    const [formErrorMessage, setFormErrorMessage] = useState('');//store error message if the input fields are wrong
    const [fieldsCheck, setFieldsCheck] = useState(true); // flag to check if the fields are valid
    //regex for postcode
    const postcodeRegex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/;
    //regex for numbers
    const numberRegex = /^\d+(\.\d+)?$/;
    const token = localStorage.getItem('token');//get the local token
//test the regex in the job form when editing a job and display real time error messages
    useEffect(() => {
        postcodeRegex.test(formData.postcode) === true || formData.postcode === '' ? setIsValidPostcode(true) : setIsValidPostcode(false);
        numberRegex.test(salary) === true  && salary !==0 ? setIsValidSalary(true) : setIsValidSalary(false);
    }, [formData.postcode, salary]);

//function to create a new job in database
    const handleSubmit = () => {
        //if any of the input fields are empty, display error messages and return null
        if (formData.jobName === "" || formData.jobDesc === "" || formData.requirements === "" ||
            formData.jobDuties === "" || salary === "" || salary === 0 || formData.city === ""
            || formData.postcode === "" || jobType === "") {
            setFormErrorMessage("Please complete all fields");//set error message
            setFieldsCheck(false);
            return;
        }

        if (!isValidPostcode) {
            return;
        }
        if (!isValidSalary) {
            return;
        }

        const dataForm = new FormData();
        dataForm.append("jobName", formData.jobName);
        dataForm.append("jobDescription", formData.jobDesc);
        dataForm.append("jobRequirements", formData.requirements);
        dataForm.append("jobDuties", formData.jobDuties);
        dataForm.append("jobSalary", salary);
        dataForm.append("jobCity", formData.city);
        dataForm.append("jobPostcode", formData.postcode);
        dataForm.append("jobType", jobType);
        dataForm.append("userid", props.userid);
        dataForm.append("jobDate", jobDate);
        const confirmed = window.confirm('Proceed with these job details?');
        if (confirmed) {
            fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/createjob",
                {
                    //set the method
                    method: 'POST',
                    //send bearer token
                    headers: new Headers({ "Authorization": "Bearer " + token }),
                    //set the body data
                    body: dataForm
                })
                .then((response) => response.json())
                .then((json) => {

                    if (json.message === "success") {
                        displayMessage();//display success message
                        setTimeout(() => {
                            displayMessage(); // close success message
                            props.handleJobForm();//close the job form in EmployerDashboard.js
                            props.handleUpdate();//update the useEffect
                        }, 2000);

                    } else {
                        console.log("An error has occured");
                    }
                })
                .catch(
                    (e) => {
                        console.log(e.message)
                    }
                )
        }
    }
    //handle 
    function handleChange(event) {
        //get the name of the fields and their values
        const { name, value } = event.target;
        //load previous state and pass the key and the value in the formdata list of objects
        setFormData(prevState => ({ ...prevState, [name]: value }));
        //clear the realtime error message
        setFieldsCheck(true);
    }

    //handle the job type
    const handleJobType = (event) => {
        setJobType(event.target.value);
        //clear the realtime error message
        setFieldsCheck(true);
    }
    //handle success message
    const displayMessage = (event) => {
        //display success message or not
        setSuccessMessage(!succesMessage);
    }
    //handle salary
    const handleSalary = (event) => {
        setSalary(event.target.value);
        //clear the realtime error message
        setFieldsCheck(true);
    }


    return (
        <div className="create-jobs-container">
            {/**Display the job form */}
            <div className="create-jobs-form">
                <h1>Create a new job posting</h1>
                <br />
                <div>
                    <select
                        style={{
                            float: "left",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            backgroundColor: "#f5f5f5",
                            color: "#333",
                            fontSize: "16px"
                        }}
                        defaultValue='disabled' // defaulted value  for the select component acts as a placeholder 
                        onChange={handleJobType}
                    >
                        <option value='disabled' disabled hidden style={{ color: 'gray' }}>Job Type</option>
                        <option value='fulltime' style={{ fontSize: '20px' }}>Full Time</option>
                        <option value='part-time' style={{ fontSize: '20px' }}>Part-Time</option>
                        <option value='apprenticeship' style={{ fontSize: '20px' }}>Apprenticeship</option>
                    </select>
                </div>
                <br />
                <br />
                <div className="form-group">
                    <label htmlFor="jobName">Job Name</label>
                    <input type="text" id="jobName" name="jobName" placeholder="Enter job name" value={formData.jobName} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="jobDesc">Description</label>
                    <textarea id="jobDesc" name="jobDesc" placeholder="Write a description..." value={formData.jobDesc} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="requirements">Requirements</label>
                    <textarea id="requirements" name="requirements" placeholder="Write requirements..." value={formData.requirements} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="jobDuties">Job Duties</label>
                    <textarea id="jobDuties" name="jobDuties" placeholder="Write job duties..." value={formData.jobDuties} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="salary">Salary</label>
                    <input type="number" id="salary" name="salary" placeholder="Enter salary" onChange={handleSalary} />
                </div>
                {!isValidSalary && <div><p style={{ color: 'red' }}>Enter a salary number only</p></div>}
                <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input type="text" id="city" name="city" placeholder="Enter city" value={formData.city} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="postcode">Postcode</label>
                    <input type="text" id="postcode" name="postcode" placeholder="Enter postcode" value={formData.postcode} onChange={handleChange} />
                </div>
                {/**display real time error messages */}
                {!isValidPostcode && <div><p style={{ color: 'red' }}>Enter valid postcode</p></div>}
                {!fieldsCheck && <div style={{ color: 'red' }}><h4>{formErrorMessage}</h4></div>}
                {/**display form buttons */}
                {!succesMessage && <button type="submit" onClick={handleSubmit} >Create Job</button>}
                {!succesMessage && <button type="cancel" onClick={props.handleJobForm}>Cancel</button>}
                {/**display success message if job was created */}
                {succesMessage && <h4 style={{ color: '#5AF92F' }}>Job Created</h4>}
            </div>
        </div>
    );
}
export default CreateJobs;
