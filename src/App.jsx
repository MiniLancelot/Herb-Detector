import Webcam from "react-webcam";
import { useState, useEffect, useRef } from "react";
import { dataRef } from "./Firebase";
// import { set } from "firebase/database";

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    body: data,
  });
  return response.json();
}

function App() {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [plantList, setPlantList] = useState([]);
  const [isShowLoader, setIsShowLoader] = useState(false);
  const overlayRef = useRef(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const modalRef = useRef(null);
  const [isShowModal, setIsShowModal] = useState(false);
  const [isOverlayClosing, setIsOverlayClosing] = useState(false);
  // const [name, setName] = useState('');
  const [searchedName, setSearchedName] = useState("");
  // const [searchedAltName, setSearchedAltName] = useState("");
  const [searchedSciName, setSearchedSciName] = useState("");
  const [searchedUse, setSearchedUse] = useState("");
  const [hoveredPlant, setHoveredPlant] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function () {
        setIsCameraOn(true);
        console.log('Webcam is on');
      })
      .catch(function () {
        setIsCameraOn(false);
        console.log('Webcam is off');
      });
  }, []);

  const handleButtonClick = () => {
    if (isCameraOn) {
      setIsCameraOn(false);
    } else {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function () {
          // Permission granted
          setIsCameraOn(true);
        })
        .catch(function () {
          // Permission denied
          setIsCameraOn(false);
        });
    }
  }

  const TestFirebase = (plantName) => {
    const plantsRef = dataRef.ref('dataset');
    plantsRef.orderByChild('testname').equalTo(plantName).once('value', snapshot => {
      const data = snapshot.val();
      if (data) {
        const key = Object.keys(data)[0];
        setSearchedName(data[key].name);
        // setSearchedAltName(data[key].alternativename);
        setSearchedSciName(data[key].sciencename);
        setSearchedUse(data[key].uses);
      } else {
        setSearchedName("No plant found with this name")
        // setSearchedAltName("");
        setSearchedSciName("");
        setSearchedUse("");
      }

      // console.log(searchedAltName, searchedSciName);
    });
  }

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  }

  const processFile = async (file) => {
    console.log("File type:", file.type);
    setUploadedImage("");
    setPlantList([]);

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image");
      fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setIsOverlayOpen(true);
    setIsShowLoader(true);
    const response = await postData("https://cloud-detect-herb.onrender.com/detect", formData);
    console.log(response.plant_detected);

    // setTimeout(async function() {
    setIsShowLoader(false);
    setIsShowModal(true);
    setUploadedImage("data:image/jpeg;base64," + response.plant_detected.image);
    setPlantList(Object.keys(response.plant_detected.plants));
    // },200);
  }

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }

  const capture = async () => {
    const imageSrc = webcamRef.current.getScreenshot();

    // const canvas = document.createElement("canvas");
    // const ctx = canvas.getContext("2d");
    // canvas.width = 1980;
    // canvas.height = 1080;
    // ctx.drawImage(imageSrc, 0, 0, 1980, 1080);
    // const newImageSrc = canvas.toDataURL("image/jpeg", 1.0);
    
    fetch(imageSrc)
      .then((res) => res.blob())
      .then(async (blob) => {
        const file = new File([blob], "webcam-image.png", { type: "image/png" });
        await processFile(file);
      });
  }

  const closeOverlay = (e) => {
    if (e.target === overlayRef.current) {
      setSearchedName("");
      // setSearchedAltName("");
      setSearchedSciName("");
      setSearchedUse("");
      setIsOverlayClosing(true);
      setTimeout(() => {

        setIsOverlayOpen(false);
        setIsShowModal(false);
        setUploadedImage(null);
        // setIsCameraOn(true);
        setIsOverlayClosing(false);
      }, 300);
    }
  };

  return (
    <>
      <div className="container">
        <div className="title">
          <h1>Herb Detector</h1>
        </div>
        <div className="main-container">
          {isOverlayOpen && (
            <>
              {/* <div className="modal-overlay" onClick={closeOverlay} ref={overlayRef}> */}
              <div className={`modal-overlay ${isOverlayOpen ? 'open' : ''} ${isOverlayClosing ? 'closing' : ''}`} onClick={closeOverlay} ref={overlayRef}>
                <div className="modal-outer-box">
                  {isShowLoader && <img src="loading.svg" alt="Loading..." className="loader" />}
                  {isShowModal && (
                    <div className="modal-inner-box" ref={modalRef}>
                      <div className="modal-content">
                        <img src={uploadedImage} alt="Uploaded" className="image-herb" />
                        <div className="right-content">
                          <ul className="plant-list">
                            {plantList.map((plant, index) => (
                              <div
                                className="hover-area"
                                key={index}
                                onMouseEnter={() => {
                                  setHoveredPlant(plant);
                                  // setName(plant);
                                  TestFirebase(plant);
                                }}
                                onMouseLeave={() => {
                                  setHoveredPlant(null);
                                  setSearchedName("");
                                  // setSearchedAltName("");
                                  setSearchedSciName("");
                                  setSearchedUse("");
                                }}
                              >
                                <span className="plant-name">{plant}</span>
                                {hoveredPlant === plant && (
                                  <div className="hover-container">
                                    <h6><strong>Tên:</strong> {searchedName}</h6>
                                    {/* <h6>Alternative Name: {searchedAltName}</h6> */}
                                    <h6><strong>Tên khoa học:</strong> {searchedSciName}</h6>
                                    <h6><strong>Công dụng:</strong> {searchedUse}</h6>
                                  </div>
                                )}
                              </div>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}


          <div className="webcam-container">
            {isCameraOn ? (
              <Webcam className="webcam" ref={webcamRef} />
            ) : (
              <img src="char.webp" alt="Placeholder" className="error-holder" />
            )}
          </div>

          <div className="button-container">
            <button className="toggle-button button" onClick={handleButtonClick}>
              Camera
            </button>
            <button className="capture-button button" onClick={capture}>Capture</button>
            <button className="input-button button" onClick={handleFileButtonClick}>Upload</button>
            <input className="file-input" type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;