import React, { useEffect, useState } from "react";
import Image from 'react-bootstrap/Image'
import './jobseekerCSS/profile-img.css'

function UploadProfileImage(props) {
  const [file, setFile] = useState(null); //set the profile image
  const [ext, setExt] = useState("");//get the img extension
  const token = localStorage.getItem("token");//get the local storage
  const [updated, setUpdated] = useState(0); //update the usEffect
  const handleUpdate = () => { setUpdated(updated + 1) }
  const [isImage, setIsImage] = useState(true); //flag to detect if an image is already uploaded in the database
  const [showSubmit, setShowSubmit] = useState(false);//flag to show the submit button
  const [tempImg, setTempImg] = useState([]); // store the temp img here
  const inputRef = React.createRef(); // reference used for images. If user cancels an image, the reference helps in resetting the initial value image

  //get the image
  const handleChange = (e) => {
    //if image length is more than 0
    if (e.target.files.length > 0) {
      //store the selected file
      let selectFile = e.target.files[0];
      const filename = e.target.files[0].name;
      //get the extension
      let extension = filename.split(".").pop().toLowerCase();
      if (extension === "docx") {
        alert("No word documents");
      } else {
        //else, set extension, image, isImage, and display the submit button
        setExt(extension);
        setFile(selectFile);
        setIsImage(false);
        setShowSubmit(true);
      }
    } else {
      console.log("Canceled");
    }
  };

  //send the image to the database on submit button clicked
  const handleFile = (e) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userid", props.userid);

    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/uploadimg", {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + token }),
      body: formData,
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.message === "success") {
          setShowSubmit(false);
        }
      })
      .catch((e) => {
        console.log(e.message);
      });
  };

  //cancel the upload
  const handleCancel = () => {
    setShowSubmit(false);
    inputRef.current.value = "";//clear the reference
    //if new upload canceled, set the file image to the previous image
    setFile(tempImg);
    setIsImage(true);
  };

  //retrieve the image from the database
  useEffect(() => {
    const formData = new FormData();
    formData.append("userid", props.userid);

    fetch("http://unn-w20039534.newnumyspace.co.uk/myplace/php/imageretrieve", {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + token }),
      body: formData,
    })
      .then((response) => response.json())
      .then((json) => {
        setFile(json.data);//set the image
        setIsImage(true);  // set isImage to true to confirm that there is an image in the DB
        setTempImg(json.data);//set the temp file image
      })
      .catch((e) => {
        console.log(e.message);
      });
  }, [updated]);

  return (
    <div className="ProfileImg">
      <div className="InputImg">
        {/**
         * make the input file hidden as the profile image will be clickable;
         * set the buttons if new image is being uploaded;
         */}
        <input type="file" onChange={handleChange} hidden ref={inputRef}/>
      </div>
      {/**if new image uploaded, display new image */}
      {/** onClick gets the input element and triggers the input when the image is clicked*/}
      {isImage === false && file &&
        <div className="InputReader">
          <Image src={URL.createObjectURL(file)}
            fluid={true}
            roundedCircle={true}
            thumbnail={true}
            onClick={() => document.getElementsByTagName('input')[0].click()} />
        </div>
      }
      {/**if existing image is found in DB, display the image */}
      {/** onClick gets the input element and triggers the input when the image is clicked*/}
      {isImage === true && file &&
        <div className="FetchReader">
          <Image src={file + props.userid + '&timestamp=' + new Date().getTime()}
            fluid={true}
            roundedCircle={true}
            thumbnail={true}
            onClick={() => document.getElementsByTagName('input')[0].click()} />
        </div>
      }
      {showSubmit &&
        <div className="imageChangeBtns">
          <button onClick={handleFile}>Submit</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      }
    </div>
  );
}

export default UploadProfileImage;