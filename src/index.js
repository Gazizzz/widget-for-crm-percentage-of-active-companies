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

let quaterFrom = findMonthQuarter(strDatefrom);
let quarterTo = findMonthQuarter(strDateto);
console.log(quaterFrom);
console.log(quarterTo);

// (man[i].summ / 100) * 1(man[i].summ / 100) * 1;

// let test1 = document.querySelector(".precent");
// let test3 = document.querySelector(".sum");

// function test2() {
//     for (let i=0; i < )
//   if (test1.innerHTML <= 10) {
//     let test4 = (test3.innerHTML / 100) * 1;
//     console.log(test4);
//   }
// };
// test2();

const period = url.searchParams.get("period");

let postDataFilterDate = {
  type: "filter_leads",
  data: {
    from: "",

    to: function () {
      if (period == "day") {
        return "1682083862";
      }
    },
    manager_id: "",
  },
};

let postDataFilterDateComplete = {
  type: "filter_complete_leads",
  data: {
    table: "complete_leads_info",
    from: function () {
      if (period == "day") {
        return periodDay()[0];
      }
      if (period == "yesterday") {
        return yesterday()[0];
      }
      if (period == "week") {
        return startEndWeek()[0];
      }
      if (period == "month") {
        return month()[0];
      }
      if (period == "custom") {
        let parsestrDatefrom = dateFns.parse(
          strDatefrom,
          "dd.MM.yyyy",
          new Date()
        );
        let dateFrom = parsestrDatefrom.getTime();
        return dateFrom;
      }
    },

    to: function () {
      if (period == "day") {
        return periodDay()[1];
      }
      if (period == "yesterday") {
        return yesterday()[1];
      }
      if (period == "week") {
        return startEndWeek()[1];
      }
      if (period == "month") {
        return month()[1];
      }
      if (period == "custom") {
        let parsestrDateTo = dateFns.parse(strDateto, "dd.MM.yyyy", new Date());
        let dateTo = parsestrDateTo.getTime();

        return dateTo;
      }
    },
    manager_id: "",
  },
};

let postDataManagers = {
  type: "managers",
  data: {},
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

function loadLeads(managerId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "https://app.aaccent.su/jenyanour/",
      type: "post",
      data: {
        type: "filter_leads",
        data: {
          manager_id: managerId,
        },
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

function loadLeadsComplete(managerId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "https://app.aaccent.su/jenyanour/",
      type: "post",
      data: {
        type: "filter_complete_leads",
        manager_id: managerId,
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

function renderManagers(managers) {
  const fragment = $(document.createDocumentFragment());

  managers.forEach((manager, index) => {
    const allLeadsCount = manager.leads.length + manager.completedLeads.length;
    
    const percentOfCompletedLeads = allLeadsCount
      ? Math.round((manager.completedLeads.length * 100) / allLeadsCount)
      : 0;
    const $row = $("<tr>");
    const $index = $("<td>").text(index + 1);
    const $name = $("<td>").text(manager.name);
    const $leadsCount = $("<td>").text(manager.leads.length);
    const $completedLeadsCount = $("<td>").text(manager.completedLeads.length);
    const $allLeadsCount = $("<td>").text(allLeadsCount);
    const $percent = $("<td>").text(percentOfCompletedLeads + "%");
    // Общее кол-во - 100%
    // Кол-во завершн - x%

    const percentClosedLeads = $row
      .append($index)
      .append($name)
      .append($allLeadsCount)
      .append($leadsCount)
      .append($completedLeadsCount)
      .append($percent);

    fragment.append($row);
  });

  $(".js-tbody").append(fragment);
}

async function render() {
  const managers = await loadManagers();

  const managersWithLeads = managers.map(async (manager) => {
    const leads = await loadLeads(manager.id);
    const completedLeads = await loadLeadsComplete(manager.id);

    return {
      ...manager,
      leads,
      completedLeads,
    };
  });

  const results = await Promise.all(managersWithLeads);

  // console.log(results);

  renderManagers(results);
}

render();

let ss;
let test1;
// $.ajax({
//   url: "https://app.aaccent.su/jenyanour/",
//   type: "post",
//   data: postDataFilterDate,
//   dataType: "json", // Expected response data type
//   success: function (data) {
//     $.ajax({
//       url: "https://app.aaccent.su/jenyanour/",
//       type: "post",
//       data: postDataFilterDateComplete,
//       dataType: "json", // Expected response data type
//       success: function (data3) {
//         $.ajax({
//           url: "https://app.aaccent.su/jenyanour/",
//           type: "post",
//           data: postDataManagers,
//           dataType: "json", // Expected response data type
//           success: function (data2) {
//             let leadCreatedAt = data.map((item) => item.lead_created_at);
//             let leadResponsibleId = data.map(
//               (item) => item.lead_responsible_id
//             );
//             let leadResponsibleIdDateComplete = data3.map(
//               (item) => item.lead_responsible_id
//             );
//             console.log(leadResponsibleIdDateComplete);
//             $.each(data2, function (index2, value2) {
//               const leadResponsibleIdQuantity = leadResponsibleId.reduce(
//                 (acc, i) => {
//                   if (acc.hasOwnProperty(i)) {
//                     acc[i] += 1;
//                   } else {
//                     acc[i] = 1;
//                   }
//                   return acc;
//                 },
//                 {}
//               );
//               const leadResponsibleIdDateCompleteQuantity =
//                 leadResponsibleIdDateComplete.reduce((acc, i) => {
//                   if (acc.hasOwnProperty(i)) {
//                     acc[i] += 1;
//                   } else {
//                     acc[i] = 1;
//                   }
//                   return acc;
//                 }, {});

//               var row = $("<tr>");
//               $(".table tbody").append(row);
//               row.append($("<td>").text((index2 += 1)));
//               row.append($("<td>").text(value2.name));

//               for (const prop in leadResponsibleIdQuantity) {
//                 if (prop == value2.id) {
//                   row.append($("<td>").text(leadResponsibleIdQuantity[prop]));
//                 }
//               }
//               for (const prop in leadResponsibleIdQuantity) {
//                 for (const prop2 in leadResponsibleIdDateCompleteQuantity) {
//                   if (prop == value2.id && prop2 == value2.id) {
//                     row.append(
//                       $("<td>").text(
//                         ` ${
//                           ((leadResponsibleIdDateCompleteQuantity[prop2] +
//                             leadResponsibleIdQuantity[prop]) /
//                             100) *
//                           leadResponsibleIdQuantity[prop]
//                         } %`
//                       )
//                     );
//                   }
//                 }
//               }
//             });
//           },
//           error: function (err) {
//             console.log(err);
//           },
//         });
//       },

//       error: function (err) {
//         console.log(err);
//       },
//     });
//   },
//   error: function (err) {
//     console.log(err);
//   },
// });
