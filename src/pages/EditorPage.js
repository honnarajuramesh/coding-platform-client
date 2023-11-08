import React, { useState, useRef, useEffect } from "react";
import { useSnackbar } from "notistack";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

import { initSocket } from "../socket";
import { ACTIONS } from "../constants/actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import styles from "./styles.module.css";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [username] = useState(location.state?.username);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        enqueueSnackbar("Socket connection failed, try again later.!", {
          variant: "error",
        });
        reactNavigator("/");
        reactNavigator(0);
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username: userName, socketId }) => {
          if (userName !== username) {
            enqueueSnackbar(`${userName} joined the room.`, {
              variant: "success",
            });
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      // Listening for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        enqueueSnackbar(`${username} left the room.`, {
          variant: "success",
        });
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  //coping room id to clipboard
  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      enqueueSnackbar("Room ID has been copied to your clipboard", {
        variant: "success",
      });
    } catch (err) {
      enqueueSnackbar("Could not copy the Room ID!", {
        variant: "error",
      });
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className={styles.mainWrap}>
      <div className={styles.aside}>
        <div className={styles.asideInner}>
          <h3>Connected</h3>
          <div className={styles.clientsList}>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button
          className={`${styles.btn} ${styles.copyBtn}`}
          onClick={copyRoomId}
        >
          Copy ROOM ID
        </button>
        <button
          className={`${styles.btn} ${styles.leaveBtn}`}
          onClick={leaveRoom}
        >
          Leave
        </button>
      </div>
      <div className={styles.editorWrap}>
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
          username={username}
        />
      </div>
    </div>
  );
};

export default EditorPage;
