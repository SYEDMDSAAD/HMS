import { useEffect } from "react";
import Hero from "../components/Hero";
import AppointmentForm from "../components/AppointmentForm";

const Appointment = () => {
  useEffect(() => {
    document.title = "Book an Appointment · Care Medical Institute";
  }, []);

  return (
    <>
      <Hero
        title="Schedule Your Appointment"
        imageUrl="/signin.png"
        showActions={false}
      />
      <AppointmentForm />
    </>
  );
};

export default Appointment;
