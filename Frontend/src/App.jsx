import { Routes, Route, Navigate } from "react-router";
import HomePage from "./Pages/HomePage.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import SignUpPage from "./Pages/SignUpPage.jsx";
import OnboardingPage from "./Pages/OnboardingPage.jsx";
import NotificationsPage from "./Pages/NotificationsPage.jsx";
import FriendsPage from "./Pages/FriendsPage.jsx";
import ChatPage from "./Pages/ChatPage.jsx";
import ChatSidebar from "./components/ChatComponents/ChatList.jsx";
import ChatBox from "./components/ChatComponents/ChatBox.jsx";
import CallPage from "./Pages/CallPage.jsx";
import ProfilePage from "./Pages/ProfilePage.jsx";
import { Toaster } from "react-hot-toast";
import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useSelector } from "react-redux";
import SearchPage from "./Pages/SearchPage.jsx";
import useInitializeStream from "./hooks/useInitializeStream";
import AudioCallPage from "./Pages/AudioCallPage.jsx";

export default function App() {
  const { isLoading, authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const theme = useSelector((state) => state.theme.theme);
  const { chatClientRef, clientReady } = useInitializeStream();

  if (isLoading) {
    return (
      <div data-theme={theme}>
        <PageLoader />
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full hide-scrollbar" data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        ></Route>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
        ></Route>
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to="/onboarding" />
          }
        ></Route>
        <Route
          path="/onboarding"
          element={
            isAuthenticated ? <OnboardingPage /> : <Navigate to="/login" />
          }
        ></Route>
        <Route
          path="/notification"
          element={
            isAuthenticated ? (
              <Layout>
                <NotificationsPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        ></Route>
        <Route
          path="/search"
          element={
            isAuthenticated ? (
              <Layout>
                <SearchPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        ></Route>
        <Route
          path="/friends"
          element={
            isAuthenticated ? (
              <Layout>
                <FriendsPage />{" "}
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        ></Route>
        {/* <Route
          path="/chat"
          element={
            isAuthenticated ? (
              <Layout>
                <ChatPage
                  chatClientRef={chatClientRef}
                  clientReady={clientReady}
                />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        ></Route> */}
        <Route
          path="/chat"
          element={
            isAuthenticated ? (
              <ChatPage
                chatClientRef={chatClientRef}
                clientReady={clientReady}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/call/:id"
          element={
            isAuthenticated ? (
              <Layout>
                <CallPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        ></Route>
        <Route
          path="/profile/:id?"
          element={
            isAuthenticated ? (
              <Layout>
                <ProfilePage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        ></Route>
        <Route
          path="/audio-call/:id"
          element={
            isAuthenticated ? (
              <Layout>
                <AudioCallPage />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
      <Toaster />
    </div>
  );
}
