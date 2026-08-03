function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function captionText(photo) {
  return toTitleCase(photo.format) + ' — ' + (photo.setting === 'outdoor' ? 'Outdoor' : 'Indoor');
}

function filterPhotos(data, filterState) {
  return data.filter(function (photo) {
    var formatMatch  = filterState.format === null  || photo.format === filterState.format;
    var settingMatch = filterState.setting === null || photo.setting === filterState.setting;
    return formatMatch && settingMatch;
  });
}

function deriveFilterValues(data) {
  var format = [];
  var setting = [];
  data.forEach(function (photo) {
    if (photo.format && format.indexOf(photo.format) === -1) format.push(photo.format);
    if (photo.setting && setting.indexOf(photo.setting) === -1) setting.push(photo.setting);
  });
  format.sort();
  setting.sort();
  return { format: format, setting: setting };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { filterPhotos: filterPhotos, deriveFilterValues: deriveFilterValues, toTitleCase: toTitleCase, captionText: captionText };
}
