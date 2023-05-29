import React, { useEffect, useState } from 'react';
import "./jobseekerCSS/jobapplication.css";

function JobApplication(props) {
    const [newCV, setNewCV] = useState(null); // store a new cv here
    const currentDate = new Date();//current date
    const options = { day: 'numeric', month: 'numeric', year: 'numeric' }; //date format
    const applicationDate = currentDate.toLocaleDateString('en-US', options); // current formatted date
    const token = localStorage.getItem("token");//access the JWT token
    const[isExistingCV, setIsExistingCV]= useState(false); // check if the user previously attached a CV
    const [loading, setLoading] = useState(true); // loading the CV message
    const[cvErrorMessage, setCVErrorMessage] = useState(""); // set the CV error message

    //TODO: create an endpoint that checks if the user has a cv in the database
    //fetch the response of isCV in the database.
    //isCV returns true or false depending if the value of CV in the database is null or not
    useEffect(() => {
      fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/cvretrievel", {
        method: "POST",
        headers: new Headers({ Authorization: "Bearer " + token }),
      })
        .then((response) => response.json())
        .then((json) => {
          //true or false value
          setIsExistingCV(json.isCV); 
          //loading completed
          setLoading(false); // Add this line
        })
        .catch((e) => {
          console.log(e.message);
          setLoading(false);
        });
    }, []);
    

    /**
     * This function allows user to apply for a job.
     * 1. retrieve the job id and userID from props and append them to a FormData()
     * 2.fetch the existing stored CV from the database and append it to the FormData()
     * 3.append the current formatted date
     * 4.send FormatData() to the endpoint to create the application in the database
     * 5.if successfully crated, update the appliedJob in JobSearch Page to display 
     *   "success" message on the applied job advert and close the Modal.
     */
    const handleApplication = async () => {
      //if there is no existing cv in user database, return null and set error message
      if(isExistingCV===false){
        setCVErrorMessage("Upload your CV first in PDF format!");
        return;
      }
        const dataForm = new FormData();
        dataForm.append("jobid", props.jobDetails.job_id);
        dataForm.append("userid", props.userID);
        //if user uploaded a new CV, append the new CV
        if (newCV) {
          dataForm.append("file", newCV);
        } else {
            //esle append the old CV previously uploaded in user profile
          try {
            //fetch the user cv from the endpoint
            const response = await fetch(`http://unn-w20039534.newnumyspace.co.uk/myplace/php/displaycv?userid=${props.userID}`);
            //await for the blob response as the file is saved as blob in database
            const blob = await response.blob();
            //convert blob to new file of type pdf
            const file = new File([blob], "cv.pdf", { type: "application/pdf" });
            //append the cv to the data form
            dataForm.append("file", file);
          } catch (error) {
            console.error("Error fetching the PDF:", error);
            return;
          }
        }
        //append the current date
        dataForm.append("applicationDate", applicationDate);
        //confirm if user wants to proceed with the application
        const confirmed = window.confirm('Do you want to apply for this job?');
        if (confirmed) {
            //if yes, send the application in the endpoint
            fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/createapplication",{
                method: "POST",
                headers: new Headers({ Authorization: "Bearer " + token }),
                body: dataForm
              })
                .then((response) => response.json())
                .then(
                    (json) => {
                        //if application was created succesfully
                        if (json.message === "success") {
                            console.log("applied")
                            //close modal
                            props.handndleShowModal(false);
                            //update the appliedJob in JobSearch Page to display "success" message
                            props.handleApplicationStatus(props.jobDetails.job_id, true);
                            props.handleUpdate();
                        }
                    }
                )
                .catch((e) => { console.log(e.message()) })
        }
    }

    //upload the new cv
    const handleNewCV = (e) => {
        //set the slected pdf file
        let selectFile = e.target.files[0];
        //get the filename
        const filename = e.target.files[0].name;
        //get the extension by spliting the name and getting the value after "."
        let extension = filename.split(".").pop().toLowerCase();
        if (extension === "pdf") {
            setNewCV(selectFile);
            setIsExistingCV(true);
        } else {
            alert("Only PDF Files Allowed!")
            setNewCV(null);
            setIsExistingCV(false);
            return;
        }
    };
    return (
        <div className="jobAdvert">
            {/**display the job details */}
            <div className="jobDetails">
                <h2>{props.jobDetails.job_name}</h2>
                <h6>Type: {props.jobDetails.job_type}</h6>
                <p>Posted: {props.jobDetails.job_datePosted}</p>
                <p>Salary: {props.jobDetails.job_salary}</p>
                <p>City: {props.jobDetails.job_city}</p>
                <p>Postcode: {props.jobDetails.job_postcode}</p>
                <h4>Description</h4>
                <p>{props.jobDetails.job_description}</p>
                <h4>Job Duties</h4>
                <p>{props.jobDetails.job_jobDuties}</p>
                <h4>Requirements</h4>
                <p>{props.jobDetails.job_requirements}</p>
            </div>
            <div className="advertCV">
            {/**if loading, display a loading message */}
            {loading ? (
              <h6>Loading...</h6>
            ) : (
              /**if existing cv, display CV attached message*/
              isExistingCV ? (
                <h6>CV Already Attached</h6>
              ) : (
                <h6>No CV Attached</h6>
              )
            )}
            {/**handle new cv upload */}
            <input type="file" onChange={handleNewCV}/>
            {/**display error message if no cv found in the database */}
            <h6>{cvErrorMessage}</h6>
        </div>
            <div className="advertBtn">
                {/**buttons to close the modal and handle the application */}
                <button onClick={() => props.handndleShowModal(false)}>Back</button>
                <button onClick={handleApplication}>Apply</button>
            </div>
        </div>
    )
}
export default JobApplication;