export const GRADE_OPTIONS = [9, 10, 11, 12];

export const SUBJECT_LABELS = {
  "Khmer Literature": "អក្សរសាស្ត្រខ្មែរ",
  Mathematics: "គណិតវិទ្យា",
  Physics: "រូបវិទ្យា",
  Chemistry: "គីមីវិទ្យា",
  Biology: "ជីវវិទ្យា",
  History: "ប្រវត្តិវិទ្យា",
  Geography: "ភូមិវិទ្យា",
  "Moral-Civics": "សីលធម៌-ពលរដ្ឋវិជ្ជា",
  "Earth and Environmental Science": "ផែនដី និងបរិស្ថានវិទ្យា",
  English: "ភាសាបរទេស / ភាសាអង់គ្លេស",
};

export const SUBJECTS_BY_GRADE = {
  9: [
    "Khmer Literature",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Moral-Civics",
    "English",
  ],
  10: [
    "Khmer Literature",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Moral-Civics",
    "Earth and Environmental Science",
    "English",
  ],
  11: [
    "Khmer Literature",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Moral-Civics",
    "Earth and Environmental Science",
    "English",
  ],
  12: [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Khmer Literature",
    "History",
    "Geography",
    "Moral-Civics",
    "Earth and Environmental Science",
    "English",
  ],
};

export const RESOURCE_CATEGORIES = [
  {
    id: "exercise_solution",
    labelKm: "កំណែលំហាត់",
    labelEn: "Exercise Solutions / Answer Keys",
    accent: "from-[#1f3b2d] via-[#365845] to-[#a5c3b1]",
    aliases: [
      "answer",
      "answer_key",
      "answer_keys",
      "answers",
      "exercise",
      "exercise_solution",
      "exercise_solutions",
      "solution",
      "solutions",
      "កំណែលំហាត់",
      "កំណែរលំហាត់",
      "ចម្លើយ",
      "ចម្លើយលំហាត់",
    ],
    keywords: [
      "កំណែលំហាត់",
      "កំណែរលំហាត់",
      "ចម្លើយ",
      "answer",
      "answer key",
      "solution",
      "solved",
      "exercise solution",
    ],
  },
  {
    id: "formula",
    labelKm: "រូបមន្ត",
    labelEn: "Formulas",
    accent: "from-[#243b53] via-[#486581] to-[#9fb3c8]",
    aliases: ["formula", "formulas", "រូបមន្ត"],
    keywords: ["រូបមន្ត", "formula", "summary", "cheat sheet"],
  },
  {
    id: "exam_paper",
    labelKm: "វិញ្ញាសា",
    labelEn: "Exam Papers / Test Papers",
    accent: "from-[#1f2937] via-[#334155] to-[#94a3b8]",
    aliases: [
      "exam",
      "exams",
      "exam_paper",
      "exam_papers",
      "test",
      "test_paper",
      "test_papers",
      "paper",
      "papers",
      "វិញ្ញាសា",
    ],
    keywords: ["វិញ្ញាសា", "exam", "test", "paper", "bac"],
  },
  {
    id: "document",
    labelKm: "ឯកសារ",
    labelEn: "Documents / Study Materials",
    accent: "from-[#4c3a28] via-[#8a6b49] to-[#d7c2a4]",
    aliases: [
      "doc",
      "docs",
      "document",
      "documents",
      "lesson",
      "lessons",
      "note",
      "notes",
      "study_material",
      "study_materials",
      "ឯកសារ",
    ],
    keywords: ["ឯកសារ", "document", "study material", "lesson", "note"],
  },
  {
    id: "ebook",
    labelKm: "E-Book",
    labelEn: "E-Book",
    accent: "from-[#4c2832] via-[#805364] to-[#dcb6c0]",
    aliases: [
      "book",
      "books",
      "e_book",
      "e_books",
      "e-book",
      "e-books",
      "ebook",
      "ebooks",
      "សៀវភៅ",
    ],
    keywords: ["e-book", "ebook", "book", "សៀវភៅ"],
  },
];

