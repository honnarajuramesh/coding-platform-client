# Real-Time Collaborative Code Editor

## Overview

This project is a real-time collaborative code editor built with React.js, CodeMirror, and Socket.io. It allows multiple users to join a coding room, collaborate on code, and see each other's cursor movements in real time. The application supports JWT authentication for secure access, and it provides user interaction features, including notifications when users enter or leave a room.
Hosted here, [https://coding-platform-client.vercel.app/](https://coding-platform-client.vercel.app/)

## Features

- **User Authentication:** Users are required to sign up or log in using their credentials. Upon successful authentication, a JWT token is sent from the server and stored in the browser's `localStorage`.

- **Collaborative Code Editing:** Users can create or join a coding room, where they can collaborate in real time. The CodeMirror code editor is integrated into the application to provide a seamless coding experience.

- **Real-Time User Interaction:** Users are notified when someone enters or leaves the room. This enhances the collaborative aspect of the platform and keeps users informed of who's actively coding.

- **Cursor Tracking:** Users' cursor movements are tracked, and other users in the same room can see the positions of their peers' cursors. This feature is useful for tracking collaborators' positions within the code editor.

- **Room Management:** Users have the option to leave the room when they are done collaborating. They can also copy the room ID for easy sharing with others.

- **User Avatars:** The application displays user avatars of participants in the room, adding a visual element to identify users more easily.

## Getting Started

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/honnarajuramesh/coding-platform-client.git

   ```

2. Install the project dependencies:

   ```bash
   cd your-repo
   npm install

   ```

3. Configure the backend server to handle user authentication and room management.

   - The server url is in .env file,

4. Start the development server:

   ```bash
   npm start

   ```

5. Open the app in your browser at [http://localhost:3000](http://localhost:3000)
