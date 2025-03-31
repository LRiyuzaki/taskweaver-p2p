
import React from "react";
import { Header } from "@/components/Header";
import { TaskBoard } from "@/components/TaskBoard";

const Index = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <TaskBoard />
      </main>
    </div>
  );
};

export default Index;
