// frontend/src/pages/Register.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Header from "../components/ui/Header";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // frontend/src/pages/Register.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Registration failed");
        return;
      }

      const data = await response.json();
      setSuccess("Registered successfully!");

      // Save token and user_id
      if (data.token && data.user_id) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("myUserId", data.user_id);
        localStorage.setItem("myUsername", data.username); // testing
      }
      window.location.href = "/lobbies";
    } catch (error) {
      console.error("Registration error:" + error);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <main className="flex flex-col flex-1 items-center justify-center p-4">
        <Card className="w-[450px] shadow-lg rounded-lg">
          {/* Register Title */}
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              REGISTER
            </CardTitle>
          </CardHeader>

          <CardContent>
            {/* Input Fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="username"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-red-500">{error}</p>}
              {success && <p className="text-green-500">{success}</p>}

              {/* Submit Button */}
              <Button className="w-full bg-[#0D1117] text-white hover:bg-[#161B22]">
                Register
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
