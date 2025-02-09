import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { AiFillDelete } from "react-icons/ai";
import Swal from "sweetalert2";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const { isAuthenticated } = useContext(Context);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/doctors",
          { withCredentials: true }
        );
        setDoctors(data.doctors);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch doctors.");
      }
    };
    fetchDoctors();
  }, []);

  const handleDeleteDoctor = async (doctorId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the doctor.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:4000/api/v1/user/doctor/delete/${doctorId}`, { withCredentials: true });
          setDoctors((prevDoctors) =>
            prevDoctors.filter((doctor) => doctor._id !== doctorId)
          );
          Swal.fire("Deleted!", "Doctor has been removed.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete doctor.", "error");
        }
      }
    });
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="page doctors">
      <h1>DOCTORS</h1>
      <div className="banner">
        {doctors && doctors.length > 0 ? (
          doctors.map((doctor) => (
            <div className="card" key={doctor._id}>
              <img
                src={doctor.docAvatar?.url}
                alt="doctor avatar"
              />
              <h4>{`${doctor.firstName} ${doctor.lastName}`}</h4>
              <div className="details">
                <p>
                  Email: <span>{doctor.email}</span>
                </p>
                <p>
                  Phone: <span>{doctor.phone}</span>
                </p>
                <p>
                  DOB: <span>{doctor.dob.substring(0, 10)}</span>
                </p>
                <p>
                  Department: <span>{doctor.doctorDepartment}</span>
                </p>
                <p>
                  NIC: <span>{doctor.nic}</span>
                </p>
                <p className="gender">
                  Gender: <span>{doctor.gender}</span></p>
                  <div className="delete-container">
                  <AiFillDelete
                    className="delete-icon"
                    onClick={() => handleDeleteDoctor(doctor._id)}
                    title="Delete Doctor"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <h1>No Registered Doctors Found!</h1>
        )}
      </div>
    </section>
  );
};

export default Doctors;
