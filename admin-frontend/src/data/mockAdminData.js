function makeDate({ daysOffset = 0, monthsOffset = 0, hour = 9 }) {
  const date = new Date();
  date.setMinutes(15, 0, 0);
  date.setHours(hour);

  if (monthsOffset) {
    date.setMonth(date.getMonth() + monthsOffset);
  }

  if (daysOffset) {
    date.setDate(date.getDate() + daysOffset);
  }

  return date.toISOString();
}

function daysAgo(days, hour) {
  return makeDate({ daysOffset: -days, hour });
}

function daysFromNow(days, hour) {
  return makeDate({ daysOffset: days, hour });
}

function monthsAgo(months, hour) {
  return makeDate({ monthsOffset: -months, hour });
}

export const MOCK_ADMIN_RESOURCES = [
  {
    id: "mock-resource-001",
    title: "Grade 12 Mathematics Formula Sheet",
    description: "Compact Bac II formula sheet for algebra, geometry, and probability review.",
    grade_level: 12,
    subject: "Mathematics",
    category: "formula",
    file_type: "document",
    external_url: "https://example.com/grade-12-math-formulas.pdf",
    original_filename: "grade-12-math-formulas.pdf",
    is_published: true,
    created_at: daysAgo(0, 8),
    updated_at: daysAgo(0, 10),
  },
  {
    id: "mock-resource-002",
    title: "Physics National Exam Paper Set",
    description: "Past-paper practice set with mechanics, electricity, and optics questions.",
    grade_level: 12,
    subject: "Physics",
    category: "exam_paper",
    file_type: "document",
    external_url: "https://example.com/physics-exam-paper.pdf",
    original_filename: "physics-exam-paper.pdf",
    is_published: true,
    created_at: daysAgo(1, 11),
    updated_at: daysAgo(1, 11),
  },
  {
    id: "mock-resource-003",
    title: "Chemistry Reaction Summary",
    description: "One-page study notes for reaction types and balancing chemical equations.",
    grade_level: 12,
    subject: "Chemistry",
    category: "document",
    file_type: "document",
    external_url: "https://example.com/chemistry-reaction-summary.pdf",
    original_filename: "chemistry-reaction-summary.pdf",
    is_published: true,
    created_at: daysAgo(2, 14),
    updated_at: daysAgo(2, 15),
  },
  {
    id: "mock-resource-004",
    title: "Biology Exercise Solutions",
    description: "Answer keys for cell division, genetics, and ecosystem exercises.",
    grade_level: 11,
    subject: "Biology",
    category: "exercise_solution",
    file_type: "document",
    external_url: "https://example.com/biology-exercise-solutions.pdf",
    original_filename: "biology-exercise-solutions.pdf",
    is_published: true,
    created_at: daysAgo(3, 9),
    updated_at: daysAgo(3, 10),
  },
  {
    id: "mock-resource-005",
    title: "Khmer Literature Essay Audio: Tum Teav",
    description: "Audio guide for listening practice and essay preparation.",
    grade_level: 12,
    subject: "Khmer Literature",
    category: "document",
    file_type: "audio",
    external_url: "https://example.com/tum-teav-audio.mp3",
    original_filename: "tum-teav-audio.mp3",
    is_published: true,
    created_at: daysAgo(4, 16),
    updated_at: daysAgo(4, 16),
  },
  {
    id: "mock-resource-006",
    title: "History Timeline Photo Pack",
    description: "Classroom timeline photos for modern Cambodian history revision.",
    grade_level: 11,
    subject: "History",
    category: "document",
    file_type: "image",
    external_url: "https://example.com/history-timeline-photo.jpg",
    original_filename: "history-timeline-photo.jpg",
    is_published: true,
    created_at: daysAgo(5, 13),
    updated_at: daysAgo(5, 13),
  },
  {
    id: "mock-resource-007",
    title: "Geography Map Reading Diagram",
    description: "Visual reference for map symbols, scales, and contour lines.",
    grade_level: 10,
    subject: "Geography",
    category: "document",
    file_type: "image",
    external_url: "https://example.com/geography-map-diagram.png",
    original_filename: "geography-map-diagram.png",
    is_published: true,
    created_at: daysAgo(6, 10),
    updated_at: daysAgo(6, 11),
  },
  {
    id: "mock-resource-008",
    title: "English Vocabulary E-Book",
    description: "Common vocabulary grouped by school topics with short examples.",
    grade_level: 9,
    subject: "English",
    category: "ebook",
    file_type: "document",
    external_url: "https://example.com/english-vocabulary-ebook.pdf",
    original_filename: "english-vocabulary-ebook.pdf",
    is_published: true,
    created_at: daysAgo(8, 9),
    updated_at: daysAgo(8, 9),
  },
  {
    id: "mock-resource-009",
    title: "Math Practice Answer Key",
    description: "Answer key for Grade 10 algebra and functions practice questions.",
    grade_level: 10,
    subject: "Mathematics",
    category: "exercise_solution",
    file_type: "document",
    external_url: "https://example.com/math-practice-answer-key.pdf",
    original_filename: "math-practice-answer-key.pdf",
    is_published: true,
    created_at: daysAgo(11, 15),
    updated_at: daysAgo(11, 15),
  },
  {
    id: "mock-resource-010",
    title: "Physics Formula Cards",
    description: "Printable formula cards for quick review before tests.",
    grade_level: 10,
    subject: "Physics",
    category: "formula",
    file_type: "document",
    external_url: "https://example.com/physics-formula-cards.pdf",
    original_filename: "physics-formula-cards.pdf",
    is_published: false,
    created_at: daysAgo(15, 12),
    updated_at: daysAgo(15, 12),
  },
  {
    id: "mock-resource-011",
    title: "Weather Cycle Diagram Photo",
    description: "Earth and environmental science diagram for water cycle lessons.",
    grade_level: 11,
    subject: "Earth and Environmental Science",
    category: "document",
    file_type: "image",
    external_url: "https://example.com/weather-cycle-diagram.webp",
    original_filename: "weather-cycle-diagram.webp",
    is_published: true,
    created_at: daysAgo(20, 14),
    updated_at: daysAgo(20, 14),
  },
  {
    id: "mock-resource-012",
    title: "Khmer Literature Audio: Short Story Review",
    description: "Draft audio review for Khmer Literature short-story analysis.",
    grade_level: 12,
    subject: "Khmer Literature",
    category: "document",
    file_type: "audio",
    external_url: "https://example.com/short-story-review.mp3",
    original_filename: "short-story-review.mp3",
    is_published: false,
    created_at: daysAgo(24, 8),
    updated_at: daysAgo(24, 8),
  },
  {
    id: "mock-resource-013",
    title: "Chemistry National Exam Paper",
    description: "Mock national-exam paper with multiple-choice and calculation sections.",
    grade_level: 12,
    subject: "Chemistry",
    category: "exam_paper",
    file_type: "document",
    external_url: "https://example.com/chemistry-national-exam-paper.pdf",
    original_filename: "chemistry-national-exam-paper.pdf",
    is_published: true,
    created_at: monthsAgo(1, 10),
    updated_at: monthsAgo(1, 11),
  },
  {
    id: "mock-resource-014",
    title: "Moral-Civics Study Notes",
    description: "Study notes for rights, responsibilities, and civic participation.",
    grade_level: 9,
    subject: "Moral-Civics",
    category: "document",
    file_type: "document",
    external_url: "https://example.com/moral-civics-study-notes.pdf",
    original_filename: "moral-civics-study-notes.pdf",
    is_published: true,
    created_at: monthsAgo(2, 13),
    updated_at: monthsAgo(2, 13),
  },
  {
    id: "mock-resource-015",
    title: "Grade 12 Mathematics E-Book",
    description: "Long-form revision guide for Bac II mathematics preparation.",
    grade_level: 12,
    subject: "Mathematics",
    category: "ebook",
    file_type: "document",
    external_url: "https://example.com/grade-12-math-ebook.pdf",
    original_filename: "grade-12-math-ebook.pdf",
    is_published: true,
    created_at: monthsAgo(3, 9),
    updated_at: monthsAgo(3, 9),
  },
  {
    id: "mock-resource-016",
    title: "Biology Lab Worksheet",
    description: "Printable worksheet for plant-cell observation lab work.",
    grade_level: 10,
    subject: "Biology",
    category: "document",
    file_type: "document",
    external_url: "https://example.com/biology-lab-worksheet.pdf",
    original_filename: "biology-lab-worksheet.pdf",
    is_published: true,
    created_at: monthsAgo(5, 15),
    updated_at: monthsAgo(5, 15),
  },
];

