import React, { useEffect, useState } from "react";
import API from "../config/API";
import { toast } from "react-toastify";

const Assign = () => {
  const [task, setTask] = useState({
    title: "",
    description: "",
    assignTo: "",
    status: "",
    endDate: "",
  });
  const [users, setUsers] = useState([]);

  const getUsers = async () => {
    try {
      let res = await API.get("/user/?role=user");
      setUsers(res.data);
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const PostTask = async () => {
    try {
      let res = await API.post("/task", task);
      console.log(res.data);
      toast.success("Task Created Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Task creation failed");
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(task);
    PostTask();
    setTask({
      title: "",
      description: "",
      assignTo: "",
      status: "",
      endDate: "",
    });
  };

  return (
    <div className="bg-blue-50 text-gray-900 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg border border-gray-200">
        <h2 className="text-gray-800 text-2xl font-semibold text-center mb-4">
          Assign Task
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={task.title}
              onChange={handleInputChange}
              className="w-full mt-1 p-3 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={task.description}
              onChange={handleInputChange}
              className="w-full mt-1 p-3 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium">Assigned To</label>
            <select
              name="assignTo"
              value={task.assignTo}
              onChange={handleInputChange}
              className="w-full mt-1 p-3 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled>
                Select User
              </option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={task.status}
              onChange={handleInputChange}
              className="w-full mt-1 p-3 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="" disabled>
                Select Status
              </option>
              <option value="Pending">Pending</option>
              <option value="In-Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              name="endDate"
              value={task.endDate}
              onChange={handleInputChange}
              className="w-full mt-1 p-3 rounded bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition"
          >
            Assign Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default Assign;
