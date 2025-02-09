import React from "react";
import { Link } from "react-router-dom";
import { FaLocationArrow, FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  const hours = [
    {
      id: 1,
      day: "Monday to Saturday",
      time: "9:00 AM - 1:00 AM",
    },
    {
      id: 2,
      day: "Sunday",
      time: "12:00 PM - 12:00 AM",
    },
    {
      id: 3,
      day: "Emergency",
      time: "24 x 7",
    },
  ];

  return (
    <>
      <footer className={"container"}>
        <hr />
        <div className="content">
          <div>
            <img src="/logo.png" alt="logo" className="logo-img"/>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <Link to={"/"}>Home</Link>
              <Link to={"/appointment"}>Appointment</Link>
              <Link to={"/about"}>About</Link>
            </ul>
          </div>
          <div>
            <h4>Hours</h4>
            <ul>
              {hours.map((element) => (
                <li key={element.id}>
                  <span>{element.day}</span>
                  <span>{element.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <div>
              <FaPhone />
              <span>7887398671</span>
            </div>
            <div>
              <MdEmail />
              <span>mdsaadsyed29@gmail.com</span>
            </div>
            <div>
              <FaLocationArrow />
              <span>Pune, India</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
