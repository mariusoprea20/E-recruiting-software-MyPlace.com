import React, { useEffect, useState } from "react";
import CandidateCV from "./CandidateCV.js";
import Image from 'react-bootstrap/Image'
import { useNavigate } from 'react-router-dom';
import "./employerCSS/candidateprofile.css"
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function CandidateProfile(props) {
  const [loading, setLoading] = useState(true);//loading state
  const [firstName, setFirstName] = useState(""); //set first name
  const [lastName, setLastName] = useState("");//set last name
  const [candidateid, setUserID] = useState(props.userid);//set userid
  const [myid, setMyID] = useState(props.myuserid)
  const [telNumber, setTelNumber] = useState(0);//set tel number
  const [city, setCity] = useState("");//set city
  const [postcode, setPostcode] = useState("");//set postcode
  const [description, setDescription] = useState("");//set description
  const [prefSalary, setPrefSalary] = useState(0);//set pref salary
  const [skills, setSkills] = useState("");//set skills
  const [jobTitle, setJobTitle] = useState("");//set job title
  const token = localStorage.getItem('token');//get the token
  const imgUrl = "http://unn-w20039534.newnumyspace.co.uk/myplace/php/profileimage?userid="; // get the candidate profile img
  const [isCV, setIsCV] = useState(false);//flag to check if CV exists
  const [appUrl, setAppUrl] = useState("http://unn-w20039534.newnumyspace.co.uk/myplace/php/displaycv?userid=" + candidateid);//set the url of the pdf that will be later passed in DocViewer
  const navigate = useNavigate(); // invoke the navigation hook 
  const [showModal, setShowModal] = useState(false);//set the modal to false

  //get the details of current job seeker
  useEffect(() => {

    //access the endpoing by sending the bearer token and formData through headers
    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/user?userid=" + props.userid)
      .then(
        (response) => response.json()
      )
      .then(
        (json) => {
          if (json.message === "success") {
            //store all job seeker details in the useStates
            setUserID(json.data[0].user_id);
            setFirstName(json.data[0].firstName);
            setLastName(json.data[0].lastName);
            setTelNumber(json.data[0].telNumber);
            setCity(json.data[0].city);
            setPostcode(json.data[0].postcode);
            setDescription(json.data[0].description);
            setPrefSalary(json.data[0].prefSalary);
            setSkills(json.data[0].skills);
            setJobTitle(json.data[0].jobTitle);
          }
          setLoading(false);
        })
      .catch(
        (e) => {
          console.log(e.message)
        })

  }, []);

  //useEffect to check for the candidateCV
  useEffect(() => {


    const dataForm = new FormData();
    dataForm.append("userid", props.userid);
    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/checkcandidatecv",
      {
        //set the method
        method: 'POST',
        //set the bearer token
        headers: new Headers({ "Authorization": "Bearer " + token }),
        //set the body
        body: dataForm
      })
      .then(
        (response) => response.json()
      )
      .then(
        (json) => {
          if (json.message === "success") {
            //if CV exists in the database, isCV is "true" else is "false"
            setIsCV(json.isCV);
          }
        })
      .catch(
        (e) => {
          console.log(e.message)
        })

  }, []);

  //handle the chat
  const handleChat = () => {
    let searchParams = ""; // initialise the parameters

    if (props.myuserid) {
      searchParams += `loggedUser=${props.myuserid}`;
    }

    if (candidateid) {
      searchParams += (searchParams ? "&" : "") + `guestuserid=${candidateid}`;
    }
    //navigate to chat private route 
    navigate(`/chat?${searchParams}`);
  }

  //open CV
  const openCV = () => {
    setShowModal(true);
  }

  //closeCV
  const closeCV = () => {
    setShowModal(false);
  }

  return (
    <div>
      {/**Use conditional rendering to display a spinner until the data gets loaded */}
      {loading ? (
        <h4 className="d-flex justify-content-center" style={{ marginTop: '20%' }}>
          <Spinner animation="border" role="status">
          </Spinner>
          <span> Loading Data...</span>
        </h4>
      ) : (
        <div className="candidateProfileContainer">
          <div className="candidateProfile">
            <div className="mainCandidateButtons">
              <button className="handleTheMessage" onClick={() => handleChat()}>Message</button> {/**Open the chat/ navigate to the chat */}
              {/**if CV exists in the database, display it. Otherwise display "No CV" */}
              <button className="closeCandidateProfile" onClick={props.closeCandidateProfile}>Close</button>{/**button to close the profile page */}
            </div>

            <div className="candidateProfileImages">
              {/**display profile image of the job seeker */}
              <Image src={imgUrl + props.userid}
                style={{ borderRadius: "50%", width: "160px", height: "150px" }}
                fluid={true}
                roundedCircle={true}
                thumbnail={true} />
            </div>
            {/**Display the CanidateCV */}
            {!showModal && appUrl && isCV && <button className="openThisCandidateCV" onClick={openCV}>Open CV</button>}
            {showModal && appUrl && isCV && <div className="thisCandidateCV" style={{ height: "100%", width: "100%" }}>
              <button className="closeProfileCV" onClick={closeCV}>Close</button>
              <DocViewer
                pluginRenderers={DocViewerRenderers}
                documents={[
                  {
                    uri: appUrl,
                    fileType: "pdf",
                  },
                ]}
              />
            </div>
            }
            {/**Display all job seeker details */}
            <div className="displayProfile">
              <label htmlFor="firstName">First Name:</label>
              <p name="firstName">{firstName}</p>
            </div>
            <div className="displayProfile">
              <label htmlFor="lastName">Last Name:</label>
              <p name="lastName">{lastName}</p>
            </div>
            <div className="displayProfile">
              <label htmlFor="jobTitle">Job Title:</label>
              <p name="jobTitle">{jobTitle}</p>
            </div>
            <div className="displayProfile">
              <label htmlFor="skills">Skills:</label>
              <p name="skills">{skills}</p>
            </div>
            <div className="displayProfile">
              <label htmlFor="description">Description:</label>
              <p name="description">{description}</p>
            </div>
            <div className="displayProfile">
              <label htmlFor="salary">Preferred Salary:</label>
              <p name="salary">£{prefSalary}</p>
            </div>
            <div className="displayProfile">
              <label htmlFor="city">City:</label>
              <p name="city">{city}</p>
            </div>
            <div className="displayProfile">
              <label htmlFor="postcode">Postcode:</label>
              <p name="postcode">{postcode}</p>
            </div>
            <div className="displayProfile">
              <label htmlFor="telNumber">Tel Number:</label>
              <p name="telNumber">{telNumber}</p>
            </div>
          </div>
      </div>)}
    </div>
  );
}
export default CandidateProfile;


