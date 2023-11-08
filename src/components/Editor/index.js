import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import { useSnackbar } from "notistack";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";

import "codemirror/mode/php/php.js";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/python/python.js";
import "codemirror/mode/swift/swift.js";
import "codemirror/mode/vue/vue.js";

import { ACTIONS, LANGUAGES } from "../../constants/actions";
import CursorIcon from "../../assests/icons8-cursor.svg";
import styles from "./styles.module.css";

import { useState } from "react";

const Editor = ({ socketRef, roomId, onCodeChange, username }) => {
  const editorRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const [userCursors, setUserCursors] = useState([]);
  const [language, setLanguage] = useState(LANGUAGES[4].value);

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

  const handleCodingLangChange = (e) => {
    setLanguage(e.target.value);
    socketRef.current.emit(ACTIONS.LANG_CHANGE, {
      roomId,
      language: e?.target?.value,
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
          mode: { name: "python", json: true },
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

  //Listning language selected
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(
        ACTIONS.LANG_CHANGE,
        ({ language: langFromServer }) => {
          //Upating the lang if its not the current selected one. and warning about the lang chang.
          if (language !== langFromServer) {
            setLanguage(langFromServer);
            enqueueSnackbar(
              "The current Programming language has been changed by an user",
              {
                variant: "info",
              }
            );
            enqueueSnackbar("Please check if code change is required!", {
              variant: "info",
            });
          }
        }
      );
    }

    return () => {
      socketRef.current.off(ACTIONS.LANG_CHANGE);
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
      <div className={styles.main_container}>
        <div className={styles.container}>
          <h5 className={styles.text}>{"Programming language: "}</h5>
          <select
            value={language}
            onChange={handleCodingLangChange}
            className={styles.select}
          >
            {LANGUAGES.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        <textarea id="realtimeEditor"></textarea>
      </div>
    </>
  );
};

export default Editor;
