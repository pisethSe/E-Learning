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
