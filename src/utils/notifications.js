const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!pushToken || !pushToken.startsWith("ExponentPushToken")) {
    return;
  }

  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data,
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();

    if (result.data?.status === "error") {
      console.error("Push notification error:", result.data.message);
    }

    return result;
  } catch (err) {
    console.error("Failed to send push notification:", err.message);
  }
};

module.exports = { sendPushNotification };
