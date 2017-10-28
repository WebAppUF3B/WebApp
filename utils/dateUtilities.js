exports.formatMMDDYYYY = (date) => {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
};

exports.differenceInSeconds = (dateStart, dateEnd) => {
  return (((dateEnd.getTime() - dateStart.getTime()) / 1000) / 60);
};

exports.DOWMap = (dowInt) => {
  switch (dowInt) {
    case 0:
      return 'Sunday';
    case 1:
      return 'Monday';
    case 2:
      return 'Tuesday';
    case 3:
      return 'Wednesday';
    case 4:
      return 'Thursday';
    case 5:
      return 'Friday';
    case 6:
      return 'Saturday';
    default:
      return 'NA';
  }
};

