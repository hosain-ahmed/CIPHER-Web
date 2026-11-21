// Shared seed data and localStorage overlay for the frontend demo.
window.CIPHER_DATA = {
  me: { name: "0xK3Y_N0D3", xp: 0, coins: 100 },
  missions: [
    { id: "C-101", title: "Caesar's First Shift", subtitle: "Affine & modular shift vectors", category: "Cryptography", difficulty: "Easy", xp: 50, coins: 15,
      description: "An intercepted communication contains an encoded string that was rotated using a simple substitution cipher. Analyze the ciphertext below and determine the original plaintext message.",
      payload: "KHOOR ZRUOG - WKLV LV D WHVW PHVVDJH",
      hint: "Each letter was moved forward by the same small number of places in the alphabet.",
      answer: "HELLO WORLD - THIS IS A TEST MESSAGE" },
    { id: "B-204", title: "Header Traversal Injection", subtitle: "CRLF protocol desynchronization", category: "Web Security", difficulty: "Medium", xp: 120, coins: 40 },
    { id: "L-302", title: "Boolean Satisfiability Gate", subtitle: "3-CNF formula solver & truth tables", category: "Logic", difficulty: "Medium", xp: 150, coins: 45 },
    { id: "R-410", title: "ARM Thumb Disassembly Trace", subtitle: "Dynamic binary instrumentation & registers", category: "Reverse Engineering", difficulty: "Hard", xp: 280, coins: 90 },
    { id: "F-108", title: "Pcap DNS Exfiltration Stream", subtitle: "Base32 tunnel payload reconstruction", category: "Forensics", difficulty: "Easy", xp: 60, coins: 20 },
    { id: "C-105", title: "Vigenère Polyalphabetic Stream", subtitle: "Kasiski examination & index of coincidence", category: "Cryptography", difficulty: "Medium", xp: 140, coins: 35 },
    { id: "W-202", title: "Cookie Tampering & Deserialization", subtitle: "Python pickle gadget chains execution", category: "Web Security", difficulty: "Hard", xp: 250, coins: 80 },
    { id: "L-305", title: "Finite State Machine Reachability", subtitle: "NFA to DFA state minimization", category: "Logic", difficulty: "Easy", xp: 75, coins: 25 },
  ],
  bounties: [
    { id: 1, title: "SQLite blind injection payload", postedBy: "byte_runner", reward: 120, status: "open",
      description: "Find a working blind SQLite injection payload against the lab endpoint and document the extraction steps." },
    { id: 2, title: "State machine minimizer optimization", postedBy: "zero_alex", reward: 80, status: "open",
      description: "Optimize the state machine minimizer and submit the smallest equivalent DFA." },
    { id: 3, title: "Deobfuscate MIPS shellcode sample", postedBy: "staff_admin", reward: 150, status: "open",
      description: "Deobfuscate the provided MIPS shellcode sample and explain its behaviour." },
    { id: 4, title: "Truncated hash collision solver", postedBy: "node_sentry", reward: 100, status: "open",
      description: "Build a collision for the truncated hash variant used in the warm-up service." },
    { id: 5, title: "SHA-1 near-collision test vector", postedBy: "u21_raskar", reward: 200, status: "claimed",
      description: "Provide a near-collision test vector for the legacy SHA-1 checker." },
  ],
};

