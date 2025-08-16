import React from 'react';

const Profile: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Profile Settings</h1>
        <p className="text-xl text-muted-foreground">Manage your account settings</p>
      </div>
    </main>
  );
};

export default Profile;