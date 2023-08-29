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
