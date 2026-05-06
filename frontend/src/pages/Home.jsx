import React, { useEffect } from "react";
import Hero from "../components/Hero";
import Biography from "../components/Biography";
import MessageForm from "../components/MessageForm";
import Departments from "../components/Departments";

const Home = () => {
  useEffect(() => {
    document.title =
      "Care Medical Institute · Multi-Speciality Hospital & Online Appointments";
  }, []);

  return (
    <>
      <Hero
        title="Expert care, when you need it most"
        imageUrl="/hero.png"
      />
      <Departments />
      <Biography imageUrl="/about.png" />
      <MessageForm />
    </>
  );
};

export default Home;
