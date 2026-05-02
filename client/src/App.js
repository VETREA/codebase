import { useState, useEffect } from "react";
import axios from "axios";
import Auth from "./components/Auth";

const API = "http://localhost:5000/api";

export default function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [selectedProject, setSelectedProject] = useState("");

  // LOAD TOKEN AND USER ON REFRESH
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // FETCH DATA
  const fetchData = async () => {
    if (!token) return;
    try {
      const [usersRes, tasksRes, projectsRes] = await Promise.all([
        axios.get(`${API}/auth/users`),
        axios.get(`${API}/tasks`, { headers: { Authorization: token } }),
        axios.get(`${API}/projects`, { headers: { Authorization: token } })
      ]);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
  };

  // CREATE PROJECT
  const createProject = async () => {
    try {
      await axios.post(
        `${API}/projects`,
        { name: projectName, members: [] },
        { headers: { Authorization: token } }
      );
      setProjectName("");
      alert("Project Created");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create project");
    }
  };

  // CREATE TASK
  const createTask = async () => {
    try {
      await axios.post(
        `${API}/tasks`,
        {
          title: taskTitle,
          description: "demo task",
          deadline,
          status: "Pending",
          assignedTo: assignedTo || null,
          projectId: selectedProject || null,
        },
        { headers: { Authorization: token } }
      );
      setTaskTitle("");
      setDeadline("");
      alert("Task Created");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create task");
    }
  };

  const completed = tasks.filter((t) => t.status === "Completed").length;
  const overdue = tasks.filter(
    (t) =>
      t.deadline &&
      new Date(t.deadline) < new Date() &&
      t.status !== "Completed"
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            TeamTask
          </h1>
        </div>

        {token && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
            <button
              className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        {!token ? (
          <Auth setToken={setToken} setUser={setUser} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar / Controls */}
            <div className="lg:col-span-4 space-y-6">
              {/* ADMIN ONLY CONTROLS */}
              {user?.role === "admin" ? (
                <>
                  {/* CREATE PROJECT */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                      Create Project
                    </h2>
                    <div className="space-y-3">
                      <input
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                      />
                      <button
                        className="w-full bg-slate-900 text-white px-4 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
                        onClick={createProject}
                      >
                        Create Project
                      </button>
                    </div>
                  </div>

                  {/* CREATE TASK */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                      New Task
                    </h2>
                    <div className="space-y-3">
                      <input
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                        placeholder="Task Title"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                      />
                      <input
                        type="date"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                      />
                      <select
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                      >
                        <option value="">Select Project...</option>
                        {projects.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <select
                        className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                      >
                        <option value="">Assign To...</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="w-full bg-indigo-600 text-white px-4 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                        onClick={createTask}
                      >
                        Add Task
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
                  <h2 className="text-lg font-bold mb-2 text-indigo-900">Member Portal</h2>
                  <p className="text-sm text-indigo-600">
                    Welcome back, {user?.name}! You can view your projects and mark tasks as completed below.
                  </p>
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* DASHBOARD STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Tasks</p>
                  <h3 className="text-3xl font-black mt-1 text-slate-900">{tasks.length}</h3>
                </div>

                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
                  <p className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Completed</p>
                  <h3 className="text-3xl font-black mt-1 text-emerald-900">{completed}</h3>
                </div>

                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 shadow-sm">
                  <p className="text-sm font-medium text-rose-600 uppercase tracking-wider">Overdue</p>
                  <h3 className="text-3xl font-black mt-1 text-rose-900">{overdue}</h3>
                </div>
              </div>

              {/* TASK LIST */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Recent Tasks</h2>
                  <button
                    className="text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
                    onClick={fetchData}
                  >
                    Refresh
                  </button>
                </div>

                {tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <p className="font-medium">No tasks found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((t) => (
                      <div
                        key={t._id}
                        className="group p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-md transition-all duration-300 flex justify-between items-center"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800">{t.title}</h4>
                            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold ${
                              t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              📅 {t.deadline ? t.deadline.slice(0, 10) : "No date"}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              👤 {t.assignedTo?.name || "Unassigned"}
                            </p>
                            {t.projectId && (
                              <p className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">
                                📁 {t.projectId.name}
                              </p>
                            )}
                          </div>
                        </div>

                        {t.status !== 'Completed' && (
                          <button
                            className="bg-white border border-slate-200 text-slate-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 px-4 py-2 rounded-xl text-xs font-bold transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                            onClick={async () => {
                              try {
                                await axios.put(
                                  `${API}/tasks/${t._id}`,
                                  { status: "Completed" },
                                  { headers: { Authorization: token } }
                                );
                                fetchData();
                              } catch (err) {
                                alert("Error updating task");
                              }
                            }}
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}