import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import {
  getAuthStatus,
  loginUrl,
} from "./api.js";

import AuthenticatedApp from "./AuthenticatedApp.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import PlaylistPage from "./pages/PlaylistPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import TrackStoryPage from "./pages/TrackStoryPage.jsx";

import "./styles.css";

// stop users from opening pages without spotify
function ProtectedRoute({
  authenticated,
  children,
}) {
  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

// show the spotify login screen
function LoginPage({
  authenticated,
  message,
}) {
  if (authenticated) {
    return (
      <Navigate
        to="/chronicle"
        replace
      />
    );
  }

  return (
    <main className="login-page">
      <p className="eyebrow">
        YOUR MUSIC JOURNAL
      </p>

      <h1>Sonic Chronicle</h1>

      <p className="intro">
        Connect your Spotify account to
        turn your listening history into
        memories, moods, and stories.
      </p>

      <a
        className="button"
        href={loginUrl}
      >
        Connect Spotify
      </a>

      {message && (
        <p
          className="status"
          role="status"
        >
          {message}
        </p>
      )}
    </main>
  );
}

export default function App() {
  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  // check whether spotify is connected
  useEffect(() => {
    async function checkLogin() {
      try {
        const result =
          await getAuthStatus();

        setAuthenticated(
          result.authenticated
        );
      } catch (error) {
        setAuthenticated(false);
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    checkLogin();
  }, []);

  if (loading) {
    return (
      <main>
        <p className="status">
          Checking Spotify connection...
        </p>
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={
              authenticated
                ? "/chronicle"
                : "/login"
            }
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          <LoginPage
            authenticated={
              authenticated
            }
            message={message}
          />
        }
      />

      <Route
        path="/search"
        element={
          <ProtectedRoute
            authenticated={
              authenticated
            }
          >
            <SearchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chronicle"
        element={
          <ProtectedRoute
            authenticated={
              authenticated
            }
          >
            <AuthenticatedApp
              initialPage="chronicle"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/track/:trackId"
        element={
          <ProtectedRoute
            authenticated={
              authenticated
            }
          >
            <TrackStoryPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/playlist"
        element={
          <ProtectedRoute
            authenticated={
              authenticated
            }
          >
            <PlaylistPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedRoute
            authenticated={
              authenticated
            }
          >
            <AccountPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={
              authenticated
                ? "/chronicle"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}