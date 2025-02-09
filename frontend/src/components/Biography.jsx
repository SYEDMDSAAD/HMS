import React from "react";

const Biography = ({imageUrl}) => {
  return (
    <>
      <div className="container biography">
        <div className="banner">
          <img src={imageUrl} alt="whoweare" />
        </div>
        <div className="banner">
          <p>Biography</p>
          <h3>Who We Are</h3>
          <p>
          <strong>Care Medical Institute</strong> is a premier healthcare facility dedicated 
          to providing high-quality medical services to patients. Our institute is equipped 
          with state-of-the-art technology and a team of experienced doctors, nurses, and 
          medical staff committed to delivering compassionate and effective healthcare.
        </p>
        <p>
          We offer a wide range of medical services, including general consultations, 
          specialized treatments, emergency care, and diagnostic services. Our mission is 
          to ensure that every patient receives the best possible care in a safe and 
          comfortable environment.
        </p>
        <p>
          At <strong>Care Medical Institute</strong>, we prioritize patient well-being by 
          combining advanced medical expertise with personalized treatment plans. Our 
          departments include cardiology, orthopedics, pediatrics, neurology, and more, 
          ensuring comprehensive medical attention for individuals of all ages.
        </p>
        <p>
          We are committed to innovation and excellence, continuously working on enhancing 
          our medical services to meet the evolving healthcare needs of our patients. 
          Whether it’s preventive care, routine checkups, or complex procedures, our team 
          is dedicated to promoting health and improving lives.
        </p>
        <p><strong>Your health is our priority!</strong></p>

        </div>
      </div>
    </>
  );
};

export default Biography;
