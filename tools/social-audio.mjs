// The sound for tools/make-reel.mjs. River (the app's read-aloud voice) says each cover's and end card's line,
// reads every question, then only the right answer. Music plays under the whole Reel and dips while River talks.
export const AUDIO = {
  // Pick with --music <name>. Each is generated once at 60 s and cached.
  music: {
    quiz: "Playful, light game-show quiz music: pizzicato strings, marimba and soft glockenspiel, bouncy and friendly, 105 bpm, clean loop-friendly arrangement, instrumental",
    lofi: "Warm upbeat lo-fi hip hop study beat: mellow Rhodes piano, soft brushed drums, gentle bass, light vinyl crackle, cozy and focused, 88 bpm, instrumental",
    harvest: "Cheerful acoustic folk for an autumn harvest festival: banjo, acoustic guitar, hand claps and light whistling melody, warm and upbeat, 110 bpm, instrumental",
  },
  musicGain: 0.55,
  sfx: {
    whoosh: { text: "Quick soft swoosh, like swiping a card, clean and subtle", seconds: 0.6, gain: 0.3 },
    tick: { text: "Gentle clock ticking, steady, four ticks, soft game-show timer", seconds: 3, gain: 0.35 },
    chime: { text: "Bright short correct-answer chime, cheerful game show ding", seconds: 1, gain: 0.45 },
  },
  // Cover and end card lines, by post id and end card id.
  cover: {
    post13: { say: "Sunday study session. Three questions about the Supreme Court. Play along!", sfx: [{ text: "Soft autumn leaves rustling in a light breeze", seconds: 4, at: 0, gain: 0.3 }] },
    post14: { say: "Leftovers quiz! Three questions you can answer with a full plate.", sfx: [{ text: "Fork and knife clinking on a ceramic plate, cozy kitchen", seconds: 2, at: 0, gain: 0.4 }] },
    post15: { say: "Scout made a new friend! Help us pick a name.", sfx: [{ text: "A cartoon turkey gobbling happily, short and funny", seconds: 1.5, at: 3.6, gain: 0.7 }] },
    post16: { say: "Becoming a citizen? Here are three questions about the big day. Play along!", sfx: [{ text: "Soft autumn leaves rustling in a light breeze", seconds: 4, at: 0, gain: 0.3 }] },
    // Bilingual posts: Fernanda says the cover and end card lines.
    post17: { say: "La lista sesenta y cinco, veinte. Tres preguntas, en inglés y en español. ¡Juega con nosotros!", sfx: [{ text: "Soft autumn leaves rustling in a light breeze", seconds: 4, at: 0, gain: 0.3 }] },
    post18: { say: "Con un cafecito: tres preguntas sobre la ley y la Corte, en inglés y en español.", sfx: [{ text: "Coffee being poured into a ceramic mug, cozy morning", seconds: 2.5, at: 0, gain: 0.4 }] },
    post19: { say: "El presidente, en tres preguntas. Escucha cada una en inglés y en español.", sfx: [{ text: "Soft autumn leaves rustling in a light breeze", seconds: 4, at: 0, gain: 0.3 }] },
  },
  end: {
    "score-3-es": { say: "¿Cuántas acertaste? Comenta tu puntaje y practica con Scout. El link está en la bio.", sfx: [{ text: "Small crowd cheering and clapping, happy, short", seconds: 2, at: 0, gain: 0.35 }] },
    "score-3-voice": { say: "How many did you get? Comment your score, and practice with Scout. Link in bio.", sfx: [{ text: "Small crowd cheering and clapping, happy, short", seconds: 2, at: 0, gain: 0.35 }] },
    name: { say: "What should we call Scout's friend? Comment your best turkey name!", sfx: [{ text: "A cartoon turkey gobbling happily, short and funny", seconds: 1.5, at: 4.4, gain: 0.7 }] },
  },
};
