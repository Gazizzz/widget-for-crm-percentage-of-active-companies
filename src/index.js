import * as dateFns from "date-fns";
import {
  periodDay,
  yesterday,
  startEndWeek,
  month,
  strDatefrom,
  strDateto,
  url,
} from "./helpers.js";

let precent;
let thead = document.querySelector(".js-thead");
let tbody = document.querySelector(".js-tbody");
let table = document.querySelector(".js-table");

function thCreation(classlist, text) {
  let th = document.createElement("th");
  th.scope = classlist;
  th.innerText = text;
  return th;
}
function theadAppend() {
  let theadFragment = new DocumentFragment();
  thead.append(thCreation("col", "#"));
  thead.append(thCreation("col", "Список сотрудников"));
  thead.append(thCreation("col", "Количество активных лидов"));
  thead.append(thCreation("col", "Проценты"));

  theadFragment.append(thead);
  return theadFragment;
}

// table.append(theadAppend());

let monthsWithQuoter = {
  0: 1,
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 2,
  6: 3,
  7: 3,
  8: 3,
  9: 4,
  10: 4,
  11: 4,
};

// let out3 = document.querySelector(".out3");

// что подаем на вход:
//  arrDatefrom;
// что возвращаем  - return quarter

let date = new Date();
const formattedDate = dateFns.format(date, "dd.MM.yyyy");

function findMonthQuarter(date) {
  let arrDataWithoutDot = date.split(".");
  let [day, month, year] = arrDataWithoutDot;
  let dateDayMonthYear = new Date(year, month, day);
  let findQuarter =
    monthsWithQuoter[
      dateDayMonthYear.getMonth()
    ]; /*  Это тоже самое, что и  let monthItemDT = arr.find((item) => item.month == Dateto.getMonth());
                                                                                       console.log(monthItemDT.quarter);   */
  return findQuarter;
}

const period = url.searchParams.get("period");

const currentDate = new Date();
let currentQuater = findMonthQuarter(formattedDate);
console.log(currentQuater);
function quarterCurrent() {
  if (currentQuater === 1) {
    let dateFrom = new Date(`${currentDate.getFullYear()}-01-01`);
    let timestamptDateFrom = dateFrom.getTime() / 1000;
    console.log(timestamptDateFrom);
    let dateTo = new Date(`${currentDate.getFullYear()}-03-31`);

    let timestamptDateTo = dateTo.getTime() / 1000;

    return { timestamptDateFrom, timestamptDateTo };
  }
  if (currentQuater === 2) {
    let dateFrom = new Date(`${currentDate.getFullYear()}-04-01`);
    let timestamptDateFrom = dateFrom.getTime() / 1000;
    let dateTo = new Date(`${currentDate.getFullYear()}-06-30`);
    let timestamptDateTo = dateTo.getTime() / 1000;
    return { timestamptDateFrom, timestamptDateTo };
  }
  if (currentQuater === 3) {
    let dateFrom = new Date(`${currentDate.getFullYear()}-07-01`);
    let timestamptDateFrom = dateFrom.getTime() / 1000;
    let dateTo = new Date(`${currentDate.getFullYear()}-09-30`);
    let timestamptDateTo = dateTo.getTime() / 1000;
    return { timestamptDateFrom, timestamptDateTo };
  }
  if (currentQuater === 4) {
    let dateFrom = new Date(`${currentDate.getFullYear()}-10-01`);
    let timestamptDateFrom = dateFrom.getTime() / 1000;
    let dateTo = new Date(`${currentDate.getFullYear()}-12-31`);
    let timestamptDateTo = dateTo.getTime() / 1000;
    return { timestamptDateFrom, timestamptDateTo };
  }
}

let filterDateParams = {
  from: quarterCurrent().timestamptDateFrom,
  to: quarterCurrent().timestamptDateTo,
};
function loadManagers() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "https://app.aaccent.su/jenyanour/",
      type: "post",
      data: {
        type: "managers",
      },
      dataType: "json", // Expected response data type
      success: function (data) {
        resolve(data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}

function loadID() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "https://app.aaccent.su/jenyanour/my/companies_json.php",
      method: "get",
      dataType: "json",
      data: {},
      success: function (data) {
        resolve(data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}
function filterLeadsByManager(leads, managerId) {
  const filteredData = leads.filter(
    (item) => Number(item.responsible_id) === managerId
  );

  return filteredData;
}

function loadLeads(managerId) {
  const queryParams = {
    type: "filter_leads",

    data: filterDateParams,
  };

  return new Promise((resolve, reject) => {
    $.ajax({
      url: "https://app.aaccent.su/jenyanour/",
      type: "post",
      data: queryParams,
      dataType: "json", // Expected response data type
      success: function (data) {
        resolve(data);
      },
      error: function (error) {
        reject(error);
      },
    });
  });
}
function filterLeads(leadss, managerId) {
  const filteredDatas = leadss.filter(
    (item) => Number(item.company_responsible_id) == managerId
  );

  return filteredDatas;
}

function renderManagers(managers) {
  const fragment = $(document.createDocumentFragment());
  let num = 0;
  managers.forEach((manager, index) => {
    if (
      manager.name == "Евгения Ф. 8(909)886-75-17 (Кредитный специалист)" ||
      manager.name == "Мариам А. 8(918)916-96-50 (Кредитный специалист)"
    ) {
      const allLeadsCount = manager.allManagerLeads.length;

      const percentOfCompletedLeads = allLeadsCount
        ? Math.round((manager.leadsFilterCompany.length * 100) / allLeadsCount)
        : 0;
      const $row = $("<tr>");
      const $index = $("<td>").text((num = num + 1));

      const $name = $("<td>").text(manager.name);

      const $leadsCount = $("<td>").text(manager.leadsFilterCompany.length);
      // const $completedLeadsCount = $("<td>").text(manager.completedLeads.length);
      // const $allLeadsCount = $("<td>").text(allLeadsCount);
      const $percent = $("<td>").text(percentOfCompletedLeads + "%");
      // Общее кол-во - 100%
      // Кол-во завершн - x%

      const percentClosedLeads = $row
        .append($index)
        .append($name)
        // .append($allLeadsCount)
        .append($leadsCount)
        // .append($completedLeadsCount)
        .append($percent);

      fragment.append($row);
    }
  });

  $(".js-tbody").append(fragment);
}

async function render() {
  const managers = await loadManagers();
  const leads = await loadLeads();
  // 1. загрузить все лиды
  const allLeads = await loadID();
  const managersWithLeads = managers.map(async (manager) => {
    // отфильтолвать лиды по менеджеру

    const allManagerLeads = filterLeadsByManager(allLeads, manager.id);

    const leadsFilterCompany = filterLeads(leads, manager.id);

    return {
      ...manager,
      // leads,
      allManagerLeads,
      leadsFilterCompany,
    };
  });
  const results = await Promise.all(managersWithLeads);
  console.log(results);
  renderManagers(results);
}
render();
