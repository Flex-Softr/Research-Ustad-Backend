import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    socket.on("courseUpdate", (data) => {
      setCourses(data);
    });

    return () => socket.off("courseUpdate");
  }, []);

  // Add Course
  const addCourse = async () => {
    await fetch("http://localhost:5000/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, startDate }),
    });
  };

  // Delete Course
  const deleteCourse = async (id) => {
    await fetch(`http://localhost:5000/courses/${id}`, { method: "DELETE" });
  };

  // Update Course
  const updateCourse = async (id) => {
    const newTitle = prompt("Enter new title:");
    const newStartDate = prompt("Enter new start date (YYYY-MM-DD HH:MM:SS):");

    await fetch(`http://localhost:5000/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, startDate: newStartDate }),
    });
  };

  // Function to calculate remaining time in Days, Hours, Minutes, Seconds
  const getTimeRemaining = (startDate) => {
    const currentTime = new Date();
    const startTime = new Date(startDate);
    const timeDiff = startTime - currentTime;

    if (timeDiff <= 0) return "Course has started or ended"; // If time has passed

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`; // Format the remaining time
  };

  return (
    <div>
      <h2>Courses</h2>
      <input
        type="text"
        placeholder="Course Title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="datetime-local"
        onChange={(e) => setStartDate(e.target.value)}
      />
      <button onClick={addCourse}>Add Course</button>

      {/* Upcoming Courses Section */}
      <h3>Upcoming Courses</h3>
      <ul>
        {courses
          ?.filter((course) => new Date(course.startDate) > new Date()) // Filtering upcoming courses
          ?.map((course) => (
            <li key={course._id}>
              <strong>{course.title}</strong> - {course.status}
              <span> (Starts in: {getTimeRemaining(course.startDate)})</span>
              <button onClick={() => updateCourse(course._id)}>Update</button>
              <button onClick={() => deleteCourse(course._id)}>Delete</button>
            </li>
          ))}
      </ul>

      {/* Ongoing Courses Section */}
      <h3>Ongoing Courses</h3>
      <ul>
        {courses
          ?.filter((course) => new Date(course.startDate) <= new Date()) // Filtering ongoing courses
          ?.map((course) => (
            <li key={course._id}>
              <strong>{course.title}</strong> - {course.status}
              <span> (Ongoing)</span>
              <button onClick={() => updateCourse(course._id)}>Update</button>
              <button onClick={() => deleteCourse(course._id)}>Delete</button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default CourseList;
