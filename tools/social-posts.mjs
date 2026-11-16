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
];