// Created items persist in localStorage until the PHP API is connected.
window.CIPHER = (function () {
  const KEY = {
    missions: "cipherMissions",
    bounties: "cipherBounties",
    hiddenMissions: "cipherHiddenMissions",
    auth: "cipherLoggedIn",
    agent: "cipherAgent",
  };

  function read(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (e) {
      return [];
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  }

  function merge(base, saved, hiddenIds) {
    const hidden = hiddenIds || new Set();
    const baseItems = (base || []).filter((item) => !hidden.has(String(item.id)));
    const savedItems = (saved || []).filter((item) => !hidden.has(String(item.id)));
    const savedById = new Map(savedItems.map((item) => [String(item.id), item]));
    const baseIds = new Set(baseItems.map((item) => String(item.id)));
    const created = savedItems.filter((item) => !baseIds.has(String(item.id)));
    const updated = baseItems.map((item) => {
      const override = savedById.get(String(item.id));
      return override ? { ...item, ...override } : item;
    });
    return [...created, ...updated];
  }

  function hiddenMissions() {
    return new Set(read(KEY.hiddenMissions).map(String));
  }

  function save(key, item) {
    const id = String(item.id);
    const list = read(key).filter((entry) => String(entry.id) !== id);
    write(key, [item, ...list]);
  }

  function isLoggedIn() {
    try {
      return localStorage.getItem(KEY.auth) === "1";
    } catch (e) {
      return false;
    }
  }

  function login(codename) {
    try {
      localStorage.setItem(KEY.auth, "1");
      if (codename) localStorage.setItem(KEY.agent, codename);
    } catch (e) {
      console.warn("Could not store the login state", e);
    }
  }

  function logout() {
    try {
      localStorage.removeItem(KEY.auth);
      localStorage.removeItem(KEY.agent);
      localStorage.removeItem("cipherRole");
    } catch (e) {
      console.warn("Could not clear the login state", e);
    }
  }

  function currentUser(fallback) {
    const base = fallback || window.CIPHER_DATA.me;
    if (!isLoggedIn()) {
      return { ...base, name: "Guest", xp: 0, coins: 0, role: "user" };
    }
    let name = base.name;
    let role = base.role;
    try {
      name = localStorage.getItem(KEY.agent) || name;
      role = localStorage.getItem("cipherRole") || role;
    } catch (e) {}
    return { ...base, name, role };
  }

  function solvedKey() {
    try {
      const agent = localStorage.getItem(KEY.agent);
      return agent ? "cipherSolved:" + agent : null;
    } catch (e) {
      return null;
    }
  }

  function solvedIds() {
    const key = solvedKey();
    return key ? read(key).map(String) : [];
  }

  function isSolved(id) {
    return solvedIds().includes(String(id));
  }

  function markSolved(id) {
    const key = solvedKey();
    if (!key) return;
    const value = String(id);
    const ids = solvedIds();
    if (!ids.includes(value)) write(key, [...ids, value]);
  }

  return {
    isLoggedIn,
    login,
    logout,
    me: currentUser,
    isSolved,
    markSolved,
    missions: (base) => merge(base || window.CIPHER_DATA.missions, read(KEY.missions), hiddenMissions()),
    bounties: (base) => merge(base || window.CIPHER_DATA.bounties, read(KEY.bounties)),
    findMission(id) {
      if (hiddenMissions().has(String(id))) return undefined;
      return merge(window.CIPHER_DATA.missions, read(KEY.missions))
        .find((mission) => String(mission.id) === String(id));
    },
    findBounty(id) {
      return merge(window.CIPHER_DATA.bounties, read(KEY.bounties))
        .find((bounty) => String(bounty.id) === String(id));
    },
    saveMission(mission) {
      const id = String(mission.id);
      write(KEY.hiddenMissions, read(KEY.hiddenMissions).filter((entry) => String(entry) !== id));
      save(KEY.missions, mission);
    },
    saveBounty(bounty) { save(KEY.bounties, bounty); },
    deleteMission(id) {
      const key = String(id);
      write(KEY.hiddenMissions, [...new Set([...read(KEY.hiddenMissions).map(String), key])]);
      write(KEY.missions, read(KEY.missions).filter((entry) => String(entry.id) !== key));
    },
  };
})();

(function () {
  function updateAuthLinks() {
    const loggedIn = window.CIPHER.isLoggedIn();
    document.querySelectorAll(".nav-logout").forEach((link) => {
      if (loggedIn) {
        link.textContent = "Log out";
        link.href = "login.html?logout=1";
      } else {
        link.textContent = "Log in";
        link.href = "login.html";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateAuthLinks);
  } else {
    updateAuthLinks();
  }
})();
