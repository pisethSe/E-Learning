import re


GRADE_LEVELS = [9, 10, 11, 12]
AUDIO_SUBJECT = "Khmer Literature"

SUBJECT_LABELS = {
    "Khmer Literature": "អក្សរសាស្ត្រខ្មែរ",
    "Mathematics": "គណិតវិទ្យា",
    "Physics": "រូបវិទ្យា",
    "Chemistry": "គីមីវិទ្យា",
    "Biology": "ជីវវិទ្យា",
    "History": "ប្រវត្តិវិទ្យា",
    "Geography": "ភូមិវិទ្យា",
    "Moral-Civics": "សីលធម៌-ពលរដ្ឋវិជ្ជា",
    "Earth and Environmental Science": "ផែនដី និងបរិស្ថានវិទ្យា",
    "English": "ភាសាបរទេស / ភាសាអង់គ្លេស",
}

SUBJECTS_BY_GRADE = {
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
}

RESOURCE_CATEGORIES = [
    {
        "id": "exercise_solution",
        "label_en": "Exercise Solutions / Answer Keys",
        "label_km": "កំណែលំហាត់",
        "aliases": [
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
        "id": "formula",
        "label_en": "Formulas",
        "label_km": "រូបមន្ត",
        "aliases": ["formula", "formulas", "រូបមន្ត"],
    },
    {
        "id": "exam_paper",
        "label_en": "Exam Papers / Test Papers",
        "label_km": "វិញ្ញាសា",
        "aliases": [
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
        "id": "document",
        "label_en": "Documents / Study Materials",
        "label_km": "ឯកសារ",
        "aliases": [
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
        "id": "ebook",
        "label_en": "E-Book",
        "label_km": "E-Book",
        "aliases": [
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
]

RESOURCE_CATEGORY_IDS = {category["id"] for category in RESOURCE_CATEGORIES}


def normalize_catalog_token(value: str | None) -> str:
    if value is None:
        return ""

    normalized = str(value).strip().lower()
    normalized = re.sub(r"[\s\-/]+", "_", normalized)
    return normalized.strip("_")


def build_category_aliases() -> dict[str, str]:
    aliases = {}

    for category in RESOURCE_CATEGORIES:
        for value in [
            category["id"],
            category["label_en"],
            category["label_km"],
            *category["aliases"],
        ]:
            aliases[normalize_catalog_token(value)] = category["id"]

    return aliases


CATEGORY_ALIASES = build_category_aliases()

SUBJECT_ALIASES = {
    normalize_catalog_token(subject): subject
    for subject in SUBJECT_LABELS
}

for subject, label in SUBJECT_LABELS.items():
    SUBJECT_ALIASES[normalize_catalog_token(label)] = subject

SUBJECT_ALIASES.update(
    {
        normalize_catalog_token("Foreign Language"): "English",
        normalize_catalog_token("Foreign Language / English"): "English",
        normalize_catalog_token("ភាសាបរទេស"): "English",
        normalize_catalog_token("ភាសាអង់គ្លេស"): "English",
        normalize_catalog_token("Earth Science"): "Earth and Environmental Science",
        normalize_catalog_token("Earth and Environment"): "Earth and Environmental Science",
        normalize_catalog_token("Earth and Environmental Science"): "Earth and Environmental Science",
        normalize_catalog_token("Moral Civics"): "Moral-Civics",
        normalize_catalog_token("Moral-Civics"): "Moral-Civics",
        normalize_catalog_token("សីលធម៌ ពលរដ្ឋវិជ្ជា"): "Moral-Civics",
    }
)


def normalize_subject(value: str | None) -> str:
    if not value:
        return ""

    normalized = normalize_catalog_token(value)
    return SUBJECT_ALIASES.get(normalized, str(value).strip())


def normalize_category(value: str | None) -> str | None:
    if not value:
        return None

    normalized = normalize_catalog_token(value)
    return CATEGORY_ALIASES.get(normalized, normalized)


def validate_grade_level(value: int | str) -> int:
    try:
        grade_level = int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError("grade_level must be one of 9, 10, 11, or 12") from exc

    if grade_level not in GRADE_LEVELS:
        raise ValueError("grade_level must be one of 9, 10, 11, or 12")

    return grade_level


def validate_resource_catalog(
    *,
    grade_level: int | str,
    subject: str,
    category: str | None,
) -> tuple[int, str, str]:
    validated_grade = validate_grade_level(grade_level)
    normalized_subject = normalize_subject(subject)

    if normalized_subject not in SUBJECTS_BY_GRADE[validated_grade]:
        raise ValueError(
            f"{normalized_subject or 'Subject'} is not available for Grade {validated_grade}"
        )

    normalized_category = normalize_category(category or "document") or "document"
    if normalized_category not in RESOURCE_CATEGORY_IDS:
        raise ValueError(
            "category must be one of: "
            + ", ".join(category["id"] for category in RESOURCE_CATEGORIES)
        )

    return validated_grade, normalized_subject, normalized_category


def category_filter_values(value: str | None) -> list[str]:
    category_id = normalize_category(value)
    if not category_id:
        return []

    aliases = [
        alias
        for alias, canonical_id in CATEGORY_ALIASES.items()
        if canonical_id == category_id
    ]
    return sorted(set([category_id, *aliases]))


def get_all_subjects() -> list[str]:
    seen = []
    for grade in GRADE_LEVELS:
        for subject in SUBJECTS_BY_GRADE[grade]:
            if subject not in seen:
                seen.append(subject)
    return seen
