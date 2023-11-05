/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import { useSnackbar } from "notistack";

const Home = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    enqueueSnackbar("Created a new room", {
      variant: "success",
    });
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      enqueueSnackbar("ROOM ID & username is required", {
        variant: "error",
      });
      return;
    }

    // Redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };
  return (
    <div className={styles.homePageWrapper}>
      <div className={styles.formWrapper}>
        <h4 className={styles.mainLabel}>Paste invitation ROOM ID</h4>
        <div className={styles.inputGroup}>
          <input
            type="text"
            className={styles.inputBox}
            placeholder="ROOM ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className={styles.inputBox}
            placeholder="USER NAME"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyUp={handleInputEnter}
          />
          <button
            className={`${styles.btn} ${styles.joinBtn}`}
            onClick={joinRoom}
          >
            Join
          </button>
          <span className={styles.createInfo}>
            If you don't have an invite then create &nbsp;
            <a onClick={createNewRoom} href="" className={styles.createNewBtn}>
              new room
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;
