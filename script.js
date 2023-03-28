// create one modal window when we click + sign
let mainCont = document.querySelector(".main-cont");
let addbtn = document.querySelector(".add-btn");
let modalCont = document.querySelector(".modal-cont");
let toolBoxColors = document.querySelectorAll(".color");
let addFlag = false;
let allTicketArr = [];

if (localStorage.getItem("jira-tickets")) {
  allTicketArr = JSON.parse(localStorage.getItem("jira-tickets"));
  allTicketArr.forEach((ticketObj) => {
    createTicket(
      ticketObj.ticketColor,
      ticketObj.ticketTask,
      ticketObj.ticketId
    );
  });
}

//signle AND double click filter function
toolBoxColors.forEach((colorBox) => {
  colorBox.addEventListener("click", (e) => {
    let currBoxColor = colorBox.classList[1];
    let filterTickets = allTicketArr.filter((ticketObj, idx) => {
      return currBoxColor === ticketObj.ticketColor;
    });
    console.log(filterTickets);
    //remove previous ticket
    let allTicketCont = document.querySelectorAll(".ticket-cont");
    allTicketCont.forEach((ticket) => {
      ticket.remove();
    });
    console.log("Hi");
    // show filtered tickedt
    filterTickets.forEach((ticketObj, idx) => {
      createTicket(
        ticketObj.ticketColor,
        ticketObj.ticketTask,
        ticketObj.ticketId
      );
    });
  });
  colorBox.addEventListener("dblclick", (e) => {
    let allTicketCont = document.querySelectorAll(".ticket-cont");
    allTicketCont.forEach((ticket) => {
      ticket.remove();
    });
    allTicketArr.forEach((ticketObj, idx) => {
      createTicket(
        ticketObj.ticketColor,
        ticketObj.ticketTask,
        ticketObj.ticketId
      );
    });
  });
});

// to open modal box
addbtn.addEventListener("click", (e) => {
  // console.log("clicked");
  // addflag-> true = modal display
  // addflag-> false = modal none

  addFlag = !addFlag;
  // console.log(addFlag)
  if (addFlag) {
    modalCont.style.display = "flex";
  } else {
    modalCont.style.display = "none";
  }
});

//Set Priority Color of ticket in modal box
let colors = ["urgentRed", "gotitYellow", "taskGreen", "mayBePerpule"];
let modalPriorityColor = colors[colors.length - 1]; // our color for modal
let allPriorityColor = document.querySelectorAll(".priority-color");

//set event listerner for modal priority color
allPriorityColor.forEach((color, index) => {
  color.addEventListener("click", (e) => {
    // remove activeBox class from all other boxes
    allPriorityColor.forEach((otherBox, idx) => {
      otherBox.classList.remove("activeBox");
    });

    // now apply activeBox class on clicked box
    color.classList.add("activeBox");
    modalPriorityColor = color.classList[1]; // capturing the color for ticket
  });
});

// getting task value from modal box and store in the global variable
let textareaCont = document.querySelector(".textarea-cont");
console.log(textareaCont);
let ticketTaskValue = textareaCont.value; // global variable
console.log(ticketTaskValue);

//generate the unique id
// for this we are using short id unpak script

//to create ticket and put ticketColor, ticketId, ticketTask
function createTicket(ticketColor, ticketTask, ticketId) {
  let id = ticketId || shortid();
  // console.log(id);
  let ticketCont = document.createElement("div");
  ticketCont.setAttribute("class", "ticket-cont");
  ticketCont.innerHTML = `
    <div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id}</div>
    <div class="task-area">${ticketTask}</div>
    <div class="ticket-lock"><i class="fa-solid fa-lock"></i></div>`;
  mainCont.appendChild(ticketCont);

  //create object of ticket and add to array
  if (!ticketId) {
    allTicketArr.push({ ticketColor, ticketTask, ticketId: id });
    //converting the allticketArr into String and storing it in local storage
    localStorage.setItem("jira-tickets", JSON.stringify(allTicketArr));
  }
  ticketRemoveFunc(ticketCont, id);
  handlelock(ticketCont, id);
  handleColor(ticketCont, id);
}

//click shift to genrate the ticket
modalCont.addEventListener("keydown", (e) => {
  let key = e.key;
  if (key === "Shift") {
    createTicket(modalPriorityColor, ticketTaskValue);
    // now remove modal cont
    addFlag = false;
    setModalDefault();
  }
});

//Remove The tickets
let removeFlag = false;
let removeBtn = document.querySelector(".remove-btn");
console.log(removeBtn);

removeBtn.addEventListener("click", (e) => {
  removeFlag = !removeFlag;
  if (removeFlag) {
    removeBtn.children[0].style.color = "red";
    console.log("red");
  } else {
    removeBtn.children[0].style.color = "aliceblue";
    console.log("white");
  }
});
function ticketRemoveFunc(ticket, id) {
  ticket.addEventListener("click", (e) => {
    if (removeFlag) {
      let ticketIdx = getTicketIdx(id);
      allTicketArr.splice(ticketIdx, 1);
      localStorage.setItem("jira-tickets", JSON.stringify(allTicketArr));
      ticket.remove();
    }
  });
}

//lock-unlock feature for editing
let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";
function handlelock(ticket, id) {
  let ticketLockElem = ticket.querySelector(".ticket-lock");
  let ticketLock = ticketLockElem.children[0];
  let ticketTaskArea = ticket.querySelector(".task-area");
  // console.log(ticketTaskArea);
  ticketLock.addEventListener("click", (e) => {
    let ticketIdx = getTicketIdx(id);
    if (ticketLock.classList.contains(lockClass)) {
      ticketLock.classList.remove(lockClass);
      ticketLock.classList.add(unlockClass);
      ticketTaskArea.setAttribute("contenteditable", "true");
    } else {
      ticketLock.classList.remove(unlockClass);
      ticketLock.classList.add(lockClass);
      ticketTaskArea.setAttribute("contenteditable", "false");
    }
    //  modify ticket task in localStorage
    allTicketArr[ticketIdx].ticketTask = ticketTaskArea.innerHTML;
    console.log(allTicketArr);
    localStorage.setItem("jira-tickets", JSON.stringify(allTicketArr));
  });
}

//changing the priority color of ticket
function handleColor(ticket, id) {
  let ticketColor = ticket.querySelector(".ticket-color");
  ticketColor.addEventListener("click", (e) => {
    //get ticket idx from alltickets array
    let ticketIdx = getTicketIdx(id);

    let currColor = ticketColor.classList[1];
    // console.log(ticketColor);
    // console.log(currColor);
    // currcolor - color apply on model

    //Get ticket color index
    let currColorIndex = colors.findIndex((color) => {
      return currColor === color;
    });
    // console.log(currColorIndex);
    currColorIndex++;
    let nextColorIndex = currColorIndex % colors.length;
    let newTicketColor = colors[nextColorIndex];

    //remove the current color and add next color
    ticketColor.classList.remove(currColor);
    ticketColor.classList.add(newTicketColor);

    //Modify data in localStorage
    allTicketArr[ticketIdx].ticketColor = newTicketColor;
    console.log(allTicketArr[ticketIdx].ticketColor);
    console.log(allTicketArr);
    localStorage.setItem("jira-tickets", JSON.stringify(allTicketArr));
  });
}
function getTicketIdx(id) {
  let ticketIdex = allTicketArr.findIndex((ticketObj) => {
    return ticketObj.ticketId === id;
  });
  return ticketIdex;
}

//set modal to defualt
function setModalDefault() {
  modalPriorityColor = colors[colors.length - 1];
  modalCont.style.display = "none";
  textareaCont.value = "";
  allPriorityColor.forEach((otherBox, idx) => {
    otherBox.classList.remove("activeBox");
  });
  allPriorityColor[allPriorityColor.length - 1].classList.add("activeBox");
}
