const generateMsg = (text, username) => {
  return {
    text,
    createdAt: new Date().getTime(),
    username,
  };
};
const generateLocMsg = (username, loc) => {
  return {
    username,
    loc,
    createdAt: new Date().getTime(),
  };
};

module.exports = { generateMsg, generateLocMsg };
