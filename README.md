# Deception 🕹 Node API

### ⚡️ This is the back-end. Find the front-end React app [here](https://github.com/Zilifant/mhk-front).

Deception is an online implementation of the social deduction game *Deception: Murder in Hong Kong* by designer Tobey Ho.

***Deception: Murder in Hong Kong* is © Jolly Thinkers' Learning Centre Limited.**
This app is not affiliated with Tobey Ho, Grey Fox Games, or Jolly Thinkers in any way.

You can (and should) purchase a physical copy of *Deception* directly from publisher [Grey Fox Games](https://greyfoxgames.com/deception-murder-in-hong-kong/). Learn more about the game on [BoardGameGeek](https://boardgamegeek.com/boardgame/156129/deception-murder-hong-kong).

## Contents
- [Overview](#overview)
- [Navigating the Project](#navigating-the-project---node-api)
- [What Could Be Improved](#what-could-be-improved---node-api)
- [Planned Features](#planned-features)
- [Setup and Commands](#setup-and-commands---node-api)

## Overview
Deception is a React front-end connected to a Node.js REST API via [Socket.IO](https://socket.io/) and the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). It uses Fetch to initially load user and lobby data. Once users are verified and have loaded their lobby, Socket.IO connects and handles all further communicaton.

Deception is my first full-stack application. I built it as a learning exercise and portfolio piece. As of January 2022 Deception remains a work in progress. There is no doubt much that can be improved; I welcome suggestions and constructive criticism.

### Notable Tools and Tech
React • Node.js • Socket.IO • Express.js • CORS • SCSS • nodemon • React Router • Create React App • VSCode • Postman • Vercel • Heroku 

### Notable Features
**Note:** Some links point to front-end repository.
- [**Text Chat:**](https://github.com/Zilifant/mhk-front/tree/main/src/components/lobby/chat) Handles both [user messages and system announcements](https://github.com/Zilifant/mhk-front/blob/main/src/hooks/chat-hook.js). Includes unique, non-duplicating user [colors](https://github.com/Zilifant/mhk-back/blob/main/utils/modules/lobby-module.js).
- [**Private Lobbies:**](https://github.com/Zilifant/mhk-back/blob/main/controllers/lobby-ctrl.js) Unique, procedurally generated lobby IDs. Joinable by entering the lobby ID or visiting it directly as a URL.
- [**Live-Stream Friendly:**](https://github.com/Zilifant/mhk-front/blob/main/src/components/lobby/Foyer.jsx) Lobby IDs hidden in URL bar, even if user connected via the URL. *Streaming Mode* option available to automatically hide lobby ID in the UI.
- [**Lobby Leadership:**](https://github.com/Zilifant/mhk-back/blob/main/utils/modules/lobby-module.js) 'Leadership' allows one user to handle game set up. Leadership automatically passes to another user if the Leader disconnects; it can also be transferred manually.
- [**Sensitive Data Handling:**](https://github.com/Zilifant/mhk-back/blob/main/io.js#L335) Players cannot use basic client-side tools/scripts to cheat; hidden role data is never sent to clients that should not have it.
- [**Visual Timer:**](https://github.com/Zilifant/mhk-front/blob/main/src/components/lobby/main/game/Timer.jsx) Dynamic UI timer synced [server-side](https://github.com/Zilifant/mhk-back/blob/main/utils/modules/game-module.js#L238) for all players.
- [**Cookies:**](https://github.com/Zilifant/mhk-back/blob/main/controllers/user-ctrl.js) User data is saved in a browser cookie, allowing them to seamlessly rejoin a lobby/game if they disconnect. Also checks for and prevents same user from connecting twice.
- [**Styled-Markdown Module:**](https://github.com/Zilifant/mhk-front/blob/main/src/util/styled-markdown.js) A more generally useful module that turns a basic markdown language into HTML/JSX with classes for complex styling.
- [**SVG React Components:**](https://github.com/Zilifant/mhk-front/tree/main/src/components/shared) General components for rendering icons and buttons from a [library](https://github.com/Zilifant/mhk-front/blob/main/src/util/static-content/svgs-html.js) of SVG data.
- [**Tooltip React Component:**](https://github.com/Zilifant/mhk-front/tree/main/src/components/shared) General component for rendering tooltips when hovering elements; includes settings for tooltip content, size, and relative position.

## Navigating the Project - Node API
* [app.js](./app.js) - Set up the Express HTTP and socket.io server.
* [io.js](./io.js) - All `on` and `emit` functionality using `io` object.
* [controllers](./controllers) - Logic for HTTP requests that create new lobbies and users, get existing lobby data, and check visitor cookies.
  * [lobby-ctrl.js](./controllers/lobby-ctrl.js)
  * [user-ctrl.js](./controllers/user-ctrl.js)
* [models](./models)
  * [HttpError.js](./models/HttpError.js)
* [routes](./routes) - HTTP routes connected to controllers.
  * [admin-rts.js](./routes/admin-rts.js)
  * [lobby-rts.js](./routes/lobby-rts.js)
  * [user-rts.js](./routes/user-rts.js)
* [utils](./utils)
  * [modules](./utils/modules) - Logic for creating new lobbies and users (called by HTTP controllers), as well as logic used in lobbies and games (called by `io.js`).
    * [game-init-module.js](./utils/modules/game-init-module.js)
    * [game-module.js](./utils/modules/game-module.js)
    * [lobby-init-module.js](./utils/modules/lobby-init-module.js)
    * [lobby-module.js](./utils/modules/lobby-module.js)
    * [user-init-module.js](./utils/modules/user-init-module.js)
  * [uniqLobbyID.js](./utils/uniqLobbyID.js) - Generates unique lobby ids.
  * [uniqUserID.js](./utils/uniqUserID.js) - Generates unique user ids.
  * [data.js](./utils/data.js) - Static content, e.g. card text.
  * [utils.js](./utils/utils.js) - Miscellaneous functions and constants (*that should be broken into multiple files or added to modules that use them*).

## What Could Be Improved - Node API
* **TO DOs:** Specific improvements appear throughout the code as `TO DO:` comments. Most of these involve 1) refactoring overly complex or specific code in light of the app's overall structure, and 2) refactors based on new techniques and best practices I've picked up.
* **Architecture:** I continue to explore and experiment with ways to make the high-level architecture more sensible, such as 1) making better use of methods on the lobby and game objects, and 2) moving functionality not directly related to `io` out of `io.js`.
* **Tests:** If I could go back and do anything differently, it would be to implement tests from the start.

## Planned Features
In addition to the above improvements, I'd like to implement (front-end included):
1. A database to protect data from server restarts and outages ⭐️ *Top Priority*
2. Responsive interface for mobile and tablets ⭐️ *Top Priority*
3. Interface scaling for high-resolution displays
4. Animated UI changes
5. Dyslexic font option
6. In-app rules reference
7. Emoji Mode, showing emojis instead of text on player cards
8. Unique images for all player cards

## Setup and Commands - Node API

### Setup

**Note:** To get anything from this server you will need to have the front-end React app set up and running as well. By default, the development React app will run on port 3000. If you change the port, you will of course need to change the environmental variables below.

1. Create a `nodemon.json` file in the root directoy and add the following environmental variables:

    ```json
    {
      "env": {
        "CLIENT_URL_HTTP": "http://localhost:3000",
        "CLIENT_URL_HTTPS": "https://localhost:3000"
      }
    }
    ```
2. `npm install`

### Commands

- `npm run dev` to start the nodemon development server.
- `npm start` is also available for the production environment.