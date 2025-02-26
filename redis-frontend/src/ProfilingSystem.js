import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/students";

const ProfilingSystem = () => {
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    gender: "",
    age: "",
    address: "",
    occupation: "",
    religion: "",
    status: "",
  });

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch all students from Redis
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error.response?.data || error.message);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add a new student (admin only)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile added successfully!");
      fetchStudents(); // Refresh the student list
      setFormData({ id: "", name: "", gender: "", age: "", address: "", occupation: "", religion: "", status: "" });
    } catch (error) {
      toast.error("Error adding student!");
    }
  };

  // Edit a student
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/${formData.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile updated successfully!");
      fetchStudents();
      setFormData({ id: "", name: "", gender: "", age: "", address: "", occupation: "", religion: "", status: "" });
      setIsEditing(false);
    } catch (error) {
      toast.error("Error updating student!");
    }
  };

  // Delete a student (admin only)
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile deleted!");
      fetchStudents();
    } catch (error) {
      toast.error("Error deleting profile!");
    }
  };

  return (
    <div className="container">
      <h1>Brgy. Dalipuga Profiling System</h1>

      {/* Student List */}
      <h2>Profile List</h2>
      <table border="1" align="center" style={{ width: "80%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Address</th>
            <th>Occupation</th>
            <th>Religion</th>
            <th>Status</th>
            {role === "admin" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.gender}</td>
              <td>{student.age}</td>
              <td>{student.address}</td>
              <td>{student.occupation}</td>
              <td>{student.religion}</td>
              <td>{student.status}</td>
              {role === "admin" && (
                <td>
                  <button onClick={() => setFormData(student)}>Edit</button>
                  <button onClick={() => handleDelete(student.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Admin Form for Adding & Editing Students */}
      {role === "admin" && (
        <form onSubmit={isEditing ? handleEditSubmit : handleAddSubmit}>
          <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <input type="text" name="occupation" placeholder="Occupation" value={formData.occupation} onChange={handleChange} required />
          <input type="text" name="religion" placeholder="Religion" value={formData.religion} onChange={handleChange} required />
          <input type="text" name="status" placeholder="Status" value={formData.status} onChange={handleChange} required />
          <button type="submit">{isEditing ? "Update Profile" : "Add Profile"}</button>
        </form>
      )}

      <ToastContainer />
    </div>
  );
};

export default ProfilingSystem;
