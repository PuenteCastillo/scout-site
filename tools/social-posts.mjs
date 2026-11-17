// Content for tools/make-social.mjs. Questions and right answers come word for word from the app's official list
// (scout-us-citizenship-test/src/data/questions.ts). `right` is the index of the correct option.
export const POSTS = [
  {
    id: "post9", // Mayflower to the Constitution
    theme: "classic",
    end: { id: "score-3", sub: "Comment your score: 0, 1, 2 or 3 out of 3." },
    cover: {
      layout: "band", photo: "family-table.jpg", focus: "center 30%",
      title: "The Pilgrims are on the citizenship test.",
      sub: "Well, their Mayflower Compact is. 3 real questions with Thanksgiving roots.",
    },
    questions: [
      { n: 14, q: "Many documents influenced the U.S. Constitution. Name one.",
        options: ["Emancipation Proclamation", "Gettysburg Address", "Mayflower Compact", "Monroe Doctrine"], right: 2,
        why: "The Pilgrims signed it in 1620, aboard ship, before they came ashore. They agreed to make their own laws together." },
      { n: 117, q: "Name one American Indian tribe in the United States.",
        options: ["Aztec", "Cherokee", "Inca", "Maya"], right: 1,
        why: "The Wampanoag people shared the 1621 harvest with the Pilgrims. The test's list includes Cherokee, Navajo, Lakota and more." },
      { n: 124, q: "The Nation’s first motto was “E Pluribus Unum.” What does that mean?",
        options: ["In God we trust", "Out of many, one", "Liberty and justice for all", "Land of the free"], right: 1,
        label: "BONUS", why: "It's on the Great Seal of the United States and on U.S. coins. A good one for a table full of family." },
    ],
  },
  {
    id: "post10", // Thanksgiving history through famous Americans
    theme: "harvest",
    end: { id: "score-3", sub: "Comment your score: 0, 1, 2 or 3 out of 3." },
    cover: {
      layout: "full", photo: "flag-porch.jpg", focus: "35% center", eyebrow: "THANKSGIVING HISTORY",
      title: "3 famous Americans.\n3 Thanksgiving stories.",
      sub: "Real questions from the official citizenship test, with a side of holiday history.",
    },
    questions: [
      { n: 94, q: "Abraham Lincoln is famous for many things. Name one.",
        options: ["First president of the United States", "Wrote the Declaration of Independence", "Freed the slaves", "President during World War II"], right: 2,
        why: "In 1863, in the middle of the Civil War, Lincoln proclaimed a national Thanksgiving on the last Thursday of November." },
      { n: 85, q: "Benjamin Franklin is famous for many things. Name one.",
        options: ["First president of the United States", "Inventor", "Third president of the United States", "Led the army at Yorktown"], right: 1,
        why: "In a 1784 letter, Franklin called the turkey a more respectable bird than the bald eagle. Scout respectfully disagrees." },
      { n: 105, q: "Who was president during the Great Depression and World War II?",
        options: ["Dwight Eisenhower", "Abraham Lincoln", "Franklin Roosevelt", "Woodrow Wilson"], right: 2,
        label: "BONUS", why: "In 1939 he moved Thanksgiving a week earlier. In 1941 Congress set it on the fourth Thursday of November, where it is today." },
    ],
  },
  {
    id: "post11", // Thanksgiving table quiz (save-and-share)
    theme: "harvest",
    end: { id: "score-5", eyebrow: "YOUR TABLE'S SCORE", title: "How did your table do?", sub: "Comment your family's score out of 5." },
    cover: {
      layout: "placecard", photo: "table-overhead.jpg", eyebrow: "THANKSGIVING TABLE QUIZ",
      title: "Could your family pass the citizenship test?",
      sub: "5 real questions to read out loud at the table. Save this for Thursday.",
    },
    menus: [
      { name: "questions", photo: "table-overhead.jpg", eyebrow: "ASK THE TABLE", title: "Read these out loud.", note: "From the official list", next: "Answers",
        items: [
          { q: "What is the name of the national anthem?" },
          { q: "Why does the flag have 50 stars?" },
          { q: "Where is the Statue of Liberty?" },
          { q: "What founding document said the American colonies were free from Britain?" },
          { q: "What is Veterans Day?" },
        ] },
      { name: "answers", photo: "table-overhead.jpg", eyebrow: "ANSWERS", title: "How did they do?", answers: true, note: "Questions #123, 122, 120, 9, 128", next: "Your score",
        items: [
          { q: "What is the name of the national anthem?", a: "The Star-Spangled Banner" },
          { q: "Why does the flag have 50 stars?", a: "One star for each state" },
          { q: "Where is the Statue of Liberty?", a: "New York Harbor (Liberty Island)" },
          { q: "What founding document said the colonies were free from Britain?", a: "The Declaration of Independence" },
          { q: "What is Veterans Day?", a: "Honors people who served in the U.S. military" },
        ] },
    ],
  },
  {
    id: "post12", // Thanksgiving Day card
    end: { id: "holiday", eyebrow: "FROM SCOUT", title: "Studying over the holiday?", sub: "Practice a few questions between slices of pie." },
    cover: {
      layout: "polaroid", photo: "grandma-hug.jpg", focus: "center 35%", caption: "Thankful",
      eyebrow: "HAPPY THANKSGIVING",
      title: "Thankful for every future citizen.",
      sub: "Feliz Día de Acción de Gracias. Whoever you're studying with this week, you've got this.",
    },
  },
  {
    id: "post13", // Sunday study: the Supreme Court
    theme: "classic",
    end: { id: "score-3-voice", sub: "Comment your score: 0, 1, 2 or 3 out of 3." },
    cover: {
      layout: "sheet", photo: "supreme-court.jpg", focus: "center 40%", eyebrow: "SUNDAY STUDY SESSION",
      title: "The Supreme Court\nin 3 questions.",
      sub: "Grab a coffee. These are real questions from the official citizenship test.",
    },
    questions: [
      { n: 52, q: "What is the highest court in the United States?",
        options: ["Court of Appeals", "Supreme Court", "District Court", "State Court"], right: 1,
        why: "It has the final word on cases about the Constitution and federal law. It meets in Washington, D.C." },
      { n: 53, q: "How many seats are on the Supreme Court?",
        options: ["Five (5)", "Seven (7)", "Nine (9)", "Twelve (12)"], right: 2,
        why: "One Chief Justice and eight associate justices. The number has been nine since 1869." },
      { n: 55, q: "How long do Supreme Court justices serve?",
        options: ["Four (4) years", "Ten (10) years", "For life", "Until the next President"], right: 2,
        label: "BONUS", why: "Serving for life keeps them independent of politics. That's question #56 on the test." },
    ],
  },
  {
    id: "post14", // Leftovers quiz
    theme: "harvest",
    end: { id: "score-3-voice", sub: "Comment your score: 0, 1, 2 or 3 out of 3." },
    cover: {
      layout: "plate", photo: "feast-overhead.jpg", eyebrow: "LEFTOVERS QUIZ",
      title: "3 questions you can answer with a full plate.",
      sub: "Real questions from the U.S. citizenship test. No second helpings needed.",
    },
    questions: [
      { n: 119, q: "What is the capital of the United States?",
        options: ["New York City", "Washington, D.C.", "Philadelphia", "Boston"], right: 1,
        why: "The government moved there in 1800. D.C. stands for District of Columbia, and it isn't part of any state." },
      { n: 118, q: "Name one example of an American innovation.",
        options: ["The printing press", "Gunpowder", "Light bulb", "The compass"], right: 2,
        why: "The list also accepts the airplane, the automobile, skyscrapers, the assembly line, the moon landing and the integrated circuit." },
      { n: 31, q: "Who does a U.S. senator represent?",
        options: ["Only people who voted for them", "Citizens of their state", "Citizens of one congressional district", "The President"], right: 1,
        label: "BONUS", why: "Every state has two senators, no matter its size. That's why there are 100." },
    ],
  },
  {
    id: "post15", // Help name Scout's turkey friend
    end: { id: "name", eyebrow: "HELP US OUT", title: "What should we call Scout's friend?", sub: "Comment your best turkey name. We'll pick a favorite." },
    cover: {
      layout: "nametag", eyebrow: "SAY HELLO",
      title: "Scout made a new friend.",
      sub: "They showed up for Thanksgiving and stayed to study. Help us pick a name.",
    },
  },
  {
    id: "post16", // Becoming a citizen
    theme: "night",
    end: { id: "score-3-voice", sub: "Comment your score: 0, 1, 2 or 3 out of 3." },
    cover: {
      layout: "arch", photo: "capitol-sunset.jpg", focus: "center 30%", eyebrow: "BECOMING A CITIZEN",
      title: "3 questions about\nthe big day.",
      sub: "From green card to citizen: real questions from the official test.",
    },
    questions: [
      { n: 68, q: "How can people become United States citizens?",
        options: ["Buy property in the United States", "Get a job in the United States", "Naturalize", "Visit the United States for one year"], right: 2,
        why: "Most new citizens naturalize: they apply with Form N-400, then pass the interview and the civics test." },
      { n: 64, q: "Who can vote in federal elections, run for federal office, and serve on a jury in the United States?",
        options: ["Permanent residents", "Citizens", "Anyone living in the U.S.", "Visitors with a visa"], right: 1,
        why: "Those three are for citizens only. Many oath ceremonies help new citizens register to vote that same day." },
      { n: 97, q: "What amendment says all persons born or naturalized in the United States are U.S. citizens?",
        options: ["1st Amendment", "14th Amendment", "19th Amendment", "22nd Amendment"], right: 1,
        label: "BONUS", why: "Ratified in 1868, it covers both people born here and people who naturalize." },
    ],
  },
  // Bilingual posts (lang "es"): Spanish covers and labels; every question in the official English and Spanish
  // wording (scout-us-citizenship-test/src/data/questions.es.ts).
  {
    id: "post17", lang: "es", theme: "night", // La lista 65/20
    end: { id: "score-3-es", lang: "es", eyebrow: "TU PUNTAJE", title: "¿Cuántas acertaste?", sub: "Comenta tu puntaje: 0, 1, 2 o 3 de 3." },
    cover: {
      layout: "arch", photo: "grandmother-smile.jpg", focus: "center 35%", eyebrow: "EN INGLÉS Y ESPAÑOL",
      title: "La lista 65/20:\n3 preguntas clave.",
      sub: "¿65 años o más y 20 o más con tarjeta verde? Solo estudias 20 preguntas. Aquí van 3.",
    },
    questions: [
      { n: 12, q: "What is the economic system of the United States?", options: ["Communism", "Socialism", "Capitalism", "Feudalism"], right: 2,
        es: { q: "¿Cuál es el sistema económico de los Estados Unidos?", options: ["Comunismo", "Socialismo", "Capitalismo", "Feudalismo"],
          why: "También se acepta «economía de libre mercado». Es una de las 20 preguntas de la lista 65/20." } },
      { n: 44, q: "Who vetoes bills?", options: ["The Supreme Court", "The Senate", "The President", "The Vice President"], right: 2,
        es: { q: "¿Quién veta los proyectos de ley?", options: ["La Corte Suprema", "El Senado", "El Presidente", "El Vicepresidente"],
          why: "El Congreso puede anular un veto con dos tercios de los votos en cada cámara." } },
      { n: 66, q: "What do we show loyalty to when we say the Pledge of Allegiance?", options: ["The President", "The United States", "The state you live in", "The military"], right: 1, label: "BONUS",
        es: { q: "¿A qué mostramos lealtad cuando decimos el Juramento a la Bandera (Pledge of Allegiance)?", options: ["Al Presidente", "A los Estados Unidos", "Al estado donde usted vive", "A las fuerzas armadas"],
          why: "También se acepta «a la bandera». Las dos respuestas cuentan." } },
    ],
  },
  {
    id: "post18", lang: "es", theme: "classic", // La ley y la Corte
    end: { id: "score-3-es", lang: "es", eyebrow: "TU PUNTAJE", title: "¿Cuántas acertaste?", sub: "Comenta tu puntaje: 0, 1, 2 o 3 de 3." },
    cover: {
      layout: "band", photo: "coffee-book.jpg", focus: "center 40%", eyebrow: "EN INGLÉS Y ESPAÑOL",
      title: "Con un cafecito:\nla ley y la Corte.",
      sub: "3 preguntas reales del examen de ciudadanía, en inglés y en español.",
    },
    questions: [
      { n: 13, q: "What is the rule of law?", options: ["The President is above the law.", "No one is above the law.", "Only judges must follow the law.", "The military makes the laws."], right: 1,
        es: { q: "¿En qué consiste el Estado de derecho?", options: ["El Presidente está por encima de la ley.", "Nadie está por encima de la ley.", "Solo los jueces deben cumplir la ley.", "Los militares hacen las leyes."],
          why: "Todos, incluso los líderes y el gobierno, deben cumplir la ley." } },
      { n: 6, q: "What does the Bill of Rights protect?", options: ["The powers of the President", "The borders of the United States", "The basic rights of Americans", "The national budget"], right: 2,
        es: { q: "¿Qué protege la Carta de Derechos?", options: ["Los poderes del Presidente", "Las fronteras de los Estados Unidos", "Los derechos básicos de los estadounidenses", "El presupuesto nacional"],
          why: "Son las primeras 10 enmiendas a la Constitución, aprobadas en 1791." } },
      { n: 54, q: "How many Supreme Court justices are usually needed to decide a case?", options: ["Three (3)", "Five (5)", "Seven (7)", "Nine (9)"], right: 1, label: "BONUS",
        es: { q: "¿Cuántos jueces de la Corte Suprema se necesitan normalmente para decidir un caso?", options: ["Tres (3)", "Cinco (5)", "Siete (7)", "Nueve (9)"],
          why: "Hay nueve jueces, y se decide por mayoría: cinco de nueve." } },
    ],
  },
  {
    id: "post19", lang: "es", theme: "harvest", // El presidente
    end: { id: "score-3-es", lang: "es", eyebrow: "TU PUNTAJE", title: "¿Cuántas acertaste?", sub: "Comenta tu puntaje: 0, 1, 2 o 3 de 3." },
    cover: {
      layout: "full", photo: "white-house.jpg", focus: "center 60%", eyebrow: "EN INGLÉS Y ESPAÑOL",
      title: "El presidente\nen 3 preguntas.",
      sub: "Practica como en la entrevista: escucha cada pregunta en inglés y en español.",
    },
    questions: [
      { n: 40, q: "If the president can no longer serve, who becomes president?", options: ["The Speaker of the House", "The Chief Justice", "The Vice President", "The Secretary of State"], right: 2,
        es: { q: "Si el Presidente ya no puede cumplir sus funciones, ¿quién se convierte en Presidente?", options: ["El Presidente de la Cámara", "El Presidente de la Corte Suprema", "El Vicepresidente", "El Secretario de Estado"],
          why: "El Vicepresidente es el primero en la línea de sucesión. Le sigue el Presidente de la Cámara." } },
      { n: 42, q: "Who is Commander in Chief of the U.S. military?", options: ["The Vice President", "The President", "The Secretary of War", "The Speaker of the House"], right: 1,
        es: { q: "¿Quién es el Comandante en Jefe de las fuerzas armadas de los Estados Unidos?", options: ["El Vicepresidente", "El Presidente", "El Secretario de Guerra", "El Presidente de la Cámara"],
          why: "El Presidente dirige las fuerzas armadas, pero solo el Congreso puede declarar la guerra." } },
      { n: 47, q: "What does the President’s Cabinet do?", options: ["Writes laws", "Advises the President", "Interprets the Constitution", "Elects the President"], right: 1, label: "BONUS",
        es: { q: "¿Qué hace el Gabinete del Presidente?", options: ["Escribe las leyes", "Asesora al Presidente", "Interpreta la Constitución", "Elige al Presidente"],
          why: "El Gabinete reúne a los jefes de los departamentos federales, como el Secretario de Estado." } },
    ],
  },
];
