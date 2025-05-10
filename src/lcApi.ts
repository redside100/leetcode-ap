export const getLatestLeetcodeSubmissions = async (
  username: string,
  apKey: string
) => {
  try {
    const res = await fetch(
      `https://api.redside.moe/ap/lcinfo?username=${username}`,
      {
        headers: {
          "ap-origin": "ap-redside-moe",
          "ap-key": apKey,
        },
      }
    );

    if (res.ok) {
      return [await res.json(), res.status];
    } else {
      return [undefined, res.status];
    }
  } catch (e) {
    console.error(e);
    return [undefined, 500];
  }
};
