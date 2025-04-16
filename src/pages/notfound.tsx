import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate(-1); 
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <></>
  );
}

export default NotFound;
