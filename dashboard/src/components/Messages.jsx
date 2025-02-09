import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import { AiFillDelete } from "react-icons/ai";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { isAuthenticated } = useContext(Context);
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/message/getall",
          { withCredentials: true }
        );
        setMessages(data.messages);
      } catch (error) {
        console.log(error.response.data.message);
      }
    };
    fetchMessages();
  }, []);

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(
        `http://localhost:4000/api/v1/message/delete/${messageId}`,
        { withCredentials: true }
      );
  
      setMessages((prevMessages) =>
        prevMessages.filter((message) => message._id !== messageId)
      );
  
      toast.success("Message deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete message.");
    }
  };
  

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="page messages">
      <h1>MESSAGE</h1>
      <div className="banner">
        {messages && messages.length > 0 ? (
          messages.map((element) => {
            return (
              <div className="card" key={element._id}>
                <div className="details">
                  <p>
                    First Name: <span>{element.firstName}</span>
                  </p>
                  <p>
                    Last Name: <span>{element.lastName}</span>
                  </p>
                  <p>
                    Email: <span>{element.email}</span>
                  </p>
                  <p>
                    Phone: <span>{element.phone}</span>
                  </p>
                  <p>
                    Message: <span>{element.message}</span>
                  </p>
                </div>
                <td>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDeleteMessage(element._id)} 
                  >
                    <AiFillDelete size={20} color="red" />
                  </button>
                </td>
              </div>
            );
            
          })
        ) : (
          <h1>No Messages!</h1>
        )}
      </div>
    </section>
  );
};

export default Messages;
