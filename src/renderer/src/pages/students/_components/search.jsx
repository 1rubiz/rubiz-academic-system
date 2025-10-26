import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { debounce } from "lodash"; // or create your own small debounce fn

const StudentSearch = ({ departmentId, onResults, fetchAll }) => {
  const [query, setQuery] = useState("");

  // Debounced search
  const debouncedSearch = debounce(async (value) => {
    if (!value.trim()) {
      onResults([]); // clear results when input is empty
      return;
    }

    const results = await window.api.students.searchStudents({
      departmentId,
      query: value,
    });

    onResults(results);
  }, 400);

  // Watch for input change
  useEffect(() => {
    if(query){
        debouncedSearch(query);
        return debouncedSearch.cancel;
    }else{
        fetchAll()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="mb-6">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search students by name or matric number..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default StudentSearch;
