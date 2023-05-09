import * as dateFns from "date-fns";

const url = new URL(window.location.href);
let strDatefrom = url.searchParams.get("date_from");
let strDateto = url.searchParams.get("date_to");

let today = new Date();

function periodDay() {
  strDatefrom = today;
  strDateto = today;
  let getTimeDayfrom = strDatefrom.getTime();
  let getTimeDayto = strDateto.getTime();
  return [getTimeDayfrom, getTimeDayto];
}

function yesterday() {
  strDatefrom = dateFns.sub(today, { days: 1 });
  strDateto = strDatefrom;
  let getTimeYesterdayFrom = strDatefrom.getTime();
  let getTimeYesterdayTo = strDateto.getTime();
  return [getTimeYesterdayFrom, getTimeYesterdayTo];
}
function startEndWeek() {
  const startEndWeekUS = dateFns.startOfWeek(today);
  strDatefrom = dateFns.add(startEndWeekUS, { days: 1 });
  const lastDayWeekUS = dateFns.lastDayOfWeek(today);
  strDateto = dateFns.add(lastDayWeekUS, { days: 1 });
  let getTimeWeekFrom = strDatefrom.getTime();
  let getTimeWeekTo = strDateto.getTime();
  return [getTimeWeekFrom, getTimeWeekTo];
}

function month() {
  const lastDayMonth = dateFns.lastDayOfMonth(today);
  const firstDayMonth = dateFns.startOfMonth(today);
  strDatefrom = firstDayMonth;
  strDateto = lastDayMonth;
  let getTimeMonthFrom = strDatefrom.getTime();
  let getTimeMonthTo = strDateto.getTime();
  return [getTimeMonthFrom, getTimeMonthTo];
}
export {
  periodDay,
  yesterday,
  startEndWeek,
  month,
  strDatefrom,
  strDateto,
  url,
};
