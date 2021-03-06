import axios from "axios"

export const run = async (subreddit) => {
  return await axios
    .get(`https://api.reddit.com/r/${subreddit}/best`)
    .then(({ data: axiosData }) => {
      const { data } = axiosData;
      return data.children
        .filter((child) => child.kind === "t3")
        .filter(
          (child) =>
            child.data.selftext &&
            child.data.selftext.length > 250 &&
            child.data.selftext.length < 500
        )
        .map((item)=> {
            const id = item.data.name.substring(3)
            return {
                link: `https://www.reddit.com/r/${subreddit}/comments/${id}`,
                name: item.data.name,
                text: item.data.selftext,
            }
        })
    });
};