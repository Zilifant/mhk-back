# MHK 🕹 Node API

### ⚡️ This is the back-end. Find the front-end React app [here](https://github.com/Zilifant/mhk-front).

MHK is an online implementation of the social deduction game *Deception: Murder in Hong Kong* by designer Tobey Ho.

***Deception: Murder in Hong Kong* is © Jolly Thinkers' Learning Centre Limited.**
This app is not affiliated with Tobey Ho, Grey Fox Games, or Jolly Thinkers in any way.

You can (and should) purchase a physical copy of *Deception* directly from publisher [Grey Fox Games](https://greyfoxgames.com/deception-murder-in-hong-kong/). Learn more about the game on [BoardGameGeek](https://boardgamegeek.com/boardgame/156129/deception-murder-hong-kong).

## Setup and Commands

### Setup

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