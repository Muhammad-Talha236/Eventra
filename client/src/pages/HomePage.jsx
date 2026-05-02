function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-700">🎓 Eventra</h1>
        <p className="text-gray-500 mt-2">University Event Management Platform</p>
        <a href="/login" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
          Login
        </a>
      </div>
    </div>
  );
}
export default HomePage;