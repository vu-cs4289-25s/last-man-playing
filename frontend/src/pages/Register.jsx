// frontend/src/pages/Register.jsx

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch ("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username, email, password})
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
        return;
      }

      const data = await response.json();
      setSuccess('Registered successfully!');

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      window.location.href = "/lobbies";
    } catch (error) {
      console.error("Registration error:" + error);
      setError("An error occurred. Please try again.");
    }
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-gray-100">
      {/* Centered Navbar */}
      <header className="w-full bg-gray-300 py-4 px-6 flex justify-center">
        <h1 className="text-2xl font-bold tracking-wide text-center">
          LAST MAN PLAYING
        </h1>
      </header>

      {/* Centered Register Card */}
      <main className="flex justify-center items-center flex-1 w-full">
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
                <Input id="username"
                       placeholder="Enter your username"
                       value = {username}
                       onChange={(e) => setUsername(e.target.value)}/>
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input id="username"
                       placeholder="Enter your email"
                       value = {email}
                       onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input id="password"
                       type="password"
                       placeholder="Enter your password"
                       value = {password}
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