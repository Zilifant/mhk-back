// Lobby Initiation Module
// Provides functions used to create a new lobby.

const { makeGame } = require('./game-init-module');

const makeLobby = (creator, isDemo) => {
  const lobby = {
    id: creator.myLobby,
    isDemo: isDemo,
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
    usersOffline() {
      return this.users.filter(u => u.isOnline === false);
    },
    usersReady() {
      return this.users.filter(u => u.isReady === true);
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
      // If a user was assigned to Ghost, reset that setting on the user object.
      const ghost = this.users.find(u => u.isAssignedToGhost === true);
      if (ghost) ghost.isAssignedToGhost = false;
      // Reset all settings on the lobby object.
      return initSettings(this);
    },
    makeGame,
    gameOn: false,
    game: null,
    chat: [],
    createdAt: new Date().toLocaleTimeString(),
    minPlayer: 4,
    minPlayerAdvRoles: 5,
    gameSettings: null,
  };

  initColors(lobby);
  initSettings(lobby);

  return lobby;
};

// Each user has a unique color.
// TO DO: Bring all color logic into one file.
function initColors(lobby) {
  const COLORS = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'cyan',
    'emerald', 'violet', 'rose', 'amber'
  ];
  lobby.colors = COLORS.map(col => {
    return {
      id: col,
      isAssigned: false,
      assignedTo: []
    };
  });
};

// TO DO: refactor this; it is needlessly complex.
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