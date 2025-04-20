import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import LogoutModal from "./LogoutModal";
import IconComponent from "../common/IconComponent";
import { COLORS } from "../../styles/constants";
import "../../styles/Sidebar.css";

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("Candidates");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Routes are defined directly in the menuItems

  // Logout handlers
  const openLogoutModal = (e) => {
    e.preventDefault(); // Prevent navigation
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  // Define menu structure to match the image
  const menuItems = [
    {
      section: "Recruitment",
      items: [{ name: "Candidates", icon: <IconComponent name="users" size={18} color={activeItem === "Candidates" ? COLORS.VIOLET : COLORS.BLACK} />, route: "/candidates" }]
    },
    {
      section: "Organization",
      items: [
        { name: "Employees", icon: <IconComponent name="user" size={18} color={activeItem === "Employees" ? COLORS.VIOLET : COLORS.BLACK} />, route: "/employees" },
        { name: "Attendance", icon: <IconComponent name="calendar" size={18} color={activeItem === "Attendance" ? COLORS.VIOLET : COLORS.BLACK} />, route: "/attendance" },
        { name: "Leaves", icon: <IconComponent name="document" size={18} color={activeItem === "Leaves" ? COLORS.VIOLET : COLORS.BLACK} />, route: "/leaves" }
      ]
    },
    {
      section: "Others",
      items: [{ name: "Logout", icon: <IconComponent name="arrowRight" size={18} color={activeItem === "Logout" ? COLORS.VIOLET : COLORS.BLACK} />, route: "#", onClick: openLogoutModal }]
    }
  ];

  return (
    <div className="sidebar">
      {/* Logo with Text */}
      <div className="logo-container">
        <img src="/img/Logo.jpeg" alt="Logo" className="logo-img" />
        <div className="logo-text">
          <span className="company-name">PSQUARE</span>
          <span className="company-tagline">COMPANY</span>
        </div>
      </div>

      {/* Search */}
      <div className="search-container">
        <div className="search-icon-sidebar">
          <IconComponent name="search" size={16} color={COLORS.DARK_GREY} />
        </div>
        <input
          type="text"
          placeholder="Search"
          className="search-input-sidebar"
        />
      </div>

      {/* Menu Items */}
      <div className="menu-container">
        {menuItems.map((section) => (
          <div key={section.section} className="menu-section">
            <div className="section-title">{section.section}</div>
            {section.items.map((item) => (
              <Link
                to={item.route}
                key={item.name}
                className="menu-item-link"
                onClick={(e) => {
                  setActiveItem(item.name);
                  if (item.onClick) {
                    item.onClick(e);
                  }
                }}
              >
                <div
                  className={`menu-item ${activeItem === item.name ? "active" : ""}`}
                >
                  <div className="item-icon">{item.icon}</div>
                  <div className="item-text">{item.name}</div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onLogout={handleLogout}
      />
    </div>
  );
}