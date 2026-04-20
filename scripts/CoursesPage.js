function CourseCard({course}){
    return(
        <div className="flex flex-col flex-1 min-w-[250px] border border-red-200 bg-red-800 rounded-lg p-4  shadow-sm">
      <h3 className="text-lg font-semibold mb-1">{course._id} — {course.name}</h3>
      <p className="text-white text-sm flex-grow">{course.description}</p>
      <div className="mt-4 flex justify-between text-sm">
        <span className="font-medium text-gray-400">{course.credits} credits</span>
        {course.requirementTag.length > 0 && (
          <span className="text-gray-400">{course.requirementTag.join(', ')}</span>
        )}
      </div>
    </div>
  );
}

function CoursesPage() {
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(null);

  React.useEffect(() => {
    fetch('/api/courses')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
      })
      .then(data => setCourses(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-8 text-gray-500">Loading courses...</p>;
  if (error)   return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-gray-600">
      <h1 className="text-2xl font-bold mb-6">Courses</h1>
      <div className="flex flex-wrap gap-4">
        {courses.map(course => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CoursesPage />);