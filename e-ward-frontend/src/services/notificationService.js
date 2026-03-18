import api from "./api";

function getForUser(userId) {
  return api.get(`/notifications/user/${userId}`);
}

function markAsRead(notificationId) {
  return api.post(`/notifications/${notificationId}/read`);
}

function deleteNotification(id) {
  return api.delete(`/notifications/${id}`);
}

export default {
  getForUser,
  markAsRead,
  deleteNotification  // ADD THIS
};