import api from "./api";

function getAll() {
  return api.get("/staff");
}

function getById(id) {
  return api.get(`/staff/${id}`);
}

function getByUserId(userId) {
  return api.get(`/staff/by-user/${userId}`);
}

function create(dto) {
  // dto should contain at minimum userId or fullName? Our backend StaffService expects user id association — but for frontend we'll send reasonable payload.
  return api.post("/staff", dto);
}

function update(id, dto) {
  return api.put(`/staff/${id}`, dto);
}

function deleteStaff(id) {
  return api.delete(`/staff/${id}`);
}

const search = async (keyword) => {
  if (!keyword || keyword.trim() === "") return [];

  try {
    const data = await api.get(`/rosters/staff/search?keyword=${keyword}`);
    console.log("staffService.search called with:", keyword);
    console.log("staffService API response:", data); // ✅ this is already the JSON array
    return data;
  } catch (error) {
    console.error("staffService.search failed:", error);
    return [];
  }
};



export default {
  getAll,
  getById,
  create,
  update,
  deleteStaff,
  search,
  getByUserId
  
};
