const users = [];
const addUser = ({ id, username, room }) => {
  const trimmedUsername = username.trim().toLowerCase();
  const trimmedRoom = room.trim().toLowerCase();

  if (!trimmedUsername || !trimmedRoom) {
    return {
      error: "Username and room must be provided",
    };
  }

  // Check for existing user
  const existingUser = users.find((user) => {
    return user.room === trimmedRoom && user.username === trimmedUsername;
  });

  if (existingUser) {
    return { error: "Username is already in use." };
  }

  // Store user with lowercase values
  const user = { id, username: trimmedUsername, room: trimmedRoom };
  users.push(user);
  return { user };
};

// addUser({ id: 123, username: "venkys", room: "pkl" });
// addUser({ id: 1233, username: "virat", room: "pkl" });
// addUser({ id: 123, username: "vgovi", room: "ipl" });
// addUser({ id: 1233, username: "abd", room: "ipl" });
console.log(users);

//remove user

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    users.splice(index, 1);
  }

  return users;
};

//fetch user
const getUser = (id) => {
  const user = users.find((user) => {
    return user.id === id;
  });
  if (!user) {
    return {
      error: "np user found",
    };
  }
  return user;
};

//get users in  a room

const getAllUsers = (room) => {
  const usersInRoom = users.filter((user) => {
    return user.room === room;
  });
  return usersInRoom;
};

module.exports = { addUser, removeUser, getAllUsers, getUser };
