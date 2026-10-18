import { useState, useEffect } from "react";
import { API_BASE_URL } from "./config";
import "./App.css";

function App() {
  // Mode: false = Login, true = Register
  const [showRegister, setShowRegister] = useState(false);

  // Authenticated user state (persisted in localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("ems_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("user");

  // UI status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dashboard states
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [eventActionLoading, setEventActionLoading] = useState(false);
  const [dashboardMessage, setDashboardMessage] = useState("");

  // New Event Form State (Organizer)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    availableSeats: "",
  });

  // Switch between Login and Register smoothly without page reload or state corruption
  const handleSwitchMode = (toRegister) => {
    setError("");
    setSuccess("");
    setShowRegister(toRegister);
  };

  // Helper to extract message from response (handles both JSON and text)
  const parseResponseError = async (res, defaultMsg) => {
    try {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        return json.message || json.error || text || defaultMsg;
      } catch {
        return text || defaultMsg;
      }
    } catch {
      return defaultMsg;
    }
  };

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginEmail.trim() || !loginPassword) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      if (!response.ok) {
        const errMsg = await parseResponseError(response, "Invalid email or password.");
        setError(errMsg);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const userSession = {
        email: data.email || loginEmail.trim(),
        fullName: data.fullName || loginEmail.trim().split("@")[0],
        role: data.role || "user",
      };

      setCurrentUser(userSession);
      localStorage.setItem("ems_user", JSON.stringify(userSession));
      setLoginPassword("");
    } catch (err) {
      setError(
        "Could not connect to the backend server. Please verify your internet connection or backend status."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");

    if (!registerName.trim() || !registerEmail.trim() || !registerPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (registerPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: registerName.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
          role: registerRole,
        }),
      });

      if (!response.ok) {
        const errMsg = await parseResponseError(
          response,
          "Registration failed. Please try again."
        );
        setError(errMsg);
        setLoading(false);
        return;
      }

      // Registration succeeded: switch to login view, prefill email
      setLoginEmail(registerEmail.trim());
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      setShowRegister(false);
      setSuccess("Account created successfully! Please login with your password.");
    } catch (err) {
      setError(
        "Could not connect to the backend server. Please check your network or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("ems_user");
    setLoginPassword("");
    setError("");
    setSuccess("");
    setEvents([]);
    setMyRegistrations([]);
  };

  // Load Events and Registrations when user is authenticated
  const loadEvents = async () => {
    if (!currentUser) return;
    setDashboardLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadMyRegistrations = async () => {
    if (!currentUser || currentUser.role !== "user") return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/registrations?userEmail=${encodeURIComponent(
          currentUser.email
        )}`
      );
      if (res.ok) {
        const data = await res.json();
        setMyRegistrations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching user registrations:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadEvents();
      if (currentUser.role === "user") {
        loadMyRegistrations();
      }
    }
  }, [currentUser]);

  // Handle Event Creation (Organizer)
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !newEvent.date.trim()) {
      setDashboardMessage("Event title and date are required.");
      return;
    }
    const seats = parseInt(newEvent.availableSeats, 10);
    if (isNaN(seats) || seats < 0) {
      setDashboardMessage("Available seats must be a non-negative number.");
      return;
    }

    setEventActionLoading(true);
    setDashboardMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newEvent.title.trim(),
          description: newEvent.description.trim(),
          date: newEvent.date.trim(),
          location: newEvent.location.trim(),
          availableSeats: seats,
        }),
      });

      if (res.ok) {
        setNewEvent({ title: "", description: "", date: "", location: "", availableSeats: "" });
        setDashboardMessage("Event created successfully!");
        loadEvents();
      } else {
        const msg = await parseResponseError(res, "Failed to create event.");
        setDashboardMessage(msg);
      }
    } catch {
      setDashboardMessage("Error communicating with server.");
    } finally {
      setEventActionLoading(false);
    }
  };

  // Handle Delete Event (Organizer)
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setEventActionLoading(true);
    setDashboardMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDashboardMessage("Event deleted successfully.");
        loadEvents();
      } else {
        const msg = await parseResponseError(res, "Could not delete event.");
        setDashboardMessage(msg);
      }
    } catch {
      setDashboardMessage("Error deleting event.");
    } finally {
      setEventActionLoading(false);
    }
  };

  // Handle Register for Event (User)
  const handleRegisterForEvent = async (eventId) => {
    setEventActionLoading(true);
    setDashboardMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId,
          userEmail: currentUser.email,
        }),
      });

      if (res.ok) {
        setDashboardMessage("Successfully registered for the event!");
        loadEvents();
        loadMyRegistrations();
      } else {
        const msg = await parseResponseError(res, "Could not register for event.");
        setDashboardMessage(msg);
      }
    } catch {
      setDashboardMessage("Network error while registering.");
    } finally {
      setEventActionLoading(false);
    }
  };

  // Handle Cancel Registration (User)
  const handleCancelRegistration = async (registrationId) => {
    if (!window.confirm("Cancel this registration?")) return;
    setEventActionLoading(true);
    setDashboardMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations/${registrationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDashboardMessage("Registration cancelled successfully.");
        loadEvents();
        loadMyRegistrations();
      } else {
        const msg = await parseResponseError(res, "Could not cancel registration.");
        setDashboardMessage(msg);
      }
    } catch {
      setDashboardMessage("Error cancelling registration.");
    } finally {
      setEventActionLoading(false);
    }
  };

  // ==========================================
  // VIEW: Authenticated Dashboard
  // ==========================================
  if (currentUser) {
    const isRegistered = (eventId) =>
      myRegistrations.some((r) => r.eventId === eventId);

    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#f4f6f9", paddingBottom: "40px" }}>
        {/* Navigation Bar */}
        <header
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <h1 style={{ fontSize: "20px", color: "#2563eb", margin: 0, fontWeight: "700" }}>
              Event Management System
            </h1>
            <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "#6b7280" }}>
              Logged in as <strong style={{ color: "#111827" }}>{currentUser.fullName}</strong> ({currentUser.email})
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                backgroundColor: currentUser.role === "organizer" ? "#ede9fe" : "#dbeafe",
                color: currentUser.role === "organizer" ? "#6d28d9" : "#1d4ed8",
                padding: "4px 12px",
                borderRadius: "9999px",
                fontSize: "13px",
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {currentUser.role}
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#f3f4f6",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Dashboard Main Container */}
        <main style={{ maxWidth: "1000px", margin: "24px auto", padding: "0 20px" }}>
          {dashboardMessage && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                backgroundColor: dashboardMessage.includes("success") ? "#ecfdf5" : "#eff6ff",
                color: dashboardMessage.includes("success") ? "#065f46" : "#1e40af",
                border: `1px solid ${dashboardMessage.includes("success") ? "#a7f3d0" : "#bfdbfe"}`,
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              {dashboardMessage}
            </div>
          )}

          {/* Organizer Form: Create Event */}
          {currentUser.role === "organizer" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "28px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.06)",
              }}
            >
              <h2 style={{ fontSize: "18px", color: "#1f2937", marginBottom: "16px", fontWeight: "600" }}>
                Create New Event
              </h2>
              <form onSubmit={handleCreateEvent}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
                      Event Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Annual Tech Symposium"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Auditorium Hall B"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
                      Available Seats *
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 100"
                      value={newEvent.availableSeats}
                      onChange={(e) => setNewEvent({ ...newEvent, availableSeats: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px" }}>
                    Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Brief description of the event..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    style={{ ...inputStyle, resize: "vertical", height: "auto" }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={eventActionLoading}
                  style={{ ...buttonStyle, width: "auto", padding: "10px 24px" }}
                >
                  {eventActionLoading ? "Publishing..." : "Publish Event"}
                </button>
              </form>
            </div>
          )}

          {/* User Section: My Registered Events */}
          {currentUser.role === "user" && myRegistrations.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ fontSize: "18px", color: "#1f2937", marginBottom: "16px", fontWeight: "600" }}>
                My Registered Events ({myRegistrations.length})
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {myRegistrations.map((reg) => {
                  const ev = events.find((e) => e.id === reg.eventId);
                  return (
                    <div
                      key={reg.id}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        padding: "20px",
                        border: "1px solid #10b981",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#d1fae5",
                          color: "#065f46",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        Registered
                      </span>
                      <h3 style={{ margin: "10px 0 6px 0", fontSize: "16px", color: "#111827" }}>
                        {ev ? ev.title : `Event #${reg.eventId}`}
                      </h3>
                      {ev && (
                        <p style={{ margin: "0 0 10px 0", fontSize: "13px", color: "#6b7280" }}>
                          📅 {ev.date || "TBD"} {ev.location ? `| 📍 ${ev.location}` : ""}
                        </p>
                      )}
                      <button
                        onClick={() => handleCancelRegistration(reg.id)}
                        disabled={eventActionLoading}
                        style={{
                          backgroundColor: "#fee2e2",
                          color: "#991b1b",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Cancel Registration
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Available Events */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", color: "#1f2937", margin: 0, fontWeight: "600" }}>
                All Events
              </h2>
              <button
                onClick={loadEvents}
                style={{
                  backgroundColor: "transparent",
                  color: "#2563eb",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                🔄 Refresh
              </button>
            </div>

            {dashboardLoading ? (
              <p style={{ color: "#6b7280" }}>Loading events...</p>
            ) : events.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  padding: "40px",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                No events currently scheduled. Check back soon!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
                {events.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      padding: "20px",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", color: "#111827" }}>
                          {event.title}
                        </h3>
                        <span
                          style={{
                            backgroundColor: event.availableSeats > 0 ? "#eff6ff" : "#fef2f2",
                            color: event.availableSeats > 0 ? "#1d4ed8" : "#b91c1c",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {event.availableSeats} seats left
                        </span>
                      </div>

                      <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#4b5563" }}>
                        {event.description || "No description provided."}
                      </p>

                      <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "16px" }}>
                        <div>📅 {event.date || "Date not specified"}</div>
                        {event.location && <div style={{ marginTop: "4px" }}>📍 {event.location}</div>}
                      </div>
                    </div>

                    <div>
                      {currentUser.role === "organizer" ? (
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          disabled={eventActionLoading}
                          style={{
                            ...buttonStyle,
                            backgroundColor: "#ef4444",
                            padding: "8px 14px",
                            fontSize: "14px",
                          }}
                        >
                          Delete Event
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegisterForEvent(event.id)}
                          disabled={
                            eventActionLoading ||
                            event.availableSeats <= 0 ||
                            isRegistered(event.id)
                          }
                          style={{
                            ...buttonStyle,
                            backgroundColor: isRegistered(event.id)
                              ? "#10b981"
                              : event.availableSeats <= 0
                              ? "#9ca3af"
                              : "#2563eb",
                            cursor:
                              isRegistered(event.id) || event.availableSeats <= 0
                                ? "default"
                                : "pointer",
                            padding: "10px",
                            fontSize: "14px",
                          }}
                        >
                          {isRegistered(event.id)
                            ? "✓ Already Registered"
                            : event.availableSeats <= 0
                            ? "Sold Out"
                            : "Register for Event"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // VIEW: Register Account Screen
  // ==========================================
  if (showRegister) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#f4f6f9",
        }}
      >
        <div
          style={{
            width: "420px",
            padding: "40px",
            backgroundColor: "#ffffff",
            borderRadius: "15px",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              marginBottom: "0",
              color: "#2563eb",
              fontSize: "26px",
            }}
          >
            Create Account
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "#666",
              marginTop: "10px",
              marginBottom: "24px",
              fontSize: "15px",
            }}
          >
            Register for the Event Management System
          </p>

          {/* Error & Success Messages */}
          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fca5a5",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                backgroundColor: "#dcfce7",
                color: "#166534",
                border: "1px solid #86efac",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              style={inputStyle}
              required
            />

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              style={inputStyle}
              required
            />

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password (min 6 characters)"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              style={inputStyle}
              required
            />

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={registerConfirmPassword}
              onChange={(e) => setRegisterConfirmPassword(e.target.value)}
              style={inputStyle}
              required
            />

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Role
            </label>

            <select
              value={registerRole}
              onChange={(e) => setRegisterRole(e.target.value)}
              style={inputStyle}
            >
              <option value="user">User (Attendee)</option>
              <option value="organizer">Organizer</option>
            </select>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "14px",
              color: "#666",
            }}
          >
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => handleSwitchMode(false)}
              style={{
                ...linkStyle,
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "inherit",
              }}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: Login Screen
  // ==========================================
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "#f4f6f9",
      }}
    >
      <div
        style={{
          width: "420px",
          padding: "40px",
          backgroundColor: "#ffffff",
          borderRadius: "15px",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#2563eb",
            fontSize: "26px",
            marginBottom: "6px",
          }}
        >
          Event Management System
        </h1>

        <p
          style={{
            textAlign: "center",
            marginTop: "6px",
            marginBottom: "24px",
            color: "#666",
            fontSize: "15px",
          }}
        >
          Welcome back! Please login to continue.
        </p>

        {/* Error & Success Messages */}
        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: "#dcfce7",
              color: "#166534",
              border: "1px solid #86efac",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleLoginSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            style={inputStyle}
            required
          />

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            style={inputStyle}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => handleSwitchMode(true)}
            style={{
              ...linkStyle,
              background: "none",
              border: "none",
              padding: 0,
              fontSize: "inherit",
            }}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
  marginTop: "0",
  marginBottom: "18px",
  boxSizing: "border-box",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px",
};

const buttonStyle = {
  width: "100%",
  padding: "13px",
  marginTop: "5px",
  backgroundColor: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
};

const linkStyle = {
  color: "#2563eb",
  fontWeight: "bold",
  cursor: "pointer",
};

export default App;
