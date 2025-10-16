addEventListener("pingNotificationsCheck", (resolve, reject) => {
  fetch(`https://lumobc.ca/api/notifications/check`, {
    method: "POST",
  })
    .then(resolve)
    .catch(reject);
});
