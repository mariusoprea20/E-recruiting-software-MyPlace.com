import React, { useState } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { useNavigate } from 'react-router-dom';
import "./employerCSS/candidates.css";


function Candidates(props) {
    const [appUrl, setAppUrl] = useState("");//set the url of the pdf that will be later passed in DocViewer
    const [showModal, setShowModal] = useState(false);//set the modal to false
    const token = localStorage.getItem("token"); //get the stored jwt token
    const [newApplications, setNewApplications] = useState(true);//flag to display new applications
    const [acceptedApplications, setAcceptedApplications] = useState(false);//flag to display accepted applications
    const [notes, setNotes] = useState("");//store the notes in this useState
    const navigate = useNavigate();//used for navigation

    //open the Modal to display the CV of the application
    const openModal = (value) => {
        //set the php url endpoing and pass the value from applicationDetails list
        setAppUrl("http://unn-w20039534.newnumyspace.co.uk/myplace/php/jobapplicationcv?applicationid=" + value)
        //display the CV
        setShowModal(true);
    }

    //close the CV
    const closeModal = () => {
        setShowModal(false);
    }

    /**
     * Delete the application from the database.
     * Get the applicationid from the applicationDetails list and store it in a FormData()
     * Update the useEffect in JobApplications.js and alert the user that the job app has been declined
     */
    const deleteApplication = (applicationid) => {
        const dataForm = new FormData();
        dataForm.append('applicationid', applicationid);

        const confirmed = window.confirm('Do you want to decline this application?');
        if (confirmed) {
            fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/deleteapplication", {
                method: "POST",
                headers: new Headers({ Authorization: "Bearer " + token }),
                body: dataForm
            })
                .then((response) => response.json())
                .then(
                    (json) => {
                        if (json.message === "success") {
                            //display alert message
                            alert("Application has been declined!");
                            //update
                            props.handleUpdate();
                            //close modal if opened
                            closeModal();

                        }
                    }
                )
                .catch((e) => { console.log(e.message()) })

        }
    }//end

    //function to accept applications
    const acceptApplication = (applicationid) => {
        //get the application id
        const dataForm = new FormData();
        dataForm.append('applicationid', applicationid);
        //confirm with the user if application accepted
        const confirmed = window.confirm('Do you want to accept this application?');
        if (confirmed) {
            fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/acceptapplication", {
                method: "POST",
                headers: new Headers({ Authorization: "Bearer " + token }),
                body: dataForm
            })
                .then((response) => response.json())
                .then(
                    (json) => {
                        if (json.message === "success") {
                            //display alert message
                            alert("Application has been accepted!");
                            //update
                            props.handleUpdate();
                            //close modal if opened
                            closeModal();

                        }
                    }
                )
                .catch((e) => { console.log(e.message()) })

        }
    }//end

    //save notes of each application
    const saveNotes = (applicationid) => {
        const dataForm = new FormData();
        dataForm.append('applicationid', applicationid);
        dataForm.append('newnotes', notes)

        fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/savenotes", {
            method: "POST",
            headers: new Headers({ Authorization: "Bearer " + token }),
            body: dataForm
        })
            .then((response) => response.json())
            .then(
                (json) => {
                    if (json.message === "success") {
                        //display alert message
                        alert("Saved!");
                        //update
                        props.handleUpdate();
                        //close modal if opened
                        closeModal();

                    }
                }
            )
            .catch((e) => { console.log(e.message()) })
    }//end

    //filter new applications 
    const filterNewApplications = (value) => { return value.status === 'new'; }
    //filter accepted applications
    const filterAcceptedApplications = (value) => { return value.status === 'accepted'; }

    //handle the new applications list
    const handleNewList = () => {
        setNewApplications(true);
        setAcceptedApplications(false);
    }

    //handle accepted applications list
    const handleAcceptedList = () => {
        setAcceptedApplications(true);
        setNewApplications(false);
    }

    //get the notes of each accepted application
    const handleNotes = (event) => {
        setNotes(event.target.value);
    }

    //open the chat
    const handleChat = (candidateid) => {
        let searchParams = ""; // initialise the parameters
        //pass the first parameter
        if (props.myid) {
            searchParams += `loggedUser=${props.myid}`;
        }
        //pass the second parameter
        if (candidateid) {
            searchParams += (searchParams ? "&" : "") + `guestuserid=${candidateid}`;
        }
        //navigate to chat private route 
        navigate(`/chat?${searchParams}`);
    }



    //display all application details 
    const newApplicationList = props.jobApplication.filter(filterNewApplications).map((value) => {

        return (
            <div key={value.applicationId} className="newApplicationsList">
                <h3>NEW</h3>
                <h2>Job Name: {value.job_name}</h2>
                <p>Submitted On: {value.application_date}</p>
                <p>Applicant: {value.firstName} {value.lastName}</p>
                <p>Email Address: {value.email} </p>
                <p>Tel Number: {value.telNumber}</p>
                {/**pass the current application id to openModal to display the CV */}
                <button onClick={() => openModal(value.applicationId)}>View CV</button>
                {/**pass the current application id to deleteApplication to delete the application in the DB */}
                <button onClick={() => deleteApplication(value.applicationId)}>Decline</button>
                <button onClick={() => acceptApplication(value.applicationId)}>Accept</button>
            </div>
        )
    });

    //display all application details 
    const acceptedApplicationList = props.jobApplication.filter(filterAcceptedApplications).map((value) => {

        return (
            <div key={value.applicationId} className="acceptedApplicationsList">
                <h2>Job Name: {value.job_name}</h2>
                <p>Submitted On: {value.application_date}</p>
                <p>Applicant: {value.firstName} {value.lastName}</p>
                <p>Email Address: {value.email} </p>
                <p>Tel Number: {value.telNumber}</p>
                {/**pass the current application id to openModal to display the CV */}
                <button onClick={() => openModal(value.applicationId)}>View CV</button>
                {/**pass the current application id to deleteApplication to delete the application in the DB */}
                <button onClick={() => deleteApplication(value.applicationId)}>Decline</button>
                {/**open the conversation with the current candidate */}
                <button onClick={() => handleChat(value.user_id)}>Message</button>
                <div style={{ width: "20%", paddingLeft: "10%" }} className="textNotes">
                    <textarea defaultValue={value.notes} onChange={(event) => handleNotes(event)}></textarea>
                    <button onClick={() => saveNotes(value.applicationId)}>Save</button>
                </div>
            </div>
        )
    });

    return (
        <div className="employerJobApplication">
            <div className="tabs">
                <button onClick={handleNewList}>New Applications</button>
                <button onClick={handleAcceptedList}>Accepted Applications</button>
                <button onClick={props.goBack}>Back</button>
            </div>
            {/**display applicationDetails */}
            <div className="mainContainerList">
                {newApplications && newApplicationList}
                {acceptedApplications && acceptedApplicationList}
            </div>
            {/**Display the cv of the current application */}
            {showModal && <div className="candidateDisplayCV">
                <button className="closeCV" onClick={closeModal}>Close</button>
                <DocViewer
                    pluginRenderers={DocViewerRenderers}
                    documents={[
                        {
                            uri: appUrl,
                            fileType: "pdf",
                        },
                    ]}
                />
            </div>}

        </div>
    );

}

export default Candidates;
