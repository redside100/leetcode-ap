const recentSubmissionsGQL = `
query getRecentSubmissions($username: String!, $limit: Int) {
    recentSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
        statusDisplay
        lang
    }
}
`

export const getLatestLeetcodeSubmissions = async (username: string) => {
  // @ts-ignore
  const { data, status } = await window.api.request({
    method: 'POST',
    url: 'https://leetcode.com/graphql',
    data: {
      operationName: 'getRecentSubmissions',
      query: recentSubmissionsGQL,
      variables: {
        username,
        limit: 20
      }
    }
  })
  return [data?.data?.recentSubmissionList, status]
}