export const MOCK_ADMIN_EVENTS = [
  {
    id: "mock-event-001",
    title: "Grade 12 Bac II Prep Livestream",
    description: "A focused livestream covering high-priority revision tactics for Bac II students.",
    status: "upcoming",
    location: "Online",
    event_date: daysFromNow(3, 19),
    media_type: "video",
    cta_label: "Register now",
    cta_url: "https://example.com/bac-ii-prep",
    is_published: true,
    created_at: daysAgo(1, 17),
    updated_at: daysAgo(1, 17),
  },
  {
    id: "mock-event-002",
    title: "STEM Career Talk Replay",
    description: "Recorded student event with practical advice from science and engineering mentors.",
    status: "completed",
    location: "Phnom Penh",
    event_date: daysAgo(9, 14),
    media_type: "video",
    cta_label: "Watch replay",
    cta_url: "https://example.com/stem-career-talk",
    is_published: true,
    created_at: daysAgo(3, 10),
    updated_at: daysAgo(3, 10),
  },
  {
    id: "mock-event-003",
    title: "Khmer Essay Clinic",
    description: "Small-group essay writing clinic for Khmer Literature exam preparation.",
    status: "registration_open",
    location: "Online",
    event_date: daysFromNow(10, 18),
    media_type: "video",
    cta_label: "Join clinic",
    cta_url: "https://example.com/khmer-essay-clinic",
    is_published: true,
    created_at: daysAgo(6, 9),
    updated_at: daysAgo(6, 9),
  },
  {
    id: "mock-event-004",
    title: "Parent Orientation Recording",
    description: "Draft recording for parents about using the Grade A learning catalog.",
    status: "coming_soon",
    location: "Grade A Center",
    event_date: daysFromNow(18, 9),
    media_type: "video",
    cta_label: "Learn more",
    cta_url: "https://example.com/parent-orientation",
    is_published: false,
    created_at: monthsAgo(2, 11),
    updated_at: monthsAgo(2, 11),
  },
];

export const MOCK_ADMIN_STATS = {
  total_resources: MOCK_ADMIN_RESOURCES.length,
  total_documents: MOCK_ADMIN_RESOURCES.filter(
    (resource) => resource.file_type === "document",
  ).length,
  total_images: MOCK_ADMIN_RESOURCES.filter((resource) =>
    ["image", "photo"].includes(resource.file_type),
  ).length,
  total_audio: MOCK_ADMIN_RESOURCES.filter((resource) => resource.file_type === "audio").length,
  published_resources: MOCK_ADMIN_RESOURCES.filter((resource) => resource.is_published).length,
  total_events: MOCK_ADMIN_EVENTS.length,
  published_events: MOCK_ADMIN_EVENTS.filter((event) => event.is_published).length,
};

export function shouldUseMockAdminData(stats, resources = [], events = []) {
  const hasResources = Array.isArray(resources) && resources.length > 0;
  const hasEvents = Array.isArray(events) && events.length > 0;
  const hasStats =
    stats &&
    Object.values(stats).some((value) => Number(value || 0) > 0);

  return !hasResources && !hasEvents && !hasStats;
}

export function isMockRecordId(id) {
  return String(id || "").startsWith("mock-");
}
