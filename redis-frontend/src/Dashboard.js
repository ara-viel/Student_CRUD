import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { ToastContainer, toast } from 'react-toastify';
import Papa from 'papaparse';
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import './App.css'







const API_URL = 'http://localhost:5000/students';
//const UPLOAD_URL = 'http://localhost:5000/upload';


function App() {
  const [formData, setFormData] = useState({ id: '', name: '', gender: '', age: '', address: '', occupation: '', religion: '', status: '' });
  const [students, setStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]); // Store CSV preview data

 
  // Fetch all students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };


  useEffect(() => {
    fetchStudents();
  }, []);




  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  

  // Handle input change and file upload logic
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
  
    if (file) {
      const reader = new FileReader();
      reader.onload = ({ target }) => {
        Papa.parse(target.result, {
          header: true,
          complete: (result) => {
            setCsvPreview(result.data.slice(0, 5)); // Store only the first 5 rows for preview
          }
        });
      };
      reader.readAsText(file);
    }
  };

 // Add new student
 const handleAddSubmit = async (e) => {
  e.preventDefault();
  try {
    await axios.post(API_URL, formData);
    toast.success('Profile added successfully!');
    setFormData({ id: '', name: '', gender: '', age: '', address: '', occupation: '', religion: '', status: '' });
    fetchStudents(); // Refresh data
  } catch (error) {
    toast.error('Error adding profile.');
    console.error(error);
  }
};

// Update existing student
const handleEditSubmit = async (e) => {
e.preventDefault();
try {
  await axios.put(`${API_URL}/${formData.id}`, formData);
  toast.success('Profile updated successfully!');
  setIsEditing(false);
  setFormData({ id: '', name: '', gender: '', age: '', address: '', occupation: '', religion: '', status: '' });
  fetchStudents(); // Refresh data
} catch (error) {
  toast.error('Error updating profile.');
  console.error(error);
}
};


// Delete student
const handleDelete = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    toast.success('Profile deleted!');
    fetchStudents();
  } catch (error) {
    toast.error('Error deleting profile!');
  }
};


// Populate form for updating student
const handleEdit = (student) => {
  setFormData(student);
  setIsEditing(true);
};

  const resetCsvUpload = () => {
    setCsvFile(null);
    setCsvPreview([]);
  };


  const handleFileUpload = () => {
    if (!csvFile) {
      toast.error('Please select a CSV file.');
      return;
    }
  
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      Papa.parse(target.result, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          setCsvPreview(result.data); // Store preview data
          toast.info('CSV file parsed! Check the preview below.');
        },
        error: (error) => {
          toast.error('Error parsing CSV file.');
          console.error(error);
        }
      });
    };
    reader.readAsText(csvFile);
  };

 
  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.occupation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.religion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.age.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.status.toLowerCase().includes(searchTerm.toLowerCase())
  );


 


 

  // Count songs for Data visualization
  const processChartData = () => {
    const occCount = {};
    const genderCount = {};
  
    students.forEach((student) => {
      // Count number per occupation
      occCount[student.occupation] = (occCount[student.occupation] || 0) + 1;
      
      // Count number per gender
      genderCount[student.gender] = (genderCount[student.gender] || 0) + 1;
    });
  
    // Convert to array format for recharts
    const occupationData = Object.keys(occCount).map((occupation) => ({
      name: occupation,
      count: occCount[occupation],
    }));
  
    const genderData = Object.keys(genderCount).map((gender) => ({
      name: gender,
      value: genderCount[gender],
    }));
  
    return { occupationData, genderData };
  };
  
  const { occupationData, genderData } = processChartData();


  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated"); // Remove login status
    navigate("/"); // Redirect back to login page
  };
