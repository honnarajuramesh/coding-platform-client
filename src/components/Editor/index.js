import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import { ACTIONS } from "../../constants/actions";
import CursorIcon from "../../assests/icons8-cursor.svg";

import { useState } from "react";

const Editor = ({ socketRef, roomId, onCodeChange, username }) => {
  const editorRef = useRef(null);
  const [userCursors, setUserCursors] = useState([]);

  //update cursor location for state
  const handleCursorLocation = (username, coords) => {
    setUserCursors((prevUserCursors) => {
      const updatedUserCursors = [...prevUserCursors];
      const existingUserIndex = updatedUserCursors.findIndex(
        (userCursor) => userCursor.username === username
      );

      if (existingUserIndex !== -1) {
        updatedUserCursors[existingUserIndex].coords = coords;
      } else {
        updatedUserCursors.push({ username, coords });
      }

      return updatedUserCursors;
    });
  };

  // sending mouse co-ordinates
  useEffect(() => {
    const interval = setInterval(() => {
      const handleWindowMouseMove = (event) => {
        socketRef.current.emit(ACTIONS.CURSOR_LOCATION_CHANGE, {
          roomId,
          username,
          coords: { x: event.clientX, y: event.clientY },
        });
      };

      window.addEventListener("mousemove", handleWindowMouseMove);
      return {};
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          lineWrapping: true,
        }
      );

      // Listening for code change
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }
    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  //From Server Cursor location change
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(
        ACTIONS.CURSOR_LOCATION_CHANGE,
        ({ username, coords }) => {
          handleCursorLocation(username, coords);
        }
      );
    }
    return () => {
      socketRef.current.off(ACTIONS.CURSOR_LOCATION_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <>
      {userCursors.map(({ username, coords }) => (
        <img
          key={username}
          src={CursorIcon}
          alt="Cursor Logo"
          width={20}
          style={{
            zIndex: 999,
            position: "absolute",
            left: coords.x,
            top: coords.y,
          }}
        />
      ))}

      <textarea id="realtimeEditor"></textarea>
    </>
  );
};

export default Editor;
