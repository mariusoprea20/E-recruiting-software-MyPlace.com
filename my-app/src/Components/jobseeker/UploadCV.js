import React, { useEffect, useState } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import Modal from 'react-modal';
import "./jobseekerCSS/uploadcv.css";

const appElement = document.getElementById('root');
Modal.setAppElement(appElement);

function UploadCV(props) {
  const [showModal, setShowModal] = useState(false); // flag to show the modal
  const [file, setFile] = useState(null);//set the CV here
  const [fetchCV, setFetchCV] = useState("");//fetch the cv from the database
  const [ext, setExt] = useState("");//set the file extension
  const [isCV, setIsCV] = useState(false);//flag to check if cv already exists in the database
  const token = localStorage.getItem("token");//get the local storage
  const [updated, setUpdated] = useState(0); // update all useEffects
  const handleUpdate = () => { setUpdated(updated + 1) }

  //get the file
  const handleChange = (e) => {
    let selectFile = e.target.files[0];
    
    // Return null if the file is empty to avoid errors
    if (selectFile === null || selectFile === undefined) {
      return;
    }
    
    const filename = e.target.files[0].name;
    let extension = filename.split(".").pop().toLowerCase();
    
    // Check for PDF files instead of non-DOCX files
    if (extension === "pdf") {
      setExt(extension);
      setFile(selectFile);
      setIsCV(false);
    } else {
      alert("Only PDF Permitted!");
      return;
    }
  };

  //upload the new CV file to the database
  const handleFile = (e) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userid", props.userid);

    // Use the fetch API to send a POST request to the server
    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/uploadcv", {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + token }),
      body: formData
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.message === "success") {
          console.log("success");
          setShowModal(false);//hide the modal
          handleUpdate();//update all useEffects
        }
      })
      .catch((e) => {
        console.log(e.message);
      });
  };
  //retrieve the CV file
  useEffect(() => {

    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/cvretrievel", {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + token })

    })
      .then((response) => response.json())
      .then((json) => {
        setFetchCV(json.data); // fetch the CV(URL from the endpoint)
        setIsCV(true);//cv already exists in the DataBase
      })
      .catch((e) => {
        console.log(e.message);
      });
  }, [updated]);

  return (
    <div className="uploadCV">
      {/**Display Modal */}
      <button className="viewMyCV" onClick={() => setShowModal(true)}>View/Upload CV</button>
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        style={{
          content: {
            width: "50%",
            height: "80%",
            margin: "auto"
          }
        }}
      >
        {/**Display buttons to handle the CV file */}
        <div className="btnCVUpload">
          <input type="file" onChange={handleChange} />
          <button onClick={handleFile}>Upload New CV</button>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
        {/**if new CV Uploaded, display the new CV */}
        <div className="reader">
          {isCV === false && file && (
            <DocViewer
              pluginRenderers={DocViewerRenderers}
              documents={[
                {
                  uri: file ? URL.createObjectURL(file) : true
                },
              ]}
            />
          )}
          {/**if CV already exists in the database, display the existing CV */}
          {isCV === true && fetchCV && (
            <DocViewer
              pluginRenderers={DocViewerRenderers}
              documents={[
                {
                  uri: fetchCV,
                  fileType: "pdf",
                },
              ]}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
export default UploadCV;   