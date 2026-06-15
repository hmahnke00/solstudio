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
  var environment = [];
  data.forEach(function (photo) {
    if (photo.series && series.indexOf(photo.series) === -1) series.push(photo.series);
    if (photo.environment && environment.indexOf(photo.environment) === -1) environment.push(photo.environment);
  });
  series.sort();
  environment.sort();
  return { series: series, environment: environment };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { filterPhotos: filterPhotos, deriveFilterValues: deriveFilterValues, toTitleCase: toTitleCase, captionText: captionText };
}
