/* eslint-disable radix */
function stringToDate(_date, _format, _delimiter) {
  const formatLowerCase = _format.toLowerCase();
  const formatItems = formatLowerCase.split(_delimiter);
  const dateItems = _date.split(_delimiter);
  const monthIndex = formatItems.indexOf('mm');
  const dayIndex = formatItems.indexOf('dd');
  const yearIndex = formatItems.indexOf('yyyy');
  let month = parseInt(dateItems[monthIndex]);
  month -= 1;
  const formatedDate = new Date(
    dateItems[yearIndex],
    month,
    dateItems[dayIndex],
  );
  return formatedDate;
}

module.exports = {
  stringToDate,
};
