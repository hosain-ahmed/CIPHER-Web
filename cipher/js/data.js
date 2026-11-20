// Shared seed data and localStorage overlay for the frontend demo.
window.CIPHER_DATA = {
  me: { name: "0xK3Y_N0D3", xp: 450, coins: 65 },
  missions: [
    { id: "C-101", title: "Caesar's First Shift", subtitle: "Affine & modular shift vectors", category: "Cryptography", difficulty: "Easy", xp: 50, coins: 15, solved: true,
      description: "An intercepted communication contains an encoded string that was rotated using a simple substitution cipher. Analyze the ciphertext below and determine the original plaintext message.",
      payload: "KHOOR ZRUOG - WKLV LV D WHVW PHVVDJH",
      hint: "Each letter was moved forward by the same small number of places in the alphabet.",
      answer: "HELLO WORLD - THIS IS A TEST MESSAGE" },
    { id: "B-204", title: "Header Traversal Injection", subtitle: "CRLF protocol desynchronization", category: "Web Security", difficulty: "Medium", xp: 120, coins: 40, solved: false },
    { id: "L-302", title: "Boolean Satisfiability Gate", subtitle: "3-CNF formula solver & truth tables", category: "Logic", difficulty: "Medium", xp: 150, coins: 45, solved: true },
    { id: "R-410", title: "ARM Thumb Disassembly Trace", subtitle: "Dynamic binary instrumentation & registers", category: "Reverse Engineering", difficulty: "Hard", xp: 280, coins: 90, solved: false },
    { id: "F-108", title: "Pcap DNS Exfiltration Stream", subtitle: "Base32 tunnel payload reconstruction", category: "Forensics", difficulty: "Easy", xp: 60, coins: 20, solved: false },
    { id: "C-105", title: "Vigenère Polyalphabetic Stream", subtitle: "Kasiski examination & index of coincidence", category: "Cryptography", difficulty: "Medium", xp: 140, coins: 35, solved: false },
    { id: "W-202", title: "Cookie Tampering & Deserialization", subtitle: "Python pickle gadget chains execution", category: "Web Security", difficulty: "Hard", xp: 250, coins: 80, solved: false },
    { id: "L-305", title: "Finite State Machine Reachability", subtitle: "NFA to DFA state minimization", category: "Logic", difficulty: "Easy", xp: 75, coins: 25, solved: true },
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
  const KEY = { missions: "cipherMissions", bounties: "cipherBounties" };

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

  function merge(base, saved) {
    const baseItems = base || [];
    const savedById = new Map((saved || []).map((item) => [String(item.id), item]));
    const baseIds = new Set(baseItems.map((item) => String(item.id)));
    const created = (saved || []).filter((item) => !baseIds.has(String(item.id)));
    const updated = baseItems.map((item) => {
      const override = savedById.get(String(item.id));
      return override ? { ...item, ...override } : item;
    });
    return [...created, ...updated];
  }

  function save(key, item) {
    const id = String(item.id);
    const list = read(key).filter((entry) => String(entry.id) !== id);
    write(key, [item, ...list]);
  }

  return {
    missions: (base) => merge(base || window.CIPHER_DATA.missions, read(KEY.missions)),
    bounties: (base) => merge(base || window.CIPHER_DATA.bounties, read(KEY.bounties)),
    findMission(id) {
      return merge(window.CIPHER_DATA.missions, read(KEY.missions))
        .find((mission) => String(mission.id) === String(id));
    },
    findBounty(id) {
      return merge(window.CIPHER_DATA.bounties, read(KEY.bounties))
        .find((bounty) => String(bounty.id) === String(id));
    },
    saveMission(mission) { save(KEY.missions, mission); },
    saveBounty(bounty) { save(KEY.bounties, bounty); },
  };
})();
