import { useState } from "react";

function App() {
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "420px",
            padding: "40px",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              marginBottom: "0",
            }}
          >
            Create Account
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "#666",
              marginTop: "10px",
              marginBottom: "30px",
              fontSize: "16px",
            }}
          >
            Register for the Event Management System
          </p>

          <form>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              style={inputStyle}
            />

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Email
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              style={inputStyle}
            />

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              style={inputStyle}
            />

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              style={inputStyle}
            />

            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "600",
              }}
            >
              Role
            </label>

            <select style={inputStyle}>
              <option value="user">User</option>
              <option value="organizer">Organizer</option>
            </select>

            <button
              type="submit"
              style={buttonStyle}
            >
              Register
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            Already have an account?{" "}
            <span
              onClick={() => setShowRegister(false)}
              style={linkStyle}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "420px",
          padding: "40px",
        }}
      >
        <h1 style={{ textAlign: "center" }}>
          Event Management System
        </h1>

        <p
          style={{
            textAlign: "center",
            marginTop: "10px",
            marginBottom: "30px",
          }}
        >
          Welcome back! Please login to continue.
        </p>

        <form>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
            }}
          >
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            style={inputStyle}
          />

          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: "600",
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            style={inputStyle}
          />

          <button
            type="submit"
            style={buttonStyle}
          >
            Login
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
          }}
        >
          Don't have an account?{" "}
          <span
            onClick={() => setShowRegister(true)}
            style={linkStyle}
          >
            Register
          </span>
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