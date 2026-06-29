function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function captionText(photo) {
  return photo.location ? photo.series + ' — ' + photo.location : photo.series;
}

function filterPhotos(data, filterState) {
  return data.filter(function (photo) {
    var seriesMatch = filterState.series === null || photo.series === filterState.series;
    var envMatch = filterState.environment === null || photo.environment === filterState.environment;
    return seriesMatch && envMatch;
  });
}

function deriveFilterValues(data) {
  var series = [];
  var element = [];
  data.forEach(function (photo) {
    if (photo.series && series.indexOf(photo.series) === -1) series.push(photo.series);
    if (photo.environment && element.indexOf(photo.environment) === -1) element.push(photo.environment);
  });
  series.sort();
  element.sort();
  return { series: series, element: element };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { filterPhotos: filterPhotos, deriveFilterValues: deriveFilterValues, toTitleCase: toTitleCase, captionText: captionText };
}
