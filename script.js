"use strict";

// DOM Elements
const elements = {
  labelWelcome: document.querySelector(".welcome"),
  labelDate: document.querySelector(".date"),
  labelBalance: document.querySelector(".balance__value"),
  labelSumIn: document.querySelector(".summary__value--in"),
  labelSumOut: document.querySelector(".summary__value--out"),
  labelSumInterest: document.querySelector(".summary__value--interest"),
  labelTimer: document.querySelector(".timer"),
  containerApp: document.querySelector(".app"),
  containerMovements: document.querySelector(".movements"),
  btnLogin: document.querySelector(".login__btn"),
  btnTransfer: document.querySelector(".form__btn--transfer"),
  btnLoan: document.querySelector(".form__btn--loan"),
  btnClose: document.querySelector(".form__btn--close"),
  btnSort: document.querySelector(".btn--sort"),
  inputLoginUsername: document.querySelector(".login__input--user"),
  inputLoginPin: document.querySelector(".login__input--pin"),
  inputTransferTo: document.querySelector(".form__input--to"),
  inputTransferAmount: document.querySelector(".form__input--amount"),
  inputLoanAmount: document.querySelector(".form__input--loan-amount"),
  inputCloseUsername: document.querySelector(".form__input--user"),
  inputClosePin: document.querySelector(".form__input--pin"),
  errorMessage: document.querySelector(".error"),
  emailRegister: document.querySelector("#email"),
  passwordRegister: document.querySelector("#password"),
  passwordRegisterC: document.querySelector("#password-c"),
  submitBtn: document.querySelector("#submit-btn"),
  registrationContainer: document.querySelector("#rigestrations"),
};
console.log(elements.btnLogin);

// Accounts Data
let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
function handleMovementStorage(account, movements) {
  localStorage.setItem(
    `movements${accounts.indexOf(account)}`,
    JSON.stringify(movements)
  );
}

// Function to register a new account
function register() {
  const email = elements.emailRegister.value;
  const password = elements.passwordRegister.value;
  const passwordC = elements.passwordRegisterC.value;

  if (
    email !== "" &&
    password !== "" &&
    passwordC !== "" &&
    passwordC === password
  ) {
    const newAccount = {
      owner: email,
      movements:
        JSON.parse(
          localStorage.getItem(`movements${accounts.indexOf(currentAccount)}`)
        ) || [],
      interestRate: 1.2,
      pin: password,
    };

    // Push the new account to the accounts array
    accounts.push(newAccount);

    // Save the updated accounts array to local storage
    localStorage.setItem("accounts", JSON.stringify(accounts));
    handleMovementStorage(newAccount, newAccount.movements);
  }
  location.reload();
}

// Create user names
function createUserNames(account) {
  account.forEach((account) => {
    account.userName = account.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
}
createUserNames(accounts);

// Event listener for the registration button
elements.submitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  register();
  elements.emailRegister.value = "";
  elements.passwordRegister.value = "";
  elements.passwordRegisterC.value = "";
});

// Display accounts data for each operation
function displayData(dataArray) {
  const dataRow = dataArray
    .map(
      (movement, index) => `
      <div class="movements__row">
        <div class="movements__type movements__type--${
          movement > 0 ? "deposit" : "withdrawal"
        }">
          ${index + 1} ${movement > 0 ? "Deposit" : "Withdrawal"}
        </div>
        <div class="movements__date">24/01/2037</div>
        <div class="movements__value">${movement}€</div>
      </div>
    `
    )
    .join("");

  elements.containerMovements.innerHTML = dataRow;
}

// Calculate account balance
function calcBalance(movements) {
  return movements
    .reduce((acc, movement) => acc + movement, 0)
    .toString()
    .padStart(4, "0");
}

// Calculate summary
function calcInOutIntBalance(movements) {
  const inBalance = movements
    .filter((movement) => movement > 0)
    .reduce((acc, movement) => acc + movement, 0)
    .toString()
    .padStart(4, "0");
  const outBalance = Math.abs(
    movements
      .filter((movement) => movement < 0)
      .reduce((acc, movement) => acc + movement, 0)
  )
    .toString()
    .padStart(4, "0");
  const interBalance = movements
    .filter((movement) => movement > 0)
    .map((deposit) => (deposit * 1.2) / 100)
    .reduce((acc, interest) => (interest > 0 ? acc + interest : 0), 0);

  return { inBalance, outBalance, interBalance };
}

// Display statistics and summary information
function updateLabels(account) {
  elements.labelBalance.textContent = `${calcBalance(account.movements)}€`;
  const { inBalance, outBalance, interBalance } = calcInOutIntBalance(
    account.movements
  );
  elements.labelSumIn.textContent = `${inBalance}€`;
  elements.labelSumOut.textContent = `${outBalance}€`;
  elements.labelSumInterest.textContent = `${Math.floor(interBalance)}€`;
}

// Loan functionality
function handleLoanButtonClick() {
  const amount = Number(elements.inputLoanAmount.value);
  const existingMovements =
    JSON.parse(
      localStorage.getItem(`movements${accounts.indexOf(currentAccount)}`)
    ) || [];
  const updatedMovements = [...existingMovements, amount];
  localStorage.setItem(
    `movements${accounts.indexOf(currentAccount)}`,
    JSON.stringify(updatedMovements)
  );
  currentAccount.movements.push(amount);
  elements.inputLoanAmount.value = "";
  displayData(currentAccount.movements);
  const { inBalance, outBalance } = calcInOutIntBalance(
    currentAccount.movements
  );
  elements.labelSumIn.textContent = `${inBalance}€`;
  elements.labelSumOut.textContent = `${outBalance}€`;
  updateLabels(currentAccount);
}

// Loan Event Listeners
elements.btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  handleLoanButtonClick();
});

// Initial Display
function initialDisplay() {
  displayData(currentAccount.movements);
  updateLabels(currentAccount);
}

// Login functionalities
let currentAccount;
elements.btnLogin.addEventListener("click", function (e) {
  e.preventDefault();
  const inputUsername = elements.inputLoginUsername.value.toLowerCase();
  const inputPin = elements.inputLoginPin.value;

  currentAccount = findAccountByUsernameAndPassword(inputUsername, inputPin);

  if (currentAccount) {
    elements.inputLoginUsername.value = "";
    elements.inputLoginPin.value = "";
    elements.errorMessage.textContent = "";
    elements.registrationContainer.classList.add("hidden");
    elements.labelWelcome.textContent = `Welcome back ${currentAccount.owner}`;
    currentAccount.movements =
      JSON.parse(
        localStorage.getItem(`movements${accounts.indexOf(currentAccount)}`)
      ) || [];
    initialDisplay();
    elements.containerApp.style.opacity = "1";
  } else {
    elements.errorMessage.textContent = "Incorrect username or pin!";
    elements.containerApp.style.opacity = "0";
  }
});

// Logout timer function
let timer = 300; // Initial timer value in seconds (5 minutes)
function updateTimer() {
  let minutes = Math.floor(timer / 60);
  let seconds = timer % 60;
  elements.labelTimer.textContent = `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;

  if (timer > 0) {
    timer--;
  } else {
    // Implement any logic you need when the timer reaches 0 (e.g., log out the user)
    clearInterval(timerInterval);
    elements.labelWelcome.textContent = "Log in to get started";
    elements.containerApp.style.opacity = "0";
  }
}
updateTimer();
const timerInterval = setInterval(updateTimer, 1000);

// Transfer functionalities
function transfer() {
  // this variable is used to capture account userName that we want to transfer to
  const toUserName = elements.inputTransferTo.value;
  // this variable is used to capture currency ammount that we want to transfer
  const amount = Number(elements.inputTransferAmount.value) * -1;
  // this variable is used to get the account object that we want to transfer to, based on the userName value
  const toAccountObject = accounts.find(
    (account) => account.userName === toUserName
  );
  if (toAccountObject) {
    const existingMovements =
      JSON.parse(
        localStorage.getItem(`movements${accounts.indexOf(toAccountObject)}`)
      ) || [];
    const updatedMovements = [...existingMovements, Math.abs(amount)];
    localStorage.setItem(
      `movements${accounts.indexOf(toAccountObject)}`,
      JSON.stringify(updatedMovements)
    );
    toAccountObject.movements.push(Math.abs(amount));
    currentAccount.movements.push(amount);
    // console.log(toAccountObject);
    // Save the updated movements arrays to local storage
    handleMovementStorage(currentAccount, currentAccount.movements);
    handleMovementStorage(toAccountObject, toAccountObject.movements);

    elements.inputTransferTo.value = "";
    elements.inputTransferAmount.value = "";
    displayData(currentAccount.movements);
    const { inBalance, outBalance } = calcInOutIntBalance(
      currentAccount.movements
    );
    elements.labelSumIn.textContent = `${inBalance}€`;
    elements.labelSumOut.textContent = `${outBalance}€`;
    updateLabels(currentAccount);
  } else {
    // Handle the case when the recipient account is not found
    console.error("Recipient account not found");
  }
}

// Transfer Event Listener
elements.btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  transfer();
});

// Close account functionalities
function closeAccount() {
  accounts.splice(accounts.indexOf(currentAccount), 1);
  // Remove the corresponding movements array from local storage
  localStorage.setItem("accounts", JSON.stringify(accounts));
  elements.labelWelcome.textContent = "Log in to get started";
  elements.containerApp.style.opacity = "0";
}

// Close Account Event Listener
elements.btnClose.addEventListener("click", closeAccount);

let isSorted = false;

// Sort Movements functionality
function sortMovements() {
  if (isSorted) {
    displayData(currentAccount.movements);
  } else {
    currentAccount.sortedMovements = [...currentAccount.movements];
    currentAccount.sortedMovements.sort((a, b) => b - a);
    displayData(currentAccount.sortedMovements);
  }
  isSorted = !isSorted;
}

// Sort Movements Event Listener
elements.btnSort.addEventListener("click", sortMovements);

// Function to find account by username and password
function findAccountByUsernameAndPassword(username, pin) {
  return accounts.find(
    (account) => account.userName === username && account.pin === pin
  );
}
