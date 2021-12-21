# MHK 🕹 Node API

### ⚡️ This is the back-end. Find the front-end React app [here](https://github.com/Zilifant/mhk-front).

MHK is an online implementation of the social deduction game *Deception: Murder in Hong Kong* by designer Tobey Ho.

***Deception: Murder in Hong Kong* is © Jolly Thinkers' Learning Centre Limited.**
This app is not affiliated with Tobey Ho, Grey Fox Games, or Jolly Thinkers in any way.

You can (and should) purchase a physical copy of *Deception* directly from publisher [Grey Fox Games](https://greyfoxgames.com/deception-murder-in-hong-kong/). Learn more about the game on [BoardGameGeek](https://boardgamegeek.com/boardgame/156129/deception-murder-hong-kong).

## How to Navigate This Project

* [app.js](./app.js) - Set up the Express HTTP and socket.io server.
* [io.js](./io.js) - All `on` and `emit` functionality using `io` object.
* [controllers](./controllers)
  * [lobby-ctrl.js](./controllers/lobby-ctrl.js)
  * [user-ctrl.js](./controllers/user-ctrl.js)
* [models](./models)
  * [HttpError.js](./models/HttpError.js)
* [routes](./routes)
  * [admin-rts.js](./routes/admin-rts.js)
  * [lobby-rts.js](./routes/lobby-rts.js)
  * [user-rts.js](./routes/user-rts.js)
* [utils](./utils)
  * [modules](./utils/modules)
    * [game-init-module.js](./utils/modules/game-init-module.js)
    * [game-module.js](./utils/modules/game-module.js)
    * [lobby-init-module.js](./utils/modules/lobby-init-module.js)
    * [lobby-module.js](./utils/modules/lobby-module.js)
    * [user-init-module.js](./utils/modules/user-init-module.js)
  * [uniqLobbyID.js](./utils/uniqLobbyID.js)
  * [uniqUserID.js](./utils/uniqUserID.js)
  * [utils.js](./utils/utils.js)

## Setup and Commands

### Setup

**Note:** To get anything from this server you will need to have the front-end React app set up and running as well. By default, the development React app will run on port 3000. If you change the port, you will of course need to change the environmental variables below.

1. Create a `nodemon.json` file in the root directoy and add the following environmental variables:

    ```
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