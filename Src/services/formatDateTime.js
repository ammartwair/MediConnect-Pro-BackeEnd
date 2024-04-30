export const formateDate = (date) => {
  date = new Date(date);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return `${days[date.getDay()]} ${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
};

export const formateTime = (time) => {
  time = new Date(time);
  return `${time.getUTCHours().toString().padStart(2, "0")}:${time
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`;
};
