import { useEffect } from "react";
import Hero from "../components/Hero";
import AppointmentForm from "../components/AppointmentForm";

const Appointment = () => {
  useEffect(() => {
    document.title = "Book an Appointment · UC Healthcare";
  }, []);

  return (
    <>
      <Hero
        eyebrow="Appointments"
        title="Schedule your appointment"
        description="Tell us who you are and which department you need. Our front desk confirms every request personally."
        showActions={false}
        showHighlights={false}
      />
      <AppointmentForm />
    </>
  );
};

export default Appointment;
