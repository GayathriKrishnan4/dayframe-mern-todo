import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/todos";

function App() {
  const [tasks, setTasks] = useState([]);
  const [trashTasks, setTrashTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState("Personal");
  const [newPriority, setNewPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("tasks");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit modal states
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("Personal");
  const [editPriority, setEditPriority] = useState("Medium");

  // Fetch active tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Could not load tasks");
      }

      const data = await response.json();
      setTasks(data);
      setError("");
    } catch (err) {
      setError("Unable to connect to the backend. Make sure it is running.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Trash
  const fetchTrash = async () => {
    try {
      const response = await fetch(`${API_URL}/trash`);

      if (!response.ok) {
        throw new Error("Could not load Trash");
      }

      const data = await response.json();
      setTrashTasks(data);
    } catch (err) {
      setError("Unable to load Trash.");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTrash();
  }, []);

  // Add task
  const addTask = async (e) => {
    e.preventDefault();

    if (!newTask.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.trim(),
          category: newCategory,
          priority: newPriority,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not add task");
      }

      setNewTask("");
      setNewCategory("Personal");
      setNewPriority("Medium");

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Complete or uncomplete task
  const toggleTask = async (task) => {
    try {
      const response = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not update task");
      }

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Open edit modal
  const editTask = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditCategory(task.category || "Personal");
    setEditPriority(task.priority || "Medium");
    setError("");
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingTask(null);
    setEditTitle("");
    setEditCategory("Personal");
    setEditPriority("Medium");
  };

  // Save edited task
  const saveEditedTask = async (e) => {
    e.preventDefault();

    if (!editTitle.trim()) {
      setError("Task name cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${editingTask._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          category: editCategory,
          priority: editPriority,
        }),
      });

      if (!response.ok) {
        throw new Error("Could not edit task");
      }

      setError("");
      closeEditModal();

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  // Move task to Trash
  const moveToTrash = async (id) => {
    if (
      !window.confirm(
        "Move this task to Trash? You can restore it later."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not move task to Trash");
      }

      await fetchTasks();
      await fetchTrash();
    } catch (err) {
      setError(err.message);
    }
  };

  // Restore task
  const restoreTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/restore`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Could not restore task");
      }

      await fetchTasks();
      await fetchTrash();
    } catch (err) {
      setError(err.message);
    }
  };

  // Permanently delete task
  const permanentlyDelete = async (id) => {
    if (
      !window.confirm(
        "Permanently delete this task? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}/permanent`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Could not delete task");
      }

      await fetchTrash();
    } catch (err) {
      setError(err.message);
    }
  };

  // Task statistics
  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = tasks.length - completedCount;

  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  // Search and filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === "Pending"
        ? !task.completed
        : filter === "Completed"
        ? task.completed
        : true;

    const matchesSearch = (task.title || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase().trim());

    return matchesFilter && matchesSearch;
  });

  // Current date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          dayframe<span>.</span>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-label">WORKSPACE</p>

          <button
            className={`nav-item ${
              view === "tasks" ? "active" : ""
            }`}
            onClick={() => setView("tasks")}
          >
            <span>▦</span> My Tasks
          </button>

          <button
            className={`nav-item ${
              view === "trash" ? "active" : ""
            }`}
            onClick={() => {
              setView("trash");
              fetchTrash();
            }}
          >
            <span>♲</span> Trash
            <span className="trash-count">
              {trashTasks.length}
            </span>
          </button>
        </div>

        <div className="sidebar-quote">
          <span className="quote-mark">“</span>
          <p>
            Small steps every day lead to remarkable things.
          </p>
          <span className="quote-author">
            YOUR DAILY REMINDER
          </span>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">G</div>

          <div>
            <strong>My Workspace</strong>
            <small>Personal planner</small>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="topbar">
          <span className="breadcrumb">
            Workspace / {view === "tasks" ? "My Tasks" : "Trash"}
          </span>

          <span className="today-date">{today}</span>
        </header>

        {view === "tasks" ? (
          <>
            {/* WELCOME SECTION */}
            <section className="welcome-section">
              <p className="eyebrow">YOUR PERSONAL SPACE</p>

              <h1>
                Make room for
                <br />
                what <em>matters.</em>
              </h1>

              <p className="welcome-subtitle">
                A little progress each day adds up to big results.
              </p>
            </section>

            {/* STATISTICS */}
            <section className="stats-grid">
              <div className="stat-card stat-total">
                <span className="stat-label">TOTAL TASKS</span>
                <h2>{tasks.length}</h2>
                <span className="stat-note">
                  Tasks in your workspace
                </span>
              </div>

              <div className="stat-card stat-completed">
                <span className="stat-label">COMPLETED</span>
                <h2>{completedCount}</h2>
                <span className="stat-note">
                  Things you've accomplished
                </span>
              </div>

              <div className="stat-card stat-pending">
                <span className="stat-label">PENDING</span>
                <h2>{pendingCount}</h2>
                <span className="stat-note">
                  Still waiting for you
                </span>
              </div>
            </section>

            {/* TASK SECTION */}
            <section className="task-section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">STAY ON TRACK</p>
                  <h2>Your task list</h2>
                </div>

                <span className="task-count">
                  {tasks.length} tasks
                </span>
              </div>

              {/* ADD TASK FORM */}
              <form className="task-form" onSubmit={addTask}>
                <input
                  type="text"
                  placeholder="What needs to get done?"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />

                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value)
                  }
                  className="category-select"
                >
                  <option value="Personal">Personal</option>
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                </select>

                <select
                  value={newPriority}
                  onChange={(e) =>
                    setNewPriority(e.target.value)
                  }
                  className="priority-select"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <button type="submit" className="add-button">
                  + Add Task
                </button>
              </form>

              {error && (
                <p className="error-message">{error}</p>
              )}

              {/* FILTER BUTTONS */}
              <div className="task-filters">
                {["All", "Pending", "Completed"].map((item) => (
                  <button
                    key={item}
                    className={
                      filter === item
                        ? "filter-btn selected"
                        : "filter-btn"
                    }
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* SEARCH BAR */}
              <div className="search-container">
                <span className="search-icon">⌕</span>

                <input
                  type="search"
                  placeholder="Search your tasks..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                />

                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* TASK LIST */}
              <div className="task-list">
                {loading ? (
                  <p className="empty-message">
                    Loading your tasks...
                  </p>
                ) : filteredTasks.length === 0 ? (
                  <div className="empty-message">
                    <span>✦</span>
                    <p>
                      {searchQuery
                        ? "No matching tasks found."
                        : "Nothing here just yet."}
                    </p>
                    <small>
                      {searchQuery
                        ? "Try searching with another task name."
                        : "Add a task and make today count."}
                    </small>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      className={`task-item ${
                        task.completed ? "task-done" : ""
                      }`}
                      key={task._id}
                    >
                      <button
                        className={`task-check ${
                          task.completed ? "checked" : ""
                        }`}
                        onClick={() => toggleTask(task)}
                        aria-label="Toggle task completion"
                      >
                        {task.completed ? "✓" : ""}
                      </button>

                      <div className="task-details">
                        <span className="task-title">
                          {task.title}
                        </span>

                        <div className="task-labels">
                          <span
                            className={`category-tag category-${
                              task.category || "Personal"
                            }`}
                          >
                            {task.category || "Personal"}
                          </span>

                          <span
                            className={`priority-tag priority-${
                              task.priority || "Medium"
                            }`}
                          >
                            {task.priority || "Medium"} priority
                          </span>
                        </div>
                      </div>

                      <div className="task-actions">
                        <button
                          onClick={() => editTask(task)}
                          title="Edit"
                        >
                          ✎
                        </button>

                        <button
                          onClick={() => moveToTrash(task._id)}
                          title="Move to Trash"
                        >
                          ♲
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* BOTTOM SECTION */}
            <section className="bottom-grid">
              <div className="progress-card">
                <div>
                  <p className="eyebrow">YOUR MOMENTUM</p>
                  <h3>Daily progress</h3>
                  <p>Keep going. You're doing great.</p>
                </div>

                <div
                  className="progress-circle"
                  style={{ "--progress": `${progress}%` }}
                >
                  <div className="progress-inner">
                    <strong>{progress}%</strong>
                    <small>DONE</small>
                  </div>
                </div>
              </div>

              <div className="focus-card">
                <span>✦ A LITTLE NOTE</span>
                <h3>
                  Focus on progress,
                  <br />
                  not perfection.
                </h3>
                <p>One task at a time. You've got this.</p>
              </div>
            </section>
          </>
        ) : (
          /* TRASH SECTION */
          <section className="task-section trash-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">RECOVER YOUR TASKS</p>
                <h2>Recently deleted</h2>

                <p className="welcome-subtitle">
                  Tasks in Trash stay here until you permanently
                  delete them.
                </p>
              </div>

              <span className="task-count">
                {trashTasks.length} items
              </span>
            </div>

            {error && (
              <p className="error-message">{error}</p>
            )}

            <div className="task-list">
              {trashTasks.length === 0 ? (
                <div className="empty-message">
                  <span>♲</span>
                  <p>Your Trash is empty.</p>
                  <small>
                    Deleted tasks will appear here.
                  </small>
                </div>
              ) : (
                trashTasks.map((task) => (
                  <div
                    className="task-item trash-item"
                    key={task._id}
                  >
                    <div className="task-details">
                      <span className="task-title">
                        {task.title}
                      </span>

                      <div className="task-labels">
                        <span
                          className={`category-tag category-${
                            task.category || "Personal"
                          }`}
                        >
                          {task.category || "Personal"}
                        </span>

                        <span
                          className={`priority-tag priority-${
                            task.priority || "Medium"
                          }`}
                        >
                          {task.priority || "Medium"} priority
                        </span>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        onClick={() => restoreTask(task._id)}
                        title="Restore task"
                      >
                        ↶
                      </button>

                      <button
                        onClick={() =>
                          permanentlyDelete(task._id)
                        }
                        title="Delete permanently"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer className="footer">
          <span>dayframe. — Make every day count.</span>
          <span>Designed with intention ✦</span>
        </footer>
      </main>

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div
          className="edit-modal-overlay"
          onClick={closeEditModal}
        >
          <div
            className="edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="edit-modal-header">
              <div>
                <p className="eyebrow">MAKE A CHANGE</p>
                <h2>Edit task</h2>
                <p>Update the details of your task.</p>
              </div>

              <button
                type="button"
                className="edit-modal-close"
                onClick={closeEditModal}
                aria-label="Close edit modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveEditedTask}>
              <label htmlFor="edit-title">TASK NAME</label>

              <input
                id="edit-title"
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter task name"
                autoFocus
              />

              <div className="edit-modal-fields">
                <div>
                  <label htmlFor="edit-category">
                    CATEGORY
                  </label>

                  <select
                    id="edit-category"
                    value={editCategory}
                    onChange={(e) =>
                      setEditCategory(e.target.value)
                    }
                  >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-priority">
                    PRIORITY
                  </label>

                  <select
                    id="edit-priority"
                    value={editPriority}
                    onChange={(e) =>
                      setEditPriority(e.target.value)
                    }
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="edit-cancel-btn"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="edit-save-btn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;