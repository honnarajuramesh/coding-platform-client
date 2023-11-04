import React from "react";
import styles from "./styles.module.css";

const index = (props) => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <nav className={styles.navbar}>
      <h1>Collaborative coding platform</h1>
      <button className={styles.white_btn} onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
};

export default index;
