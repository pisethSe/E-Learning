export const GRADE_OPTIONS = [9, 10, 11, 12];
export const AUDIO_SUBJECT = "Khmer Literature";

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
    value: "exercise_solution",
    labelKm: "កំណែលំហាត់",
    labelEn: "Exercise Solutions / Answer Keys",
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
  },
  {
    value: "formula",
    labelKm: "រូបមន្ត",
    labelEn: "Formulas",
    aliases: ["formula", "formulas", "រូបមន្ត"],
  },
  {
    value: "exam_paper",
    labelKm: "វិញ្ញាសា",
    labelEn: "Exam Papers / Test Papers",
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
  },
  {
    value: "document",
    labelKm: "ឯកសារ",
    labelEn: "Documents / Study Materials",
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
  },
  {
    value: "ebook",
    labelKm: "E-Book",
    labelEn: "E-Book",
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
  },
];

export const CATEGORY_BY_VALUE = RESOURCE_CATEGORIES.reduce(
  (accumulator, category) => ({
    ...accumulator,
    [category.value]: category,
  }),
  {},
);

export const RESOURCE_FILE_TYPES = [
  {
    value: "document",
    label: "File / PDF / E-Book",
    accept:
      ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.epub",
  },
  {
    value: "image",
    label: "Image file",
    accept: "image/*,.jpg,.jpeg,.png,.webp,.gif,.avif",
  },
  {
    value: "audio",
    label: "Audio",
    accept: "audio/*,.mp3,.wav,.m4a,.aac,.ogg",
  },
];

export function normalizeCatalogToken(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[\s/-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const categoryAliases = RESOURCE_CATEGORIES.reduce((accumulator, category) => {
  [category.value, category.labelKm, category.labelEn, ...category.aliases].forEach((alias) => {
    accumulator[normalizeCatalogToken(alias)] = category.value;
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

export function getSubjectsForGrade(grade) {
  return SUBJECTS_BY_GRADE[Number(grade)] || SUBJECTS_BY_GRADE[12];
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

export function getSubjectLabel(subject) {
  const normalizedSubject = normalizeSubjectName(subject);
  const khmerLabel = SUBJECT_LABELS[normalizedSubject];
  return khmerLabel ? `${normalizedSubject} / ${khmerLabel}` : normalizedSubject;
}

export function normalizeCategoryId(value) {
  if (!value) {
    return "";
  }

  const normalized = normalizeCatalogToken(value);
  return categoryAliases[normalized] || normalized;
}

export function getCategoryLabel(value) {
  const categoryId = normalizeCategoryId(value);
  const category = CATEGORY_BY_VALUE[categoryId];

  if (!category) {
    return value || "General";
  }

  return `${category.labelKm} / ${category.labelEn}`;
}

export function getCategoryShortLabel(value) {
  const categoryId = normalizeCategoryId(value);
  return CATEGORY_BY_VALUE[categoryId]?.labelEn || value || "General";
}
