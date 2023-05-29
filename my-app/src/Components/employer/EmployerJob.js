import React, { useState, useEffect } from 'react';
import "./employerCSS/myJobList.css";
import Image from 'react-bootstrap/Image'
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


function EmployerJob(props) {
  const [loading, setLoading] = useState(true);//loading state
  const [data, setData] = useState([]);//store all the jobs of the current user here
  const [isEditing, setIsEditing] = useState(false);// set job editing mode to false
  const [jobid, setJobID] = useState(0);// store the job id here
  const [jobName, setJobName] = useState("");//set job name
  const [jobDescription, setJobDescription] = useState("");//set job description
  const [jobRequirements, setJobRequirements] = useState("");//set job requirements
  const [jobDuties, setJobDuties] = useState("");//set job duties
  const [jobSalary, setJobSalary] = useState(0);// set job salary
  const [jobCity, setJobCity] = useState("");//set job city
  const [jobPostcode, setJobPostcode] = useState("");//set job postcode
  const [jobType, setJobType] = useState("");//set job type
  const [succesMessage, setSuccessMessage] = useState(false); // set successMessage if job was created
  const [isValidPostcode, setIsValidPostcode] = useState(true); // flag to check if postcode is valid
  const [isValidSalary, setIsValidSalary] = useState(true);//flag to check if salary is valid
  const [formErrorMessage, setFormErrorMessage] = useState(''); // store any form errors as message
  const [fieldsCheck, setFieldsCheck] = useState(true);//flag to check the fields
  //postcode regex
  const postcodeRegex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/;
  const imgUrl = "http://unn-w20039534.newnumyspace.co.uk/myplace/php/profileimage?userid="; // store the url of the user porfile image
  //number regex
  const numberRegex = /^\d+(\.\d+)?$/;
  const token = localStorage.getItem('token');//get the token
  const deleteData = new FormData();//format data declaration

  //test the regex in the job form when editing a job and display real time error messages
  useEffect(() => {
    postcodeRegex.test(jobPostcode) === true || jobPostcode === '' ? setIsValidPostcode(true) : setIsValidPostcode(false);
    numberRegex.test(jobSalary) === true && jobSalary != 0 ? setIsValidSalary(true) : setIsValidSalary(false);
  }, [jobPostcode, jobSalary]);

  //get all jobs that belong to this user
  useEffect(() => {
    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/job?userid=" + props.userid)
      .then((response) => response.json())
      .then((json) => {
        if (json.message === "success") {
          setData(json.data);//store all the jobs
          setLoading(false);//load completed
        } else {
          console.log("failure");
        }

      })
      .catch((e) => {
        console.log(e.message());
      });
  }, [props.updated]);

  //append all job input to the FormatData() to edit the job in the endpoint and store it in DB
  const dataForm = new FormData();
  dataForm.append("jobid", jobid);
  dataForm.append("jobName", jobName);
  dataForm.append("jobDescription", jobDescription);
  dataForm.append("jobRequirements", jobRequirements);
  dataForm.append("jobDuties", jobDuties);
  dataForm.append("jobSalary", jobSalary);
  dataForm.append("jobCity", jobCity);
  dataForm.append("jobPostcode", jobPostcode);
  dataForm.append("jobType", jobType);

  //update the job functio
  const updateJob = () => {
    //if any of the input fields are empty, display error messages and return null
    if (jobName === "" || jobDescription === "" || jobRequirements === "" ||
      jobDuties === "" || jobSalary === "" || jobSalary == 0 || jobCity === ""
      || jobPostcode === "" || jobType === "") {
      setFormErrorMessage("Please complete all fields");
      setFieldsCheck(false);
      return;
    }

    if (!isValidPostcode) {
      return;
    }
    if (!isValidSalary) {
      return;
    }
    //confirm with the user, the update
    const confirmed = window.confirm('Update this job?');
    if (confirmed) {
      fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/updatejob",
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
            setSuccessMessage(true);//display  successfull message
            setTimeout(() => { //timeout 1000 mili
              setSuccessMessage(false);//clear the succesfull message
              props.handleUpdate(); // update the useEffect
              setIsEditing(false); // set editing mode to false
            }, 1000);

          } else {
            console.log("failure");
          }
        })
        .catch((e) => {
          console.log(e.message());
        });
    }
  };

  //function to delete the job
  const deleteJob = (deletejobid) => {
    //pass only the job id that user selected
    deleteData.append("jobid", deletejobid)
    //confirm the delition of  selected job
    const confirmed = window.confirm('Do you want to delete this job?');
    if (confirmed) {
      fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/deletejob",
        {
          //set the method
          method: 'POST',
          //send bearer token
          headers: new Headers({ "Authorization": "Bearer " + token }),
          //set the body data
          body: deleteData
        })
        .then((response) => response.json())
        .then((json) => {
          if (json.message === "success") {
            console.log("success");
            props.handleUpdate();//update the useEffects
          } else {
            console.log("failure");
          }
        })
        .catch((e) => {
          console.log(e.message());
        });
    }
  }

  //function to handle the edit by storing all job details into the useStates
  const handleEdit = (value) => {
    setJobID(value.job_id);
    setJobName(value.job_name);
    setJobDescription(value.job_description);
    setJobRequirements(value.job_requirements);
    setJobDuties(value.job_jobDuties);
    setJobSalary(value.job_salary);
    setJobCity(value.job_city);
    setJobPostcode(value.job_postcode);
    setJobType(value.job_type);

    setIsEditing(true);
  };

  //function to cancel the edit by setting all useStates to empty values
  const handleCancel = () => {
    setJobID(0);
    setJobName("");
    setJobDescription("");
    setJobRequirements("");
    setJobDuties("");
    setJobSalary(0);
    setJobCity("");
    setJobPostcode("");
    setJobType("");

    setIsEditing(false);
  };

  //handle job name
  const handleJobName = (event) => {
    setJobName(event.target.value);
  }
  //handle job desc
  const handleJobDesc = (event) => {
    setJobDescription(event.target.value);
  }
  //handle job requirements
  const handleJobReq = (event) => {
    setJobRequirements(event.target.value);
  }
  //handle job duties
  const handleDuties = (event) => {
    setJobDuties(event.target.value);
  }
  //handle job salary
  const handleSalary = (event) => {
    setJobSalary(event.target.value);
  }
  //handle job city
  const handleCity = (event) => {
    setJobCity(event.target.value);
  }
  //handle postcode
  const handlePostcode = (event) => {
    setJobPostcode(event.target.value);
  }
  //handle job type
  const handleJobType = (event) => {
    setJobType(event.target.value);
  }
  //call back function map to iterate over the data and display the jobs
  const jobData = data.map((value) => {

    return (
      <div key={value.job_id}>
        {/**if editing  mode is true and job id from the current job is being cliked, 
         * allow user to edit the current job 
         */}
        {isEditing && jobid === value.job_id ? (
          <div className="create-jobs-form" style={{ marginTop: '2%' }}>
            <h1>Edit Job</h1>
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
                defaultValue={value.job_type} // defaulted value  for the select component acts as a placeholder 
                onChange={handleJobType}
              >
                <option value='fulltime' style={{ fontSize: '20px' }}>Full Time</option>
                <option value='part-time' style={{ fontSize: '20px' }}>Part-Time</option>
                <option value='apprenticeship' style={{ fontSize: '20px' }}>Apprenticeship</option>
              </select>
            </div>
            <br />
            <br />
            <div className="form-group">
              <label htmlFor="jobName">Job Name</label>
              <input type="text" name="myJobName" placeholder="Job Name" defaultValue={value.job_name} onChange={handleJobName} />
            </div>
            <div className="form-group">
              <label htmlFor="jobDesc">Description</label>
              <textarea id="jobDesc" name="jobDesc" placeholder="Job Description" defaultValue={value.job_description} onChange={handleJobDesc} />
            </div>
            <div className="form-group">
              <label htmlFor="requirements">Requirements</label>
              <textarea id="requirements" name="requirements" placeholder="Job Requirements" defaultValue={value.job_requirements} onChange={handleJobReq} />
            </div>
            <div className="form-group">
              <label htmlFor="jobDuties">Job Duties</label>
              <textarea id="jobDuties" name="jobDuties" placeholder="Job Duties" defaultValue={value.job_jobDuties} onChange={handleDuties} />
            </div>
            <div className="form-group">
              <label htmlFor="salary">Salary</label>
              <input type="number" id="salary" name="salary" placeholder="Enter salary" defaultValue={value.job_salary} onChange={handleSalary} />
            </div>
            {!isValidSalary && <div><p style={{ color: 'red' }}>Enter a salary number only</p></div>}
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input type="text" id="city" name="city" placeholder="Enter city" defaultValue={value.job_city} onChange={handleCity} />
            </div>
            <div className="form-group">
              <label htmlFor="postcode">Postcode</label>
              <input type="text" id="postcode" name="postcode" placeholder="Enter postcode" defaultValue={value.job_postcode} onChange={handlePostcode} />
            </div>
            {/**display error messaging if postcode or any of the fields are empty or  not correct */}
            {!isValidPostcode && <div><p style={{ color: 'red' }}>Enter valid postcode</p></div>}
            {!fieldsCheck && <div style={{ color: 'red' }}><h4>{formErrorMessage}</h4></div>}
            {!succesMessage && <button type="submit" onClick={updateJob} >Update Job</button>}
            {!succesMessage && <button type="cancel" onClick={handleCancel}>Cancel</button>}
            {succesMessage && <h4 style={{ color: '#5AF92F' }}>Job Updated</h4>}
          </div>

        ) : (
          <div className="myJobList">
            {/**if edit mode is false, display the job details */}
            <div className="jobImg">
              {/**retrieve the profile image of the user and display it on the jobs */}
              <Image src={imgUrl + props.userid + '&timestamp=' + new Date().getTime()}
                fluid={true}
                thumbnail={true}
              />
            </div>
            <div className="jobDetails">
              <p>Job Name: {value.job_name}</p>
              <p>Job Type: {value.job_type}</p>
              <p>Job Date: {value.job_datePosted}</p>
              <p>Job Salary: £{value.job_salary}</p>
              <p>Job City: {value.job_city}</p>
              <p>Job Postcode: {value.job_postcode}</p>
              {/**if edit button clicked, pass the job to 'handleEdit' function */}
              <button onClick={() => handleEdit(value)}>Edit</button>
              <button onClick={() => deleteJob(value.job_id)}>Remove</button>
            </div>
          </div>
        )}
      </div>
    )
  });

  return (
    <div className='myJobsList'>
      {/**display the existing jobs here */}
      {/**Use conditional rendering to display a spinner until the data gets loaded */}
      {loading ? (
        <h4 className="d-flex justify-content-center" style={{marginTop:'20%'}}>
          <Spinner animation="border" role="status">
          </Spinner>
          <span> Loading Data...</span>
        </h4>
      ) : (
       <div>{jobData}</div>
      )}
    </div>
  )
}
export default EmployerJob;
