import React from "react";
import SwapRequestItem from "./SwapRequestItem";

const SwapRequestList = ({ requests, refresh, activeTab, currentUserId }) => {
  if (!requests || requests.length === 0) {
    return <p>No swap requests found.</p>;
  }

  return (
    <div>
      {requests.map((req) => (
        <SwapRequestItem 
          key={req.id} 
          request={req} 
          refresh={refresh}
          activeTab={activeTab}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default SwapRequestList;