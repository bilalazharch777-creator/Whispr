import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  try {
    const response = await axiosInstance.post("auth/signup", signupData);
    return response;
  } catch (error) {
    console.log("server error message:", error);
  }
};

export const login = async (loginData) => {
  try {
    console.log(loginData);
    const response = await axiosInstance.post("auth/login", loginData);
    console.log("login successfull", loginData);

    return response;
  } catch (error) {
    console.log("server error message:", error);
  }
};
export const logout = async () => {
  try {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.log("Error in logout:", error);
    throw error; // Throw instead of returning null
  }
};

export const getAuthUser = async () => {
  try {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  } catch (error) {
    console.log("server error for login:", error);
    // CRITICAL: Throw the error so TanStack Query handles it correctly
    throw error;
  }
};
export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  console.log(userData);
  return response.data;
};
export async function getUserFriends() {
  const response = await axiosInstance.get("/users/friends");
  console.log(response.data);
  return response.data;
}
// In your api.js file
export async function getRecommendedUsers(page = 1, limit = 6) {
  // Add query parameters to the URL
  const response = await axiosInstance.get(
    `/users?page=${page}&limit=${limit}`,
  );
  return response.data;
}
export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}
export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}
export async function getFriendRequest() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}
export const cancelFriendRequest = async (requestId) => {
  const response = await axiosInstance.delete(
    `/users/friend-request/${requestId}`,
  );
  return response.data;
};

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(
    `/users/friend-request/${requestId}/accept`,
  );
  return response.data;
}
export async function getStreamToken() {
  const response = await axiosInstance.get("chat/token");
  return response.data;
}
export async function searchPeople(userName) {
  const response = await axiosInstance.get(`/users/search`, {
    params: { query: userName },
  });
  return response.data;
}
export async function getUserProfile(userId) {
  const response = await axiosInstance.get(`users/profile/${userId}`);
  console.log(response.data);
  return response.data;
}
export const uploadPost = async (postData) => {
  const response = await axiosInstance.post("post/upload", postData);
  return response.data;
};
export async function getUserPosts(userId) {
  const response = await axiosInstance.get(`/post/user/${userId}`);
  return response.data;
}
export async function like(postId) {
  const response = await axiosInstance.post(`/post/${postId}/like`);
  return response.data;
}
export async function getComments(postId) {
  const response = await axiosInstance.get(`/post/${postId}/comments`);
  return response.data;
}
export async function addComment(postId, data) {
  const response = await axiosInstance.post(`/post/${postId}/comment`, data);
  return response.data;
}
export async function uploadStory(Data) {
  const response = await axiosInstance.post("/story/upload", Data);
  return response.data;
}
export async function getFeed() {
  const response = await axiosInstance.get("/story/feed");
  console.log(response.data);
  return response.data;
}
export async function getStory(storyId) {
  const response = await axiosInstance.get(`/story/${storyId}`);
  return response.data;
}
export async function likeStory(storyId) {
  const response = await axiosInstance.post(`/story/like/${storyId}`);
  return response.data;
}
export async function postFeed(page = 1) {
  const response = await axiosInstance.get(`/post/feed?page=${page}&limit=10`);
  return response.data;
}
export const getRecommendedStory = async () => {
  const res = await axiosInstance.get("/users/story-suggestions");
  return res.data;
};