// end of CONST

  return (
    
  <div className="main-container">
  {/* Left: Form */}
  <div className="form-container">
          <div className="dashboard-container">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
          </div>
   
    <h1>Profiling System</h1>
    {!isEditing ? (
      <form onSubmit={handleAddSubmit}>
        <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required />
        <input type="text" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <input type="text" name="occupation" placeholder="Occupation" value={formData.occupation} onChange={handleChange} required />
        <input type="text" name="religion" placeholder="Religion" value={formData.religion} onChange={handleChange} required />
        <input type="text" name="status" placeholder="Status" value={formData.status} onChange={handleChange} required />
        <button type="submit">Add Profile</button>
      </form>
    ) : (
      <form onSubmit={handleEditSubmit}>
        <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="text" name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange} required />
        <input type="text" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <input type="text" name="occupation" placeholder="Occupation" value={formData.occupation} onChange={handleChange} required />
        <input type="text" name="religion" placeholder="Religion" value={formData.religion} onChange={handleChange} required />
        <input type="text" name="status" placeholder="Status" value={formData.status} onChange={handleChange} required />
        <button type="submit">Update Profile</button>
      </form>
    )}
  </div>
  


  {/* Right: Profile List */}
  <div className="profile-container">
    {/* Search and CSV Upload */}
    <div className="profile-actions">
      <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearchChange} />
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>
      <button onClick={resetCsvUpload}>Cancel</button>
      
    </div>

    <h2>Profile List</h2>
    <table border="1">
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
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredStudents.map((student) => (
          <tr key={student.id}>
            <td>{student.id}</td>
            <td>{student.name}</td>
            <td>{student.gender}</td>
            <td>{student.age}</td>
            <td>{student.address}</td>
            <td>{student.occupation}</td>
            <td>{student.religion}</td>
            <td>{student.status}</td>
            <td>
              <button onClick={() => handleEdit(student)}>Edit</button>
              <button onClick={() => handleDelete(student.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    
    {csvPreview.length > 0 && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h3 style={{ color: '#444', fontSize: '1.2rem' }}>CSV File </h3>
            <div style={{
              overflowX: 'auto',
              display: 'inline-block',
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#007bff', color: '#fff' }}>
                  {Object.keys(csvPreview[0]).map((header) => (
                    <th key={header} style={{
                      padding: '10px',
                      borderBottom: '2px solid #0056b3',
                      textTransform: 'uppercase',
                      fontSize: '0.9rem'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvPreview.map((row, index) => (
                  <tr key={index} style={{
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f1f1f1'
                  }}>
                    {Object.values(row).map((cell, cellIndex) => (
                      <td key={cellIndex} style={{
                        padding: '8px',
                        borderBottom: '1px solid #ddd',
                        textAlign: 'center',
                        fontSize: '0.9rem'
                      }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
 {/* Charts Frontend */}

 <div className="charts-container">
          {/* Bar Chart for Occupation */}
          <div className="chart-wrapper">
            <h3 className="chart-title">List of Occupation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={occupationData} className="bar-chart">
              <XAxis dataKey="name" stroke="#ffffff" />
              <YAxis stroke="#ffffff" />
              <Tooltip wrapperStyle={{ backgroundColor: "#d32f2f", color: "#ffffff" }} />
              <Legend wrapperStyle={{ color: "#ffffff" }} />
              <Bar dataKey="count" fill="#388e3c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Doughnut Chart for Gender */}
          <div className="chart-wrapper">
              <h3 className="chart-title">Gender Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart className="pie-chart">
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={0} /* Makes it a Doughnut Chart */
                    label
                  >
                    {genderData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={["#d32f2f", "#388e3c", "#C0C0C0", "#CD7F32", "#1DB954", "#37475A"][index % 6]}
                      />
                    ))}
                  </Pie>
                  <Tooltip wrapperStyle={{ backgroundColor: "#b71c1c", color: "#ffffff" }} />
                </PieChart>
              </ResponsiveContainer> 
            </div>
            </div>

            
      <ToastContainer />
    </div>
  </div>
    
  


        
  );
}


export default App;



