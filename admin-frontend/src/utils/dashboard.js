import {
  AUDIO_SUBJECT,
  GRADE_OPTIONS,
  RESOURCE_CATEGORIES,
  SUBJECTS_BY_GRADE,
  getCategoryShortLabel,
  getSubjectLabel,
  normalizeCategoryId,
  normalizeSubjectName,
} from "../data/learningCatalog";

export function getSummary(stats) {
  return stats || {
    total_resources: 0,
    total_documents: 0,
    total_images: 0,
    total_audio: 0,
    published_resources: 0,
    total_events: 0,
    published_events: 0,
  };
}

export function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

export function buildCountMap(items, keySelector) {
  return (items || []).reduce((accumulator, item) => {
    const key = keySelector(item);
    if (!key) {
      return accumulator;
    }
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
}

export function toSortedEntries(map) {
  return Object.entries(map).sort((left, right) => right[1] - left[1]);
}

export function buildRecentActivity(resources = [], events = [], days = 7) {
  const formatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const labels = [];

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);

    labels.push({
      key: date.toISOString().slice(0, 10),
      label: formatter.format(date),
    });
  }

  const resourceCounts = buildCountMap(resources, (item) =>
    item?.created_at ? String(item.created_at).slice(0, 10) : "unknown",
  );
  const eventCounts = buildCountMap(events, (item) =>
    item?.created_at ? String(item.created_at).slice(0, 10) : "unknown",
  );

  return labels.map((item) => ({
    name: item.label,
    resources: resourceCounts[item.key] || 0,
    events: eventCounts[item.key] || 0,
  }));
}

export function isAudioResource(resource) {
  return resource?.file_type === "audio";
}

function hasImageExtension(value = "") {
  return /\.(avif|gif|jpe?g|png|webp)$/i.test(String(value).split("?")[0]);
}

export function isPhotoResource(resource) {
  if (!resource) {
    return false;
  }

  if (resource.file_type === "image" || resource.file_type === "photo") {
    return true;
  }

  if (resource.file_type !== "document") {
    return false;
  }

  return Boolean(
    resource.thumbnail_path ||
      hasImageExtension(resource.file_path) ||
      hasImageExtension(resource.original_filename) ||
      hasImageExtension(resource.external_url),
  );
}

export function isFileResource(resource) {
  return resource && !isAudioResource(resource) && !isPhotoResource(resource);
}

export function isStudyResource(resource) {
  return resource && resource.file_type !== "audio";
}

export function getPublishedItems(items = []) {
  return items.filter((item) => item?.is_published);
}

export function getStudyResources(resources = []) {
  return resources.filter(isStudyResource);
}

export function getPhotoResources(resources = []) {
  return resources.filter(isPhotoResource);
}

export function getFileResources(resources = []) {
  return resources.filter(isFileResource);
}

export function getAudioResources(resources = []) {
  return resources.filter(isAudioResource);
}

export function getEventVideos(events = []) {
  return events.filter((event) => event?.media_type === "video");
}

export function getCategoryCounts(resources = []) {
  const studyResources = getStudyResources(resources);

  return RESOURCE_CATEGORIES.map((category) => {
    const value = studyResources.filter(
      (resource) => normalizeCategoryId(resource.category) === category.value,
    ).length;

    return {
      ...category,
      id: category.value,
      name: category.labelEn,
      value,
    };
  });
}

export function getGradeCounts(resources = []) {
  return GRADE_OPTIONS.map((grade) => ({
    grade,
    name: `Grade ${grade}`,
    resources: getStudyResources(resources).filter(
      (resource) => Number(resource.grade_level) === Number(grade),
    ).length,
    audio: getAudioResources(resources).filter(
      (resource) => Number(resource.grade_level) === Number(grade),
    ).length,
  }));
}

export function getSubjectCounts(resources = [], grade) {
  const availableSubjects = grade ? SUBJECTS_BY_GRADE[Number(grade)] || [] : null;
  const counts = buildCountMap(getStudyResources(resources), (resource) =>
    normalizeSubjectName(resource.subject),
  );

  const entries = availableSubjects
    ? availableSubjects.map((subject) => [subject, counts[subject] || 0])
    : toSortedEntries(counts);

  return entries.map(([subject, value]) => ({
    subject,
    name: getSubjectLabel(subject),
    value,
  }));
}

export function getCatalogHealth(resources = [], events = []) {
  const categoryCounts = getCategoryCounts(resources);
  const coveredCategories = categoryCounts.filter((category) => category.value > 0).length;
  const bacSubjectCounts = getSubjectCounts(resources, 12);
  const coveredBacSubjects = bacSubjectCounts.filter((subject) => subject.value > 0).length;
  const audioResources = getAudioResources(resources);
  const khmerAudio = audioResources.filter(
    (resource) => normalizeSubjectName(resource.subject) === AUDIO_SUBJECT,
  );
  const videoEvents = getEventVideos(events);

  return {
    categoryCounts,
    bacSubjectCounts,
    coveredCategories,
    totalCategories: RESOURCE_CATEGORIES.length,
    coveredBacSubjects,
    totalBacSubjects: SUBJECTS_BY_GRADE[12].length,
    audioResources,
    khmerAudio,
    videoEvents,
  };
}

export function formatCategoryCountLabel(category) {
  return `${getCategoryShortLabel(category.id)} · ${category.value || 0}`;
}
