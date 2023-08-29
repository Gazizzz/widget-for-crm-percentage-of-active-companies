/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
const url = new URL(window.location.href);
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
// const formattedDate = dateFns.format(date, "dd.MM.yyyy");
const formattedDate = new Date()
  .toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  .split("/")
  .join(".");

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

// const currentDate = new Date();
// let currentQuater = findMonthQuarter(formattedDate);
let periodNinetyDays = new Date();
periodNinetyDays.setHours(0);
periodNinetyDays.setMinutes(0);
periodNinetyDays.setSeconds(0);

function quarterCurrent() {
  let periodNinetyDayEnd = new Date();
  periodNinetyDayEnd.setHours(0);
  periodNinetyDayEnd.setMinutes(59);
  periodNinetyDayEnd.setSeconds(59);
  let timestamptDateTo = Math.floor(periodNinetyDayEnd.getTime() / 1000);

  // let resultDate = dateFns.subDays(periodNinetyDays, 90);
  const resultDate = new Date(
    new Date(periodNinetyDays).getTime() - 90 * 24 * 60 * 60 * 1000
  );
  let timestamptDateFrom = Math.floor(resultDate.getTime() / 1000);

  return { timestamptDateFrom, timestamptDateTo };
}

let filterDateParams = {
  from: quarterCurrent().timestamptDateFrom,
  to: quarterCurrent().timestamptDateTo,
};
function loadManagers() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "https://amaranta.im3000.ru/bot/widget/my/users_json.php",
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

function loadCompanies() {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: "https://amaranta.im3000.ru/bot/widget/my/companies_json.php",
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
      url: "https://amaranta.im3000.ru/bot/widget/",
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
    const allLeadsCount = manager.allManagerLeads.length;

    const percentOfCompletedLeads = allLeadsCount
      ? Math.round((manager.leadCount * 100) / allLeadsCount)
      : 0;
    const $row = $("<tr>");

    const $index = $("<td>").text((num = num + 1));

    const $name = $("<td>").text(manager.name);

    const $leadsCount = $("<td>").text(manager.leadCount);

    $leadsCount.addClass("js-button-firstUser");
    $leadsCount.attr("data-bs-toggle", "modal");
    $leadsCount.attr("data-bs-target", "#firstModal");
    $leadsCount.attr("data-managerID", `${manager.id}`);

    // const $completedLeadsCount = $("<td>").text(manager.completedLeads.length);
    // const $allLeadsCount = $("<td>").text(allLeadsCount);
    const $percent = $("<td>").text(percentOfCompletedLeads + "%");
    $percent.addClass("js-Center");
    const $names = $("<td>").text(manager.nameCompany);
    // console.log(manager.test);
    // console.log($names);
    // Общее кол-во - 100%
    // Кол-во завершн - x%

    const percentClosedLeads = $row
      .append($index)
      .append($name)
      // .append($allLeadsCount)
      .append($leadsCount)
      // .append($completedLeadsCount)
      .append($percent)
      .append($names);

    fragment.append($row);
  });

  $(".js-tbody").append(fragment);
}

//

function filterLeads2(leadss, amo_id) {
  const filteredDatas = leadss.filter((item) => item.amo_company_id == amo_id);

  return filteredDatas;
}

async function render() {
  const managers = await loadManagers();
  const leads = await loadLeads();
  // console.log(leads);
  // 1. загрузить все лиды
  const allCompanies = await loadCompanies();

  const allLeadsWithCompanies = allCompanies.map((company) => {
    const companyLeads = filterLeads2(leads, company.amo_id);

    return {
      ...company,
      companyLeads,
    };
  });

  // const filteredActiveCompaniesByManager = allLeadsWithCompanies.filter(
  //   (company) => {
  //     return (
  //       company.companyLeads.length > 0 &&
  //       (company.responsible_id == firstManager ||
  //         company.responsible_id == secondManage)
  //     );
  //   }
  // );

  // const nameCompanyFirstUser = filteredActiveCompaniesByManager.map((item) => {
  //   if (item.responsible_id == "6889038") {
  //     let companyName = item.name;
  //     let companyAmoId = item.amo_id;
  //     return { companyName, companyAmoId };
  //   }
  // });

  // const filteredFirstUser = nameCompanyFirstUser.filter(function (el) {
  //   return el != null;
  // });

  const managersWithLeads = managers.map(async (manager) => {
    // отфильтолвать лиды по менеджеру

    const allManagerLeads = filterLeadsByManager(allCompanies, manager.id);

    const leadsFilterCompany = filterLeads(leads, manager.id);
    // const filteredCompaniesByManager = allLeadsWithCompanies.filter(
    //   (company) => {
    //     return (
    //       company.companyLeads.length > 0 &&
    //       (company.responsible_id == firstManager ||
    //         company.responsible_id == secondManage)
    //     );
    //   }
    // );
    const filteredCompaniesByManager = allLeadsWithCompanies.filter(
      (company) => {
        return (
          company.companyLeads.length > 0 &&
          company.responsible_id == manager.id
        );
      }
    );
    const filteredInactiveCompaniesByManager = allLeadsWithCompanies.filter(
      (company) => {
        return (
          company.companyLeads.length == 0 &&
          company.responsible_id == manager.id
        );
      }
    );

    const leadCount = filteredCompaniesByManager.reduce((acc, curr) => {
      if (curr.responsible_id == manager.id) {
        acc = acc + 1;
      }

      return acc;
    }, 0);

    return {
      ...manager,
      allManagerLeads,
      leadsFilterCompany,
      leadCount,
      filteredCompaniesByManager,
      filteredInactiveCompaniesByManager,
    };
  });

  const results = await Promise.all(managersWithLeads);
  console.log(results);
  renderManagers(results);

  const firstUserButton = document.querySelectorAll(".js-button-firstUser");
  const centerStyle = document.querySelectorAll(".js-Center");
  firstUserButton.forEach((style) => {
    style.style.textAlign = "center";
  });

  centerStyle.forEach((element) => {
    element.style.textAlign = "center";
  });

  const activeCompanyFirstTable = document.querySelector(
    "#activeCompanyFirstTable"
  );
  const inactiveCompanyFirstTable = document.querySelector(
    "#inactiveCompanyFirstTable"
  );

  results.map((item) => {
    item.filteredCompaniesByManager.map((manager, index) => {
      // console.log(manager.responsible_id);
      firstUserButton.forEach((button) => {
        button.addEventListener("click", (e) => {
          console.log(e.target.dataset.managerid);

          if (e.target.dataset.managerid === manager.responsible_id) {
            const activeCompanyRow = document.createElement("tr");
            const activeCompanyNumber = document.createElement("td");
            const activeCompanyName = document.createElement("td");
            const activeCompanyAmoId = document.createElement("td");
            activeCompanyAmoId.classList = "companyID";
            activeCompanyNumber.textContent = `${index + 1} .`;
            activeCompanyName.textContent = manager.name;
            activeCompanyAmoId.textContent = manager.amo_id;
            activeCompanyAmoId.style.color = "blue";
            activeCompanyAmoId.style.cursor = "pointer";
            activeCompanyFirstTable.addEventListener("click", (event) => {
              if (event.target.classList.contains("companyID")) {
                event.preventDefault();
                // console.log(event.target);
                const companyIdTarget = event.target.innerText;
                console.log(companyIdTarget);
                window.open(
                  `https://jenyanour.amocrm.ru/companies/detail/${companyIdTarget}`,
                  "_blank"
                );
              }
            });
            activeCompanyRow.append(activeCompanyNumber);
            activeCompanyRow.append(activeCompanyName);
            activeCompanyRow.append(activeCompanyAmoId);
            activeCompanyFirstTable.append(activeCompanyRow);
          }
        });
      });
    });
  });

  results.map((item) => {
    item.filteredInactiveCompaniesByManager.map((manager, index) => {
      // console.log(manager.responsible_id);
      firstUserButton.forEach((button) => {
        button.addEventListener("click", (e) => {
          console.log(e.target.dataset.managerid);
          if (e.target.dataset.managerid === manager.responsible_id) {
            const CompanyRow = document.createElement("tr");
            const CompanyNumber = document.createElement("td");
            const CompanyName = document.createElement("td");
            const CompanyAmoId = document.createElement("td");
            CompanyAmoId.classList = "inactivecompanyID";
            CompanyNumber.textContent = `${index + 1} .`;
            CompanyName.textContent = manager.name;
            CompanyAmoId.textContent = manager.amo_id;
            CompanyAmoId.style.color = "blue";
            CompanyAmoId.style.cursor = "pointer";
            inactiveCompanyFirstTable.addEventListener("click", (event) => {
              if (event.target.classList.contains("inactivecompanyID")) {
                event.preventDefault();
                // console.log(event.target);
                const companyIdTarget = event.target.innerText;
                console.log(companyIdTarget);
                window.open(
                  `https://jenyanour.amocrm.ru/companies/detail/${companyIdTarget}`,
                  "_blank"
                );
              }
            });

            CompanyRow.append(CompanyNumber);
            CompanyRow.append(CompanyName);
            CompanyRow.append(CompanyAmoId);
            inactiveCompanyFirstTable.append(CompanyRow);
          }
        });
      });
    });
  });

  const btnClose = document.querySelectorAll(".btn-secondary");
  btnClose.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      activeCompanyFirstTable.innerHTML = " ";
      inactiveCompanyFirstTable.innerHTML = " ";
    })
  );

  const modal = document.querySelector(".modal");

  modal.addEventListener("hidden.bs.modal", function (event) {
    activeCompanyFirstTable.innerHTML = " ";
    inactiveCompanyFirstTable.innerHTML = " ";
  });
  // Второй модальник
}
render();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsMkhBQTJIO0FBQzNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxXQUFXO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCxXQUFXO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUFBa0UsZ0JBQWdCO0FBQ2xGO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULE9BQU87QUFDUCxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLFdBQVc7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtFQUFrRSxnQkFBZ0I7QUFDbEY7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1AsS0FBSztBQUNMLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2lkZ2V0Ly4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHVybCA9IG5ldyBVUkwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xyXG5sZXQgcHJlY2VudDtcclxubGV0IHRoZWFkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy10aGVhZFwiKTtcclxubGV0IHRib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy10Ym9keVwiKTtcclxubGV0IHRhYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5qcy10YWJsZVwiKTtcclxuXHJcbmZ1bmN0aW9uIHRoQ3JlYXRpb24oY2xhc3NsaXN0LCB0ZXh0KSB7XHJcbiAgbGV0IHRoID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRoXCIpO1xyXG4gIHRoLnNjb3BlID0gY2xhc3NsaXN0O1xyXG4gIHRoLmlubmVyVGV4dCA9IHRleHQ7XHJcbiAgcmV0dXJuIHRoO1xyXG59XHJcbmZ1bmN0aW9uIHRoZWFkQXBwZW5kKCkge1xyXG4gIGxldCB0aGVhZEZyYWdtZW50ID0gbmV3IERvY3VtZW50RnJhZ21lbnQoKTtcclxuICB0aGVhZC5hcHBlbmQodGhDcmVhdGlvbihcImNvbFwiLCBcIiNcIikpO1xyXG4gIHRoZWFkLmFwcGVuZCh0aENyZWF0aW9uKFwiY29sXCIsIFwi0KHQv9C40YHQvtC6INGB0L7RgtGA0YPQtNC90LjQutC+0LJcIikpO1xyXG4gIHRoZWFkLmFwcGVuZCh0aENyZWF0aW9uKFwiY29sXCIsIFwi0JrQvtC70LjRh9C10YHRgtCy0L4g0LDQutGC0LjQstC90YvRhSDQu9C40LTQvtCyXCIpKTtcclxuICB0aGVhZC5hcHBlbmQodGhDcmVhdGlvbihcImNvbFwiLCBcItCf0YDQvtGG0LXQvdGC0YtcIikpO1xyXG5cclxuICB0aGVhZEZyYWdtZW50LmFwcGVuZCh0aGVhZCk7XHJcbiAgcmV0dXJuIHRoZWFkRnJhZ21lbnQ7XHJcbn1cclxuXHJcbi8vIHRhYmxlLmFwcGVuZCh0aGVhZEFwcGVuZCgpKTtcclxuXHJcbmxldCBtb250aHNXaXRoUXVvdGVyID0ge1xyXG4gIDA6IDEsXHJcbiAgMTogMSxcclxuICAyOiAxLFxyXG4gIDM6IDIsXHJcbiAgNDogMixcclxuICA1OiAyLFxyXG4gIDY6IDMsXHJcbiAgNzogMyxcclxuICA4OiAzLFxyXG4gIDk6IDQsXHJcbiAgMTA6IDQsXHJcbiAgMTE6IDQsXHJcbn07XHJcblxyXG4vLyBsZXQgb3V0MyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIub3V0M1wiKTtcclxuXHJcbi8vINGH0YLQviDQv9C+0LTQsNC10Lwg0L3QsCDQstGF0L7QtDpcclxuLy8gIGFyckRhdGVmcm9tO1xyXG4vLyDRh9GC0L4g0LLQvtC30LLRgNCw0YnQsNC10LwgIC0gcmV0dXJuIHF1YXJ0ZXJcclxuXHJcbmxldCBkYXRlID0gbmV3IERhdGUoKTtcclxuLy8gY29uc3QgZm9ybWF0dGVkRGF0ZSA9IGRhdGVGbnMuZm9ybWF0KGRhdGUsIFwiZGQuTU0ueXl5eVwiKTtcclxuY29uc3QgZm9ybWF0dGVkRGF0ZSA9IG5ldyBEYXRlKClcclxuICAudG9Mb2NhbGVEYXRlU3RyaW5nKFwiZW4tR0JcIiwge1xyXG4gICAgZGF5OiBcIjItZGlnaXRcIixcclxuICAgIG1vbnRoOiBcIjItZGlnaXRcIixcclxuICAgIHllYXI6IFwibnVtZXJpY1wiLFxyXG4gIH0pXHJcbiAgLnNwbGl0KFwiL1wiKVxyXG4gIC5qb2luKFwiLlwiKTtcclxuXHJcbmZ1bmN0aW9uIGZpbmRNb250aFF1YXJ0ZXIoZGF0ZSkge1xyXG4gIGxldCBhcnJEYXRhV2l0aG91dERvdCA9IGRhdGUuc3BsaXQoXCIuXCIpO1xyXG4gIGxldCBbZGF5LCBtb250aCwgeWVhcl0gPSBhcnJEYXRhV2l0aG91dERvdDtcclxuICBsZXQgZGF0ZURheU1vbnRoWWVhciA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXkpO1xyXG4gIGxldCBmaW5kUXVhcnRlciA9XHJcbiAgICBtb250aHNXaXRoUXVvdGVyW1xyXG4gICAgICBkYXRlRGF5TW9udGhZZWFyLmdldE1vbnRoKClcclxuICAgIF07IC8qICDQrdGC0L4g0YLQvtC20LUg0YHQsNC80L7QtSwg0YfRgtC+INC4ICBsZXQgbW9udGhJdGVtRFQgPSBhcnIuZmluZCgoaXRlbSkgPT4gaXRlbS5tb250aCA9PSBEYXRldG8uZ2V0TW9udGgoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1vbnRoSXRlbURULnF1YXJ0ZXIpOyAgICovXHJcbiAgcmV0dXJuIGZpbmRRdWFydGVyO1xyXG59XHJcblxyXG5jb25zdCBwZXJpb2QgPSB1cmwuc2VhcmNoUGFyYW1zLmdldChcInBlcmlvZFwiKTtcclxuXHJcbi8vIGNvbnN0IGN1cnJlbnREYXRlID0gbmV3IERhdGUoKTtcclxuLy8gbGV0IGN1cnJlbnRRdWF0ZXIgPSBmaW5kTW9udGhRdWFydGVyKGZvcm1hdHRlZERhdGUpO1xyXG5sZXQgcGVyaW9kTmluZXR5RGF5cyA9IG5ldyBEYXRlKCk7XHJcbnBlcmlvZE5pbmV0eURheXMuc2V0SG91cnMoMCk7XHJcbnBlcmlvZE5pbmV0eURheXMuc2V0TWludXRlcygwKTtcclxucGVyaW9kTmluZXR5RGF5cy5zZXRTZWNvbmRzKDApO1xyXG5cclxuZnVuY3Rpb24gcXVhcnRlckN1cnJlbnQoKSB7XHJcbiAgbGV0IHBlcmlvZE5pbmV0eURheUVuZCA9IG5ldyBEYXRlKCk7XHJcbiAgcGVyaW9kTmluZXR5RGF5RW5kLnNldEhvdXJzKDApO1xyXG4gIHBlcmlvZE5pbmV0eURheUVuZC5zZXRNaW51dGVzKDU5KTtcclxuICBwZXJpb2ROaW5ldHlEYXlFbmQuc2V0U2Vjb25kcyg1OSk7XHJcbiAgbGV0IHRpbWVzdGFtcHREYXRlVG8gPSBNYXRoLmZsb29yKHBlcmlvZE5pbmV0eURheUVuZC5nZXRUaW1lKCkgLyAxMDAwKTtcclxuXHJcbiAgLy8gbGV0IHJlc3VsdERhdGUgPSBkYXRlRm5zLnN1YkRheXMocGVyaW9kTmluZXR5RGF5cywgOTApO1xyXG4gIGNvbnN0IHJlc3VsdERhdGUgPSBuZXcgRGF0ZShcclxuICAgIG5ldyBEYXRlKHBlcmlvZE5pbmV0eURheXMpLmdldFRpbWUoKSAtIDkwICogMjQgKiA2MCAqIDYwICogMTAwMFxyXG4gICk7XHJcbiAgbGV0IHRpbWVzdGFtcHREYXRlRnJvbSA9IE1hdGguZmxvb3IocmVzdWx0RGF0ZS5nZXRUaW1lKCkgLyAxMDAwKTtcclxuXHJcbiAgcmV0dXJuIHsgdGltZXN0YW1wdERhdGVGcm9tLCB0aW1lc3RhbXB0RGF0ZVRvIH07XHJcbn1cclxuXHJcbmxldCBmaWx0ZXJEYXRlUGFyYW1zID0ge1xyXG4gIGZyb206IHF1YXJ0ZXJDdXJyZW50KCkudGltZXN0YW1wdERhdGVGcm9tLFxyXG4gIHRvOiBxdWFydGVyQ3VycmVudCgpLnRpbWVzdGFtcHREYXRlVG8sXHJcbn07XHJcbmZ1bmN0aW9uIGxvYWRNYW5hZ2VycygpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgdXJsOiBcImh0dHBzOi8vYW1hcmFudGEuaW0zMDAwLnJ1L2JvdC93aWRnZXQvbXkvdXNlcnNfanNvbi5waHBcIixcclxuICAgICAgdHlwZTogXCJwb3N0XCIsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICB0eXBlOiBcIm1hbmFnZXJzXCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIiwgLy8gRXhwZWN0ZWQgcmVzcG9uc2UgZGF0YSB0eXBlXHJcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgfSxcclxuICAgICAgZXJyb3I6IGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gbG9hZENvbXBhbmllcygpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgdXJsOiBcImh0dHBzOi8vYW1hcmFudGEuaW0zMDAwLnJ1L2JvdC93aWRnZXQvbXkvY29tcGFuaWVzX2pzb24ucGhwXCIsXHJcbiAgICAgIG1ldGhvZDogXCJnZXRcIixcclxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICBkYXRhOiB7fSxcclxuICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICByZXNvbHZlKGRhdGEpO1xyXG4gICAgICB9LFxyXG4gICAgICBlcnJvcjogZnVuY3Rpb24gKGVycm9yKSB7XHJcbiAgICAgICAgcmVqZWN0KGVycm9yKTtcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcbmZ1bmN0aW9uIGZpbHRlckxlYWRzQnlNYW5hZ2VyKGxlYWRzLCBtYW5hZ2VySWQpIHtcclxuICBjb25zdCBmaWx0ZXJlZERhdGEgPSBsZWFkcy5maWx0ZXIoXHJcbiAgICAoaXRlbSkgPT4gTnVtYmVyKGl0ZW0ucmVzcG9uc2libGVfaWQpID09PSBtYW5hZ2VySWRcclxuICApO1xyXG5cclxuICByZXR1cm4gZmlsdGVyZWREYXRhO1xyXG59XHJcblxyXG5mdW5jdGlvbiBsb2FkTGVhZHMobWFuYWdlcklkKSB7XHJcbiAgY29uc3QgcXVlcnlQYXJhbXMgPSB7XHJcbiAgICB0eXBlOiBcImZpbHRlcl9sZWFkc1wiLFxyXG5cclxuICAgIGRhdGE6IGZpbHRlckRhdGVQYXJhbXMsXHJcbiAgfTtcclxuXHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICQuYWpheCh7XHJcbiAgICAgIHVybDogXCJodHRwczovL2FtYXJhbnRhLmltMzAwMC5ydS9ib3Qvd2lkZ2V0L1wiLFxyXG4gICAgICB0eXBlOiBcInBvc3RcIixcclxuICAgICAgZGF0YTogcXVlcnlQYXJhbXMsXHJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIiwgLy8gRXhwZWN0ZWQgcmVzcG9uc2UgZGF0YSB0eXBlXHJcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhKTtcclxuICAgICAgfSxcclxuICAgICAgZXJyb3I6IGZ1bmN0aW9uIChlcnJvcikge1xyXG4gICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuZnVuY3Rpb24gZmlsdGVyTGVhZHMobGVhZHNzLCBtYW5hZ2VySWQpIHtcclxuICBjb25zdCBmaWx0ZXJlZERhdGFzID0gbGVhZHNzLmZpbHRlcihcclxuICAgIChpdGVtKSA9PiBOdW1iZXIoaXRlbS5jb21wYW55X3Jlc3BvbnNpYmxlX2lkKSA9PSBtYW5hZ2VySWRcclxuICApO1xyXG5cclxuICByZXR1cm4gZmlsdGVyZWREYXRhcztcclxufVxyXG5cclxuZnVuY3Rpb24gcmVuZGVyTWFuYWdlcnMobWFuYWdlcnMpIHtcclxuICBjb25zdCBmcmFnbWVudCA9ICQoZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpKTtcclxuICBsZXQgbnVtID0gMDtcclxuICBtYW5hZ2Vycy5mb3JFYWNoKChtYW5hZ2VyLCBpbmRleCkgPT4ge1xyXG4gICAgY29uc3QgYWxsTGVhZHNDb3VudCA9IG1hbmFnZXIuYWxsTWFuYWdlckxlYWRzLmxlbmd0aDtcclxuXHJcbiAgICBjb25zdCBwZXJjZW50T2ZDb21wbGV0ZWRMZWFkcyA9IGFsbExlYWRzQ291bnRcclxuICAgICAgPyBNYXRoLnJvdW5kKChtYW5hZ2VyLmxlYWRDb3VudCAqIDEwMCkgLyBhbGxMZWFkc0NvdW50KVxyXG4gICAgICA6IDA7XHJcbiAgICBjb25zdCAkcm93ID0gJChcIjx0cj5cIik7XHJcblxyXG4gICAgY29uc3QgJGluZGV4ID0gJChcIjx0ZD5cIikudGV4dCgobnVtID0gbnVtICsgMSkpO1xyXG5cclxuICAgIGNvbnN0ICRuYW1lID0gJChcIjx0ZD5cIikudGV4dChtYW5hZ2VyLm5hbWUpO1xyXG5cclxuICAgIGNvbnN0ICRsZWFkc0NvdW50ID0gJChcIjx0ZD5cIikudGV4dChtYW5hZ2VyLmxlYWRDb3VudCk7XHJcblxyXG4gICAgJGxlYWRzQ291bnQuYWRkQ2xhc3MoXCJqcy1idXR0b24tZmlyc3RVc2VyXCIpO1xyXG4gICAgJGxlYWRzQ291bnQuYXR0cihcImRhdGEtYnMtdG9nZ2xlXCIsIFwibW9kYWxcIik7XHJcbiAgICAkbGVhZHNDb3VudC5hdHRyKFwiZGF0YS1icy10YXJnZXRcIiwgXCIjZmlyc3RNb2RhbFwiKTtcclxuICAgICRsZWFkc0NvdW50LmF0dHIoXCJkYXRhLW1hbmFnZXJJRFwiLCBgJHttYW5hZ2VyLmlkfWApO1xyXG5cclxuICAgIC8vIGNvbnN0ICRjb21wbGV0ZWRMZWFkc0NvdW50ID0gJChcIjx0ZD5cIikudGV4dChtYW5hZ2VyLmNvbXBsZXRlZExlYWRzLmxlbmd0aCk7XHJcbiAgICAvLyBjb25zdCAkYWxsTGVhZHNDb3VudCA9ICQoXCI8dGQ+XCIpLnRleHQoYWxsTGVhZHNDb3VudCk7XHJcbiAgICBjb25zdCAkcGVyY2VudCA9ICQoXCI8dGQ+XCIpLnRleHQocGVyY2VudE9mQ29tcGxldGVkTGVhZHMgKyBcIiVcIik7XHJcbiAgICAkcGVyY2VudC5hZGRDbGFzcyhcImpzLUNlbnRlclwiKTtcclxuICAgIGNvbnN0ICRuYW1lcyA9ICQoXCI8dGQ+XCIpLnRleHQobWFuYWdlci5uYW1lQ29tcGFueSk7XHJcbiAgICAvLyBjb25zb2xlLmxvZyhtYW5hZ2VyLnRlc3QpO1xyXG4gICAgLy8gY29uc29sZS5sb2coJG5hbWVzKTtcclxuICAgIC8vINCe0LHRidC10LUg0LrQvtC7LdCy0L4gLSAxMDAlXHJcbiAgICAvLyDQmtC+0Lst0LLQviDQt9Cw0LLQtdGA0YjQvSAtIHglXHJcblxyXG4gICAgY29uc3QgcGVyY2VudENsb3NlZExlYWRzID0gJHJvd1xyXG4gICAgICAuYXBwZW5kKCRpbmRleClcclxuICAgICAgLmFwcGVuZCgkbmFtZSlcclxuICAgICAgLy8gLmFwcGVuZCgkYWxsTGVhZHNDb3VudClcclxuICAgICAgLmFwcGVuZCgkbGVhZHNDb3VudClcclxuICAgICAgLy8gLmFwcGVuZCgkY29tcGxldGVkTGVhZHNDb3VudClcclxuICAgICAgLmFwcGVuZCgkcGVyY2VudClcclxuICAgICAgLmFwcGVuZCgkbmFtZXMpO1xyXG5cclxuICAgIGZyYWdtZW50LmFwcGVuZCgkcm93KTtcclxuICB9KTtcclxuXHJcbiAgJChcIi5qcy10Ym9keVwiKS5hcHBlbmQoZnJhZ21lbnQpO1xyXG59XHJcblxyXG4vL1xyXG5cclxuZnVuY3Rpb24gZmlsdGVyTGVhZHMyKGxlYWRzcywgYW1vX2lkKSB7XHJcbiAgY29uc3QgZmlsdGVyZWREYXRhcyA9IGxlYWRzcy5maWx0ZXIoKGl0ZW0pID0+IGl0ZW0uYW1vX2NvbXBhbnlfaWQgPT0gYW1vX2lkKTtcclxuXHJcbiAgcmV0dXJuIGZpbHRlcmVkRGF0YXM7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHJlbmRlcigpIHtcclxuICBjb25zdCBtYW5hZ2VycyA9IGF3YWl0IGxvYWRNYW5hZ2VycygpO1xyXG4gIGNvbnN0IGxlYWRzID0gYXdhaXQgbG9hZExlYWRzKCk7XHJcbiAgLy8gY29uc29sZS5sb2cobGVhZHMpO1xyXG4gIC8vIDEuINC30LDQs9GA0YPQt9C40YLRjCDQstGB0LUg0LvQuNC00YtcclxuICBjb25zdCBhbGxDb21wYW5pZXMgPSBhd2FpdCBsb2FkQ29tcGFuaWVzKCk7XHJcblxyXG4gIGNvbnN0IGFsbExlYWRzV2l0aENvbXBhbmllcyA9IGFsbENvbXBhbmllcy5tYXAoKGNvbXBhbnkpID0+IHtcclxuICAgIGNvbnN0IGNvbXBhbnlMZWFkcyA9IGZpbHRlckxlYWRzMihsZWFkcywgY29tcGFueS5hbW9faWQpO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIC4uLmNvbXBhbnksXHJcbiAgICAgIGNvbXBhbnlMZWFkcyxcclxuICAgIH07XHJcbiAgfSk7XHJcblxyXG4gIC8vIGNvbnN0IGZpbHRlcmVkQWN0aXZlQ29tcGFuaWVzQnlNYW5hZ2VyID0gYWxsTGVhZHNXaXRoQ29tcGFuaWVzLmZpbHRlcihcclxuICAvLyAgIChjb21wYW55KSA9PiB7XHJcbiAgLy8gICAgIHJldHVybiAoXHJcbiAgLy8gICAgICAgY29tcGFueS5jb21wYW55TGVhZHMubGVuZ3RoID4gMCAmJlxyXG4gIC8vICAgICAgIChjb21wYW55LnJlc3BvbnNpYmxlX2lkID09IGZpcnN0TWFuYWdlciB8fFxyXG4gIC8vICAgICAgICAgY29tcGFueS5yZXNwb25zaWJsZV9pZCA9PSBzZWNvbmRNYW5hZ2UpXHJcbiAgLy8gICAgICk7XHJcbiAgLy8gICB9XHJcbiAgLy8gKTtcclxuXHJcbiAgLy8gY29uc3QgbmFtZUNvbXBhbnlGaXJzdFVzZXIgPSBmaWx0ZXJlZEFjdGl2ZUNvbXBhbmllc0J5TWFuYWdlci5tYXAoKGl0ZW0pID0+IHtcclxuICAvLyAgIGlmIChpdGVtLnJlc3BvbnNpYmxlX2lkID09IFwiNjg4OTAzOFwiKSB7XHJcbiAgLy8gICAgIGxldCBjb21wYW55TmFtZSA9IGl0ZW0ubmFtZTtcclxuICAvLyAgICAgbGV0IGNvbXBhbnlBbW9JZCA9IGl0ZW0uYW1vX2lkO1xyXG4gIC8vICAgICByZXR1cm4geyBjb21wYW55TmFtZSwgY29tcGFueUFtb0lkIH07XHJcbiAgLy8gICB9XHJcbiAgLy8gfSk7XHJcblxyXG4gIC8vIGNvbnN0IGZpbHRlcmVkRmlyc3RVc2VyID0gbmFtZUNvbXBhbnlGaXJzdFVzZXIuZmlsdGVyKGZ1bmN0aW9uIChlbCkge1xyXG4gIC8vICAgcmV0dXJuIGVsICE9IG51bGw7XHJcbiAgLy8gfSk7XHJcblxyXG4gIGNvbnN0IG1hbmFnZXJzV2l0aExlYWRzID0gbWFuYWdlcnMubWFwKGFzeW5jIChtYW5hZ2VyKSA9PiB7XHJcbiAgICAvLyDQvtGC0YTQuNC70YzRgtC+0LvQstCw0YLRjCDQu9C40LTRiyDQv9C+INC80LXQvdC10LTQttC10YDRg1xyXG5cclxuICAgIGNvbnN0IGFsbE1hbmFnZXJMZWFkcyA9IGZpbHRlckxlYWRzQnlNYW5hZ2VyKGFsbENvbXBhbmllcywgbWFuYWdlci5pZCk7XHJcblxyXG4gICAgY29uc3QgbGVhZHNGaWx0ZXJDb21wYW55ID0gZmlsdGVyTGVhZHMobGVhZHMsIG1hbmFnZXIuaWQpO1xyXG4gICAgLy8gY29uc3QgZmlsdGVyZWRDb21wYW5pZXNCeU1hbmFnZXIgPSBhbGxMZWFkc1dpdGhDb21wYW5pZXMuZmlsdGVyKFxyXG4gICAgLy8gICAoY29tcGFueSkgPT4ge1xyXG4gICAgLy8gICAgIHJldHVybiAoXHJcbiAgICAvLyAgICAgICBjb21wYW55LmNvbXBhbnlMZWFkcy5sZW5ndGggPiAwICYmXHJcbiAgICAvLyAgICAgICAoY29tcGFueS5yZXNwb25zaWJsZV9pZCA9PSBmaXJzdE1hbmFnZXIgfHxcclxuICAgIC8vICAgICAgICAgY29tcGFueS5yZXNwb25zaWJsZV9pZCA9PSBzZWNvbmRNYW5hZ2UpXHJcbiAgICAvLyAgICAgKTtcclxuICAgIC8vICAgfVxyXG4gICAgLy8gKTtcclxuICAgIGNvbnN0IGZpbHRlcmVkQ29tcGFuaWVzQnlNYW5hZ2VyID0gYWxsTGVhZHNXaXRoQ29tcGFuaWVzLmZpbHRlcihcclxuICAgICAgKGNvbXBhbnkpID0+IHtcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgY29tcGFueS5jb21wYW55TGVhZHMubGVuZ3RoID4gMCAmJlxyXG4gICAgICAgICAgY29tcGFueS5yZXNwb25zaWJsZV9pZCA9PSBtYW5hZ2VyLmlkXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIGNvbnN0IGZpbHRlcmVkSW5hY3RpdmVDb21wYW5pZXNCeU1hbmFnZXIgPSBhbGxMZWFkc1dpdGhDb21wYW5pZXMuZmlsdGVyKFxyXG4gICAgICAoY29tcGFueSkgPT4ge1xyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICBjb21wYW55LmNvbXBhbnlMZWFkcy5sZW5ndGggPT0gMCAmJlxyXG4gICAgICAgICAgY29tcGFueS5yZXNwb25zaWJsZV9pZCA9PSBtYW5hZ2VyLmlkXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBsZWFkQ291bnQgPSBmaWx0ZXJlZENvbXBhbmllc0J5TWFuYWdlci5yZWR1Y2UoKGFjYywgY3VycikgPT4ge1xyXG4gICAgICBpZiAoY3Vyci5yZXNwb25zaWJsZV9pZCA9PSBtYW5hZ2VyLmlkKSB7XHJcbiAgICAgICAgYWNjID0gYWNjICsgMTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIGFjYztcclxuICAgIH0sIDApO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIC4uLm1hbmFnZXIsXHJcbiAgICAgIGFsbE1hbmFnZXJMZWFkcyxcclxuICAgICAgbGVhZHNGaWx0ZXJDb21wYW55LFxyXG4gICAgICBsZWFkQ291bnQsXHJcbiAgICAgIGZpbHRlcmVkQ29tcGFuaWVzQnlNYW5hZ2VyLFxyXG4gICAgICBmaWx0ZXJlZEluYWN0aXZlQ29tcGFuaWVzQnlNYW5hZ2VyLFxyXG4gICAgfTtcclxuICB9KTtcclxuXHJcbiAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKG1hbmFnZXJzV2l0aExlYWRzKTtcclxuICBjb25zb2xlLmxvZyhyZXN1bHRzKTtcclxuICByZW5kZXJNYW5hZ2VycyhyZXN1bHRzKTtcclxuXHJcbiAgY29uc3QgZmlyc3RVc2VyQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1idXR0b24tZmlyc3RVc2VyXCIpO1xyXG4gIGNvbnN0IGNlbnRlclN0eWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1DZW50ZXJcIik7XHJcbiAgZmlyc3RVc2VyQnV0dG9uLmZvckVhY2goKHN0eWxlKSA9PiB7XHJcbiAgICBzdHlsZS5zdHlsZS50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xyXG4gIH0pO1xyXG5cclxuICBjZW50ZXJTdHlsZS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XHJcbiAgICBlbGVtZW50LnN0eWxlLnRleHRBbGlnbiA9IFwiY2VudGVyXCI7XHJcbiAgfSk7XHJcblxyXG4gIGNvbnN0IGFjdGl2ZUNvbXBhbnlGaXJzdFRhYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgIFwiI2FjdGl2ZUNvbXBhbnlGaXJzdFRhYmxlXCJcclxuICApO1xyXG4gIGNvbnN0IGluYWN0aXZlQ29tcGFueUZpcnN0VGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgXCIjaW5hY3RpdmVDb21wYW55Rmlyc3RUYWJsZVwiXHJcbiAgKTtcclxuXHJcbiAgcmVzdWx0cy5tYXAoKGl0ZW0pID0+IHtcclxuICAgIGl0ZW0uZmlsdGVyZWRDb21wYW5pZXNCeU1hbmFnZXIubWFwKChtYW5hZ2VyLCBpbmRleCkgPT4ge1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhtYW5hZ2VyLnJlc3BvbnNpYmxlX2lkKTtcclxuICAgICAgZmlyc3RVc2VyQnV0dG9uLmZvckVhY2goKGJ1dHRvbikgPT4ge1xyXG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGUudGFyZ2V0LmRhdGFzZXQubWFuYWdlcmlkKTtcclxuXHJcbiAgICAgICAgICBpZiAoZS50YXJnZXQuZGF0YXNldC5tYW5hZ2VyaWQgPT09IG1hbmFnZXIucmVzcG9uc2libGVfaWQpIHtcclxuICAgICAgICAgICAgY29uc3QgYWN0aXZlQ29tcGFueVJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0clwiKTtcclxuICAgICAgICAgICAgY29uc3QgYWN0aXZlQ29tcGFueU51bWJlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKTtcclxuICAgICAgICAgICAgY29uc3QgYWN0aXZlQ29tcGFueU5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGRcIik7XHJcbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZUNvbXBhbnlBbW9JZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKTtcclxuICAgICAgICAgICAgYWN0aXZlQ29tcGFueUFtb0lkLmNsYXNzTGlzdCA9IFwiY29tcGFueUlEXCI7XHJcbiAgICAgICAgICAgIGFjdGl2ZUNvbXBhbnlOdW1iZXIudGV4dENvbnRlbnQgPSBgJHtpbmRleCArIDF9IC5gO1xyXG4gICAgICAgICAgICBhY3RpdmVDb21wYW55TmFtZS50ZXh0Q29udGVudCA9IG1hbmFnZXIubmFtZTtcclxuICAgICAgICAgICAgYWN0aXZlQ29tcGFueUFtb0lkLnRleHRDb250ZW50ID0gbWFuYWdlci5hbW9faWQ7XHJcbiAgICAgICAgICAgIGFjdGl2ZUNvbXBhbnlBbW9JZC5zdHlsZS5jb2xvciA9IFwiYmx1ZVwiO1xyXG4gICAgICAgICAgICBhY3RpdmVDb21wYW55QW1vSWQuc3R5bGUuY3Vyc29yID0gXCJwb2ludGVyXCI7XHJcbiAgICAgICAgICAgIGFjdGl2ZUNvbXBhbnlGaXJzdFRhYmxlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcImNvbXBhbnlJRFwiKSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYW55SWRUYXJnZXQgPSBldmVudC50YXJnZXQuaW5uZXJUZXh0O1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coY29tcGFueUlkVGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKFxyXG4gICAgICAgICAgICAgICAgICBgaHR0cHM6Ly9qZW55YW5vdXIuYW1vY3JtLnJ1L2NvbXBhbmllcy9kZXRhaWwvJHtjb21wYW55SWRUYXJnZXR9YCxcclxuICAgICAgICAgICAgICAgICAgXCJfYmxhbmtcIlxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBhY3RpdmVDb21wYW55Um93LmFwcGVuZChhY3RpdmVDb21wYW55TnVtYmVyKTtcclxuICAgICAgICAgICAgYWN0aXZlQ29tcGFueVJvdy5hcHBlbmQoYWN0aXZlQ29tcGFueU5hbWUpO1xyXG4gICAgICAgICAgICBhY3RpdmVDb21wYW55Um93LmFwcGVuZChhY3RpdmVDb21wYW55QW1vSWQpO1xyXG4gICAgICAgICAgICBhY3RpdmVDb21wYW55Rmlyc3RUYWJsZS5hcHBlbmQoYWN0aXZlQ29tcGFueVJvdyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIHJlc3VsdHMubWFwKChpdGVtKSA9PiB7XHJcbiAgICBpdGVtLmZpbHRlcmVkSW5hY3RpdmVDb21wYW5pZXNCeU1hbmFnZXIubWFwKChtYW5hZ2VyLCBpbmRleCkgPT4ge1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhtYW5hZ2VyLnJlc3BvbnNpYmxlX2lkKTtcclxuICAgICAgZmlyc3RVc2VyQnV0dG9uLmZvckVhY2goKGJ1dHRvbikgPT4ge1xyXG4gICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGUudGFyZ2V0LmRhdGFzZXQubWFuYWdlcmlkKTtcclxuICAgICAgICAgIGlmIChlLnRhcmdldC5kYXRhc2V0Lm1hbmFnZXJpZCA9PT0gbWFuYWdlci5yZXNwb25zaWJsZV9pZCkge1xyXG4gICAgICAgICAgICBjb25zdCBDb21wYW55Um93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRyXCIpO1xyXG4gICAgICAgICAgICBjb25zdCBDb21wYW55TnVtYmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpO1xyXG4gICAgICAgICAgICBjb25zdCBDb21wYW55TmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ0ZFwiKTtcclxuICAgICAgICAgICAgY29uc3QgQ29tcGFueUFtb0lkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRkXCIpO1xyXG4gICAgICAgICAgICBDb21wYW55QW1vSWQuY2xhc3NMaXN0ID0gXCJpbmFjdGl2ZWNvbXBhbnlJRFwiO1xyXG4gICAgICAgICAgICBDb21wYW55TnVtYmVyLnRleHRDb250ZW50ID0gYCR7aW5kZXggKyAxfSAuYDtcclxuICAgICAgICAgICAgQ29tcGFueU5hbWUudGV4dENvbnRlbnQgPSBtYW5hZ2VyLm5hbWU7XHJcbiAgICAgICAgICAgIENvbXBhbnlBbW9JZC50ZXh0Q29udGVudCA9IG1hbmFnZXIuYW1vX2lkO1xyXG4gICAgICAgICAgICBDb21wYW55QW1vSWQuc3R5bGUuY29sb3IgPSBcImJsdWVcIjtcclxuICAgICAgICAgICAgQ29tcGFueUFtb0lkLnN0eWxlLmN1cnNvciA9IFwicG9pbnRlclwiO1xyXG4gICAgICAgICAgICBpbmFjdGl2ZUNvbXBhbnlGaXJzdFRhYmxlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhcImluYWN0aXZlY29tcGFueUlEXCIpKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBhbnlJZFRhcmdldCA9IGV2ZW50LnRhcmdldC5pbm5lclRleHQ7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjb21wYW55SWRUYXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oXHJcbiAgICAgICAgICAgICAgICAgIGBodHRwczovL2plbnlhbm91ci5hbW9jcm0ucnUvY29tcGFuaWVzL2RldGFpbC8ke2NvbXBhbnlJZFRhcmdldH1gLFxyXG4gICAgICAgICAgICAgICAgICBcIl9ibGFua1wiXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBDb21wYW55Um93LmFwcGVuZChDb21wYW55TnVtYmVyKTtcclxuICAgICAgICAgICAgQ29tcGFueVJvdy5hcHBlbmQoQ29tcGFueU5hbWUpO1xyXG4gICAgICAgICAgICBDb21wYW55Um93LmFwcGVuZChDb21wYW55QW1vSWQpO1xyXG4gICAgICAgICAgICBpbmFjdGl2ZUNvbXBhbnlGaXJzdFRhYmxlLmFwcGVuZChDb21wYW55Um93KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuXHJcbiAgY29uc3QgYnRuQ2xvc2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmJ0bi1zZWNvbmRhcnlcIik7XHJcbiAgYnRuQ2xvc2UuZm9yRWFjaCgoYnRuKSA9PlxyXG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xyXG4gICAgICBhY3RpdmVDb21wYW55Rmlyc3RUYWJsZS5pbm5lckhUTUwgPSBcIiBcIjtcclxuICAgICAgaW5hY3RpdmVDb21wYW55Rmlyc3RUYWJsZS5pbm5lckhUTUwgPSBcIiBcIjtcclxuICAgIH0pXHJcbiAgKTtcclxuXHJcbiAgY29uc3QgbW9kYWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLm1vZGFsXCIpO1xyXG5cclxuICBtb2RhbC5hZGRFdmVudExpc3RlbmVyKFwiaGlkZGVuLmJzLm1vZGFsXCIsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgYWN0aXZlQ29tcGFueUZpcnN0VGFibGUuaW5uZXJIVE1MID0gXCIgXCI7XHJcbiAgICBpbmFjdGl2ZUNvbXBhbnlGaXJzdFRhYmxlLmlubmVySFRNTCA9IFwiIFwiO1xyXG4gIH0pO1xyXG4gIC8vINCS0YLQvtGA0L7QuSDQvNC+0LTQsNC70YzQvdC40LpcclxufVxyXG5yZW5kZXIoKTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9