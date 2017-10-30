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

exports.getTimeOfDay = (date) => {
  const hours = date.getHours();
  const remainingHrs = hours % 12;
  const minutes = date.getMinutes();

  let units = '';

  switch (remainingHrs) {
    case 0:
      if (hours === 0) units = "A.M.";
      if (hours === 12) units = "P.M.";
    default:
      if (hours < 12) units = "A.M.";
      if (hours > 12) units = "P.M.";
  }

  return `${remainingHrs === 0 ? 12 : remainingHrs}:${minutes < 10 ? `0${minutes}` : minutes} ${units}`;
};

