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
import { fi } from "date-fns/locale";
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

function quarterCurrent() {
  let timestamptDateTo = Math.floor(currentDate.getTime() / 1000);

  let resultDate = dateFns.subDays(currentDate, 90);
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

function loadCompanies() {
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
        ? Math.round((manager.leadCount * 100) / allLeadsCount)
        : 0;
      const $row = $("<tr>");

      const $index = $("<td>").text((num = num + 1));

      const $name = $("<td>").text(manager.name);

      const $leadsCount = $("<td>").text(manager.leadCount);

      if (manager.id == "6889038") {
        $leadsCount.addClass("js-button-firstUser");
        $leadsCount.attr("data-bs-toggle", "modal");
        $leadsCount.attr("data-bs-target", "#firstModal");
      }
      if (manager.id == "9206253") {
        $leadsCount.addClass("js-button-secondUser");
        $leadsCount.attr("data-bs-toggle", "modal");
        $leadsCount.attr("data-bs-target", "#exampleModal");
      }
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
    }
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

  const firstManager = "9206253";
  const secondManage = "6889038";
  const filteredCompaniesByManager2 = allLeadsWithCompanies.filter(
    (company) => {
      return (
        company.companyLeads.length > 0 &&
        (company.responsible_id == firstManager ||
          company.responsible_id == secondManage)
      );
    }
  );
  const nameCompanyFirstUser = filteredCompaniesByManager2.map((item) => {
    if (item.responsible_id == "6889038") {
      let companyName = item.name;
      let companyAmoId = item.amo_id;
      return { companyName, companyAmoId };
    }
  });
  const filteredFirstUser = nameCompanyFirstUser.filter(function (el) {
    return el != null;
  });

  const nameCompanySecondtUser = filteredCompaniesByManager2.map((item) => {
    if (item.responsible_id == "9206253") {
      let companyName = item.name;
      let companyAmoId = item.amo_id;
      return { companyName, companyAmoId };
    }
  });

  const filteredSecondtUser = nameCompanySecondtUser.filter(function (el) {
    return el != null;
  });
  const managersWithLeads = managers.map(async (manager) => {
    // отфильтолвать лиды по менеджеру

    const allManagerLeads = filterLeadsByManager(allCompanies, manager.id);

    const leadsFilterCompany = filterLeads(leads, manager.id);
    const filteredCompaniesByManager = allLeadsWithCompanies.filter(
      (company) => {
        return (
          company.companyLeads.length > 0 &&
          (company.responsible_id == firstManager ||
            company.responsible_id == secondManage)
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
    };
  });

  const results = await Promise.all(managersWithLeads);
  console.log(results);
  renderManagers(results);

  const firstUserButton = document.querySelector(".js-button-firstUser");
  const secondUserButton = document.querySelector(".js-button-secondUser");
  const centerStyle = document.querySelectorAll(".js-Center");
  firstUserButton.style.textAlign = "center";

  centerStyle.forEach((element) => {
    element.style.textAlign = "center";
  });
  secondUserButton.style.textAlign = "center";
  // firstUserButton.addEventListener("click", (event) => {
  const table = document.querySelector("#myTable");
  filteredFirstUser.forEach((element, index) => {
    const row = document.createElement("tr");
    const companyNumber = document.createElement("td");
    const companyName = document.createElement("td");
    const companyAmoId = document.createElement("td");
    companyAmoId.classList = "companyID";
    companyNumber.textContent = `${index + 1} .`;
    companyName.textContent = element.companyName;
    companyAmoId.textContent = element.companyAmoId;
    companyAmoId.style.color = "blue";
    companyAmoId.style.cursor = "pointer";
    table.addEventListener("click", (event) => {
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
    // let amoId = document.querySelectorAll(".companyID");
    // amoId.forEach((item) => {
    //   item.addEventListener("click", followinglink);
    //   function followinglink(event) {
    //     const companyIdTarget = event.target.innerText;

    //     window.open(
    //       `https://jenyanour.amocrm.ru/companies/detail/${companyIdTarget}`,
    //       "_blank"
    //     );
    //   }
    // });

    row.append(companyNumber);
    row.append(companyName);
    row.append(companyAmoId);
    table.appendChild(row);
  }); // });

  // // secondUserButton.addEventListener("click", (event) => {

  // // });
  const tableSecond = document.querySelector("#myTableSecond");
  filteredSecondtUser.forEach((element, index) => {
    const row = document.createElement("tr");
    const companyNumber = document.createElement("td");
    const companyName = document.createElement("td");
    const companyAmoId = document.createElement("td");
    companyAmoId.classList = "companyIDSecond";
    companyNumber.textContent = `${index + 1} .`;
    companyName.textContent = element.companyName;
    companyAmoId.textContent = element.companyAmoId;
    companyAmoId.style.color = "blue";
    companyAmoId.style.cursor = "pointer";

    tableSecond.addEventListener("click", (event) => {
      if (event.target.classList.contains("companyIDSecond")) {
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
    // let amoId = document.querySelectorAll(".companyIDSecond");
    // amoId.forEach((item) => {
    //   item.addEventListener("click", followinglink);
    //   function followinglink(event) {
    //     const companyIdTarget = event.target.innerText;
    //     console.log(companyIdTarget);
    //     window.open(
    //       `https://jenyanour.amocrm.ru/companies/detail/${companyIdTarget}`,
    //       "_blank"
    //     );
    //   }
    // });

    row.append(companyNumber);
    row.append(companyName);
    row.append(companyAmoId);
    tableSecond.appendChild(row);
  });
}
render();
