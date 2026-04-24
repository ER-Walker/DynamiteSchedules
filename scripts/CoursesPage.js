function CourseCard({ course }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="flex flex-col border border-red-200 bg-red-800 rounded-lg p-4 shadow-sm my-4">

      {/* Header row - always visible */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{course._id} — {course.name}</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-white ml-4 text-xl font-bold focus:outline-none"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3">
          <p className="text-white text-sm">{course.description}</p>
          <div className="mt-4 flex justify-between text-sm">
            <span className="font-medium text-gray-400">{course.credits} credits</span>
            {course.requirementTag.length > 0 && (
              <span className="text-gray-400">{course.requirementTag.join(', ')}</span>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

function CoursesPage() {
  const [grouped, setGrouped]         = React.useState({});
  const [departments, setDepartments] = React.useState([]);
  const [selected, setSelected]       = React.useState('');
  const [loading, setLoading]         = React.useState(true);
  const [error, setError]             = React.useState(null);

  React.useEffect(() => {
    fetch('/api/courses')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
      })
      .then(data => {
        const groups = data.reduce((acc, course) => {
          const dept = course.department || 'Uncategorized';
          if (!acc[dept]) acc[dept] = [];
          acc[dept].push(course);
          return acc;
        }, {});

        const sorted = Object.keys(groups).sort();
        setGrouped(groups);
        setDepartments(sorted);
        setSelected('');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-8 text-gray-500">Loading courses...</p>;
  if (error)   return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  const visibleCourses = grouped[selected] || [];

  return (
    <div className="bg-gray-800 min-h-screen p-6">

      {/* Dropdown */}
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className="mb-8 p-2 rounded-md bg-gray-600 text-white border border-gray-500 focus:outline-none"
      >
        <option value="" disabled>Choose Department</option>
        {departments.map(dept => (
          <option key={dept} value={dept}>{dept}</option>
        ))}
      </select>

      {/* Course grid - 3 per row, full width */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-6 w-full">
        {visibleCourses.map(course => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CoursesPage />);