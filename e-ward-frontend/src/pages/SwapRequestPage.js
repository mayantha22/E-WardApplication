import React, { useEffect, useState } from "react";
import swapService from "../services/swapService";
import staffService from "../services/staffService";
import { useAuth } from "../context/AuthContext";
import SwapRequestList from "../components/SwapRequestList";
import { toast } from "react-toastify";

const SwapRequestPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [myStaffId, setMyStaffId] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Backend expects User ID and Role for the getAllFiltered method
      const res = await swapService.getAll(user?.id, user?.role);
      const actualData = res.data || res;
      setRequests(Array.isArray(actualData) ? actualData : []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      staffService.getByUserId(user.id)
        .then(data => setMyStaffId(data.id))
        .catch(err => console.error("Failed to fetch staff ID", err));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchRequests();
      setActiveTab(user.role === "ADMIN" ? "adminApproval" : "received");
    }
  }, [user]);

  const currentUserId = Number(user?.id);

  const currentUserName = user?.fullName;

  // --- REFINED TAB FILTERS ---

  // 1. ADMIN: Directs that need final approval or Admin-Directs
  const adminApprovalRequests = requests.filter(r => 
    (r.requestType === "ADMIN_DIRECT" || 
    (r.requestType === "DIRECT" && r.peerApprovalStatus === "APPROVED")) && 
    r.adminStatus === "PENDING"
  );

  // 2. INDIRECT: Requests needing a staff member assigned by Admin
  const indirectRequests = requests.filter(r => 
    r.requestType === "INDIRECT" && r.adminStatus === "PENDING"
  );

 // 3. RECEIVED (FOR STAFF): Only requests where CURRENT user is the target

//   // 3. RECEIVED: Only requests where CURRENT user is the target
// const receivedRequests = requests.filter(r =>
//   r.requestType === "DIRECT" &&
//   r.peerApprovalStatus === "PENDING" &&
//   String(r.targetStaffId) === String(currentUserId)
//   //r.targetName === currentUserName  // match by name
// );

// // 4. MY SENT: Anything you started
// const submittedRequests = requests.filter(r =>
//   String(r.requesterStaffId) === String(currentUserId) 
// );

 const receivedRequests = requests.filter(r =>
    r.requestType === "DIRECT" &&
    r.peerApprovalStatus === "PENDING" &&
    String(r.targetStaffId) === String(myStaffId)  // ✅ staff ID vs staff ID
  );

  const submittedRequests = requests.filter(r =>
    String(r.requesterStaffId) === String(myStaffId) // ✅ staff ID vs staff ID
  );


  // 5. HISTORY: Finished items
  const historyRequests = requests.filter(r => 
    r.adminStatus === "AUTO_APPLIED" || 
    r.adminStatus === "REJECTED" || 
    r.peerApprovalStatus === "REJECTED"
  );

  let displayData = [];
  if (activeTab === "adminApproval") displayData = adminApprovalRequests;
  else if (activeTab === "indirect") displayData = indirectRequests;
  else if (activeTab === "received") displayData = receivedRequests;
  else if (activeTab === "submitted") displayData = submittedRequests;
  else if (activeTab === "history") displayData = historyRequests;

  if (loading) return <div className="text-center mt-5"><h5>Loading MediCore Swaps...</h5></div>;

/* console.log("Request fields:", requests[0]);

  console.log("currentUserId:", currentUserId);
console.log("typeof currentUserId:", typeof currentUserId);
console.log("targetStaffId sample:", requests[0]?.targetStaffId);
console.log("typeof targetStaffId:", typeof requests[0]?.targetStaffId);
console.log("requesterStaffId sample:", requests[0]?.requesterStaffId);
console.log("Match test:", requests[0]?.targetStaffId === currentUserId);

console.log("Full user object:", JSON.stringify(user));
<button className={`btn ${activeTab === 'history' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setActiveTab("history")}>
          History ({historyRequests.length})
        </button> 

*/


  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Swap Management</h2>
        <button className="btn btn-outline-secondary btn-sm" onClick={fetchRequests}>Refresh</button>
      </div>
      
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {user?.role === "ADMIN" ? (
          <>
            <button className={`btn ${activeTab === 'adminApproval' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab("adminApproval")}>
              Admin Approvals ({adminApprovalRequests.length})
            </button>
            <button className={`btn ${activeTab === 'indirect' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab("indirect")}>
              Indirect ({indirectRequests.length})
            </button>
          </>
        ) : (
          <>
            <button className={`btn ${activeTab === 'received' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab("received")}>
              Requests for Me ({receivedRequests.length})
            </button>
            <button className={`btn ${activeTab === 'submitted' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setActiveTab("submitted")}>
              My Sent ({submittedRequests.length})
            </button>
          </>
        )}
       
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {displayData.length > 0 ? (
            <SwapRequestList 
  requests={displayData} 
  refresh={fetchRequests} 
  activeTab={activeTab} 
  currentUserId={currentUserId} // Add this line
/>
          ) : (
            <div className="text-center py-5 text-muted">No requests found here.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapRequestPage;