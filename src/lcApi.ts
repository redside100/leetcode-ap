export const getLatestLeetcodeAcceptedSubmissions = async (
  username: string,
  apKey: string
) => {
  try {
    const res = await fetch(
      `https://api.redside.moe/ap/leetcode/accepted?username=${username}`,
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

export const getLatestLeetcodeSubmissions = async (
  username: string,
  apKey: string
) => {
  try {
    const res = await fetch(
      `https://api.redside.moe/ap/leetcode/submissions?username=${username}`,
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
