// Lobby Initiation Module
// Provides functions used to create a new lobby.

const { makeGame } = require('./game-init-module');
const { COLORS, MIN_PLAYER, MIN_PLAYER_ADV_ROLES } = require('../utils');

const makeLobby = (creator) => {
  const lobby = {
    id: creator.myLobby,
    creatorId: creator.id,
    leader: creator.id,
    users: [creator],
    getUserBy(val, key='id') {
      const user = this.users.find(u => u[key] === val);
      if (!user) {
        return console.log(`ERR! ${this.id}: no user with '${key}:${val}' found`);
      };
      return user;
    },
    numOnline() {
      return this.users.filter(u => u.isOnline === true).length;
    },
    numReady() {
      return this.users.filter(u => u.isReady === true).length;
    },
    usersOnline() {
      return this.users.filter(u => u.isOnline === true);
    },
    usersOffline() {
      return this.users.filter(u => u.isOnline === false);
    },
    usersReady() {
      return this.users.filter(u => u.isReady === true);
    },
    usersUnReady() {
      return this.users.filter(u => u.isReady === false);
    },
    canUseAdvRoles() {
      return this.numOnline() >= this.minPlayerAdvRoles;
    },
    minPlayersOnline() {
      return this.numOnline() >= this.minPlayer;
    },
    minPlayersReady() {
      return this.numReady() >= this.minPlayer;
    },
    canStart() {
      return (this.numReady() >= 3) && (this.numReady() === this.numOnline());
    },
    resetSettings() {
      const ghost = this.users.find(u => u.isAssignedToGhost === true);
      if (ghost) ghost.isAssignedToGhost = false;
      return initSettings(this);
    },
    makeGame,
    gameOn: false,
    game: null,
    chat: [],
    createdAt: new Date().toLocaleTimeString(),
    minPlayer: MIN_PLAYER,
    minPlayerAdvRoles: MIN_PLAYER_ADV_ROLES,
    defaultSettings: {
      assignedToGhost: null,
      hasWitness: false,
      hasAccomplice: false,
      timer: {
        on: false,
        duration: 0,
        durationOpts: [0, 1, 2, 3, 4, 5],
      }
    },
    gameSettings: { ...this.defaultSettings },
  };

  initColors(lobby);
  initSettings(lobby);

  return lobby;
};

function initColors(lobby) {
  lobby.colors = COLORS.map(col => {
    return {
      id: col,
      isAssigned: false,
      assignedTo: []
    };
  });
};

function initSettings(lobby) {
  const defaultSettings = {
    assignedToGhost: null,
    hasWitness: false,
    hasAccomplice: false,
    timer: {
      on: false,
      duration: 0,
      minDuration: 0,
      maxDuration: 5
    }
  };
  lobby.gameSettings = defaultSettings;
};

exports.makeLobby = makeLobby;