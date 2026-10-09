import Sidebar from "./Sidebar";
import Header from "./Header";
import "./Layout.css";

function Layout({
  user,
  page,
  setPage,
  children,
}) {
  return (
    <div className="layout">
      {/* Pasamos 'user' como 'currentUser' al Sidebar */}
      <Sidebar
        page={page}
        setPage={setPage}
        currentUser={user}
      />

      <div className="content">
        <Header user={user} />

        <div className="page">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;