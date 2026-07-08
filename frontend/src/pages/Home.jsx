import { useEffect } from "react";
import Hero from "../components/Hero";
import Biography from "../components/Biography";
import MessageForm from "../components/MessageForm";
import Departments from "../components/Departments";

const Home = () => {
  useEffect(() => {
    document.title =
      "UC Healthcare · Multi-Speciality Hospital & Online Appointments";
  }, []);

  return (
    <>
      <Hero
        eyebrow="UC Healthcare"
        title="Expert care, when you need it most"
        description="Specialists, diagnostics and emergency services in one place. Book a consultation online and our front desk will confirm your slot — no queueing, no paperwork before you arrive."
      />
      <Departments />
      <Biography />
      <MessageForm />
    </>
  );
};

export default Home;
