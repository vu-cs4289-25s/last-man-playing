import React from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold mb-4">Last Man Playing</h1>
      <p className="text-lg text-gray-700 mb-6">Join the ultimate showdown!</p>

      <div className="w-full max-w-xs space-y-4">
        <Label>Username</Label>
        <Input placeholder="Enter your username" className="w-full" />
        <Button variant="default" className="w-full">Get Started</Button>
      </div>
    </div>
  );
}