import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <p className="text-xl text-muted-foreground">Your personal progress and stats</p>
      </div>
    </main>
  );
};

export default Dashboard;