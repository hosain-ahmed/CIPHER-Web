window.CIPHER_DATA = {
  me: { name: "0xK3Y_N0D3", xp: 0, coins: 100 },

  missions: [
    {
      id: "C-101",
      title: "Caesar's First Shift",
      subtitle: "Affine & modular shift vectors",
      category: "Cryptography",
      difficulty: "Easy",
      xp: 50,
      coins: 15,
      description: "An intercepted communication contains an encoded string that was rotated using a simple substitution cipher. Analyze the ciphertext below and determine the original plaintext message.",
      payload: "KHOOR ZRUOG - WKLV LV D WHVW PHVVDJH",
      hint: "Each letter was moved forward by the same small number of places in the alphabet.",
      answer: "HELLO WORLD - THIS IS A TEST MESSAGE"
    },
    {
      id: "B-204",
      title: "Header Traversal Injection",
      subtitle: "CRLF protocol desynchronization",
      category: "Web Security",
      difficulty: "Medium",
      xp: 120,
      coins: 40
    },
    {
      id: "L-302",
      title: "Boolean Satisfiability Gate",
      subtitle: "3-CNF formula solver & truth tables",
      category: "Logic",
      difficulty: "Medium",
      xp: 150,
      coins: 45
    },
    {
      id: "R-410",
      title: "ARM Thumb Disassembly Trace",
      subtitle: "Dynamic binary instrumentation & registers",
      category: "Reverse Engineering",
      difficulty: "Hard",
      xp: 280,
      coins: 90
    },
    {
      id: "F-108",
      title: "Pcap DNS Exfiltration Stream",
      subtitle: "Base32 tunnel payload reconstruction",
      category: "Forensics",
      difficulty: "Easy",
      xp: 60,
      coins: 20
    },
    {
      id: "C-105",
      title: "Vigenère Polyalphabetic Stream",
      subtitle: "Kasiski examination & index of coincidence",
      category: "Cryptography",
      difficulty: "Medium",
      xp: 140,
      coins: 35
    },
    {
      id: "W-202",
      title: "Cookie Tampering & Deserialization",
      subtitle: "Python pickle gadget chains execution",
      category: "Web Security",
      difficulty: "Hard",
      xp: 250,
      coins: 80
    },
    {
      id: "L-305",
      title: "Finite State Machine Reachability",
      subtitle: "NFA to DFA state minimization",
      category: "Logic",
      difficulty: "Easy",
      xp: 75,
      coins: 25
    }
  ],

  bounties: [
    {
      id: 1,
      title: "SQLite blind injection payload",
      postedBy: "byte_runner",
      reward: 120,
      status: "open",
      description: "Find a working blind SQLite injection payload against the lab endpoint and document the extraction steps."
    },
    {
      id: 2,
      title: "State machine minimizer optimization",
      postedBy: "zero_alex",
      reward: 80,
      status: "open",
      description: "Optimize the state machine minimizer and submit the smallest equivalent DFA."
    },
    {
      id: 3,
      title: "Deobfuscate MIPS shellcode sample",
      postedBy: "staff_admin",
      reward: 150,
      status: "open",
      description: "Deobfuscate the provided MIPS shellcode sample and explain its behaviour."
    },
    {
      id: 4,
      title: "Truncated hash collision solver",
      postedBy: "node_sentry",
      reward: 100,
      status: "open",
      description: "Build a collision for the truncated hash variant used in the warm-up service."
    },
    {
      id: 5,
      title: "SHA-1 near-collision test vector",
      postedBy: "u21_raskar",
      reward: 200,
      status: "claimed",
      description: "Provide a near-collision test vector for the legacy SHA-1 checker."
    }
  ],

  shop: [
    {
      id: 1,
      name: "Ghost Protocol",
      effect: "Hide your activity and solve attempts from public logs for 24 hours.",
      price: 40
    },
    {
      id: 2,
      name: "Mission Skip",
      effect: "Unlock the next mission without completing the prerequisite challenge.",
      price: 50
    },
    {
      id: 3,
      name: "XP Boost",
      effect: "Earn 25% bonus XP on your next three verified mission solves.",
      price: 30
    },
    {
      id: 4,
      name: "Bounty Rush",
      effect: "Reduce cool-down time between consecutive bounty submissions.",
      price: 25
    }
  ]
};

const CIPHER_MISSIONS_KEY = "cipherMissionsV2";
const CIPHER_BOUNTIES_KEY = "cipherBountiesV2";
const CIPHER_AUTH_KEY = "cipherLoggedIn";
const CIPHER_AGENT_KEY = "cipherAgent";

function readData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) {
      return fallback;
    }
    return JSON.parse(saved);
  } catch (error) {
    return fallback;
  }
}

function writeData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Could not save data", error);
  }
}

function readText(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeText(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn("Could not save text", error);
  }
}

function removeText(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Could not remove text", error);
  }
}

function loadList(key, seedList) {
  const saved = readData(key, null);

  if (saved === null || !Array.isArray(saved)) {
    const copy = seedList.slice();
    writeData(key, copy);
    return copy;
  }

  return saved;
}

function saveListItem(key, seedList, item) {
  const list = loadList(key, seedList);
  const id = String(item.id);
  const index = list.findIndex(function (entry) {
    return String(entry.id) === id;
  });

  if (index === -1) {
    list.unshift(item);
  } else {
    list[index] = item;
  }

  writeData(key, list);
}

function isLoggedIn() {
  return readText(CIPHER_AUTH_KEY) === "1";
}

function login(codename) {
  writeText(CIPHER_AUTH_KEY, "1");
  writeText(CIPHER_AGENT_KEY, codename);
}

function logout() {
  removeText(CIPHER_AUTH_KEY);
  removeText(CIPHER_AGENT_KEY);
  removeText("cipherRole");
}

function getCurrentUser() {
  const base = CIPHER_DATA.me;

  if (!isLoggedIn()) {
    return { name: "Guest", xp: 0, coins: 0, role: "user" };
  }

  const name = readText(CIPHER_AGENT_KEY) || base.name;
  const role = readText("cipherRole") || "admin";
  return { name: name, xp: base.xp, coins: base.coins, role: role };
}

function getSolvedKey() {
  const agent = readText(CIPHER_AGENT_KEY);
  if (!agent) {
    return null;
  }
  return "cipherSolved:" + agent;
}

function getSolvedIds() {
  const key = getSolvedKey();
  if (!key) {
    return [];
  }
  return readData(key, []);
}

function isSolved(id) {
  return getSolvedIds().includes(String(id));
}

function markSolved(id) {
  const key = getSolvedKey();
  if (!key) {
    return;
  }

  const solved = getSolvedIds();
  const value = String(id);

  if (!solved.includes(value)) {
    solved.push(value);
    writeData(key, solved);
  }
}

function updateAuthLinks() {
  const links = document.querySelectorAll(".nav-logout");

  links.forEach(function (link) {
    if (isLoggedIn()) {
      link.textContent = "Log out";
      link.href = "login.html?logout=1";
    } else {
      link.textContent = "Log in";
      link.href = "login.html";
    }
  });
}

window.CIPHER = {
  isLoggedIn: isLoggedIn,
  login: login,
  logout: logout,
  me: getCurrentUser,

  missions: function () {
    return loadList(CIPHER_MISSIONS_KEY, CIPHER_DATA.missions);
  },

  bounties: function () {
    return loadList(CIPHER_BOUNTIES_KEY, CIPHER_DATA.bounties);
  },

  findMission: function (id) {
    return CIPHER.missions().find(function (mission) {
      return String(mission.id) === String(id);
    });
  },

  findBounty: function (id) {
    return CIPHER.bounties().find(function (bounty) {
      return String(bounty.id) === String(id);
    });
  },

  saveMission: function (mission) {
    saveListItem(CIPHER_MISSIONS_KEY, CIPHER_DATA.missions, mission);
  },

  saveBounty: function (bounty) {
    saveListItem(CIPHER_BOUNTIES_KEY, CIPHER_DATA.bounties, bounty);
  },

  deleteMission: function (id) {
    const missions = CIPHER.missions().filter(function (mission) {
      return String(mission.id) !== String(id);
    });
    writeData(CIPHER_MISSIONS_KEY, missions);
  },

  isSolved: isSolved,
  markSolved: markSolved
};

updateAuthLinks();
