const isTestEnv = () => process.env.NODE_ENV === 'test' || !!process.env.JEST_WORKER_ID;

const info = (...args) => {
  if (!isTestEnv()) {
    console.log(...args);
  }
};

const error = (...args) => {
  if (!isTestEnv()) {
    console.error(...args);
  }
};

module.exports = {
  info,
  error
};