export const AUDIO_SUBJECT = "Khmer Literature";

export function normalizeCatalogToken(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s/-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const categoryAliases = RESOURCE_CATEGORIES.reduce((accumulator, category) => {
  [category.id, category.labelKm, category.labelEn, ...category.aliases].forEach((alias) => {
    accumulator[normalizeCatalogToken(alias)] = category.id;
  });
  return accumulator;
}, {});

const subjectAliases = Object.entries(SUBJECT_LABELS).reduce(
  (accumulator, [subject, label]) => {
    accumulator[normalizeCatalogToken(subject)] = subject;
    accumulator[normalizeCatalogToken(label)] = subject;
    return accumulator;
  },
  {
    [normalizeCatalogToken("Foreign Language")]: "English",
    [normalizeCatalogToken("Foreign Language / English")]: "English",
    [normalizeCatalogToken("ភាសាបរទេស")]: "English",
    [normalizeCatalogToken("ភាសាអង់គ្លេស")]: "English",
    [normalizeCatalogToken("Earth Science")]: "Earth and Environmental Science",
    [normalizeCatalogToken("Earth and Environment")]: "Earth and Environmental Science",
    [normalizeCatalogToken("Moral Civics")]: "Moral-Civics",
    [normalizeCatalogToken("សីលធម៌ ពលរដ្ឋវិជ្ជា")]: "Moral-Civics",
  },
);

export function normalizeSubjectName(value = "") {
  return subjectAliases[normalizeCatalogToken(value)] || String(value).trim();
}

export const CATEGORY_BY_ID = RESOURCE_CATEGORIES.reduce(
  (accumulator, category) => ({
    ...accumulator,
    [category.id]: category,
  }),
  {},
);

export function extractKhmerText(value = "") {
  return (
    String(value)
      .match(/[\u1780-\u17FF\s\d]+/g)
      ?.join(" ")
      .trim() || ""
  );
}

export function normalizeText(value = "") {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

export function normalizeCategoryId(value = "") {
  if (!value) {
    return "";
  }

  const normalized = normalizeCatalogToken(value);
  return categoryAliases[normalized] || normalized;
}

export function getCategoryMeta(value, fallback = "document") {
  const normalized = normalizeCategoryId(value);
  return CATEGORY_BY_ID[normalized] || CATEGORY_BY_ID[fallback];
}

export function inferResourceCategory(resource) {
  const explicit = getCategoryMeta(resource.category, "");
  if (explicit) {
    return explicit;
  }

  const haystack = normalizeText(
    [
      resource.title,
      resource.description,
      resource.original_filename,
      extractKhmerText(resource.title),
      extractKhmerText(resource.description),
    ].join(" "),
  );

  return (
    RESOURCE_CATEGORIES.find((category) =>
      category.keywords.some((keyword) =>
        haystack.includes(normalizeText(keyword)),
      ),
    ) || CATEGORY_BY_ID.document
  );
}

export function getSubjectsForGrade(grade) {
  return SUBJECTS_BY_GRADE[Number(grade)] || [];
}

export function getAllSubjects() {
  const subjects = [];

  GRADE_OPTIONS.forEach((grade) => {
    getSubjectsForGrade(grade).forEach((subject) => {
      if (!subjects.includes(subject)) {
        subjects.push(subject);
      }
    });
  });

  return subjects;
}

export function getSubjectLabel(subject = "", language = "km") {
  const normalizedSubject = normalizeSubjectName(subject);

  if (language === "en") {
    return normalizedSubject;
  }

  return SUBJECT_LABELS[normalizedSubject] || extractKhmerText(subject) || normalizedSubject;
}

export function getSubjectBilingualLabel(subject = "") {
  const normalizedSubject = normalizeSubjectName(subject);
  const khmerLabel = SUBJECT_LABELS[normalizedSubject];
  return khmerLabel ? `${normalizedSubject} / ${khmerLabel}` : normalizedSubject;
}
