import React, { useState } from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

function CandidateCV(props) {
  const [appUrl, setAppUrl] = useState("http://unn-w20039534.newnumyspace.co.uk/myplace/php/displaycv?userid=" + props.userid);//set the url of the pdf that will be later passed in DocViewer
  const [showModal, setShowModal] = useState(false);//set the modal to false
  const token = localStorage.getItem("token"); //get the stored jwt token

  //open CV
  const openCV = () => {
    setShowModal(true);
  }

  //closeCV
  const closeCV = () => {
    setShowModal(false);
  }

  return (
    <div className="uploadCV">
      {/**Open CV button */}
      <button onClick={openCV}>Open CV</button>
      <div className="candidateCV">
        {/**Display CV if button clicked */}
        {showModal && appUrl && <div>
          {/**close CV */}
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
      </div>
    </div>
  );
}
export default CandidateCV;