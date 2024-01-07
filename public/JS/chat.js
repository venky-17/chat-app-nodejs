const socket = io();

const submitForm = document.querySelector("form");
const shareLocationBtn = document.querySelector("#shareLoc");
const submitBtn = document.querySelector("#submitBtn");
const messages = document.querySelector("#messages");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const allUsersTemplate = document.querySelector("#allUsers-template").innerHTML;

//options

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", (msg) => {
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    message: msg.text,
    createdAt: moment(msg.createdAt).format("h:mm a"),
    username: msg.username,
  });

  const div = document.createElement("div");
  div.innerHTML = html;
  messages.appendChild(div);
});

submitForm.addEventListener("submit", (e) => {
  const input = document.querySelector("#userInput");
  const inputValue = input.value.trim();

  e.preventDefault();

  if (inputValue === "") {
    return;
  }
  submitBtn.setAttribute("disabled", "true");
  socket.emit("sendMsg", inputValue, (censorWarning) => {
    submitBtn.removeAttribute("disabled");
    if (censorWarning) {
      return console.log(censorWarning);
    }
    console.log("msg was delivered");
  });

  input.value = "";
  submitForm.focus();
});

shareLocationBtn.addEventListener("click", () => {
  shareLocationBtn.setAttribute("disabled", "true");
  shareLocationBtn.innerHTML = "sending location";
  if (!navigator.geolocation) {
    return alert("ur broswer doesnt support fetching location");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const location = `https://google.com/maps?q=${latitude},${longitude}`;

    socket.emit("sendLoc", location, () => {
      shareLocationBtn.removeAttribute("disabled");
      shareLocationBtn.innerHTML = "Share ur location";
      console.log("location was shared");
    });
  });
});

socket.on("locationMessage", (locationMsg) => {
  console.log(locationMsg);
  const html = Mustache.render(locationTemplate, {
    username: locationMsg.username,
    location: locationMsg.loc,
    createdAt: moment(locationMsg.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);

  console.log(locationMsg.username);
});

socket.emit("joinRoom", { username, room }, (err) => {
  if (err) {
    alert(err);
    location.href = "/";
  }
});

socket.on("usersInRoom", (roomDetails) => {
  console.log(roomDetails.room, roomDetails.users);

  const usernames = roomDetails.users.map((user) => user.username);

  const html = Mustache.render(allUsersTemplate, {
    room: roomDetails.room,
    allusers: usernames,
  });

  document.getElementById("users").innerHTML = html;
});
