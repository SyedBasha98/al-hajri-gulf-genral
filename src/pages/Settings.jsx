import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const nav = useNavigate();
  return (
    <button
      onClick={() => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userRole");
        nav("/login", { replace: true }); // ✅ Redirect to Login page
      }}
    >
      Logout
    </button>
  );
}

export default LogoutButton;
