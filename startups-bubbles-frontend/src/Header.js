
import { Link } from "react-router-dom";
import logo from "./data/logo2.png"; // ajusta la ruta según tu estructura

// Encima del return, puedes crear un componente Header:
function Header() {
  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 30px",
      backgroundColor: "#1f1d1dff",
      borderBottom: "1px solid #333",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      {/* Logo / Nombre */}
      <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <span style={{ color: "white", fontSize: "22px", fontWeight: "bold" }}>Startup Bubbles</span>
      </Link>

      {/* Menú */}
      <nav>
        <ul style={{
          display: "flex",
          gap: "25px",
          listStyle: "none",
          margin: 0,
          padding: 0
        }}>
          <li><Link to="/about" style={{ color: "white", textDecoration: "none" }}>About us</Link></li>
          <li><Link to="/faq" style={{ color: "white", textDecoration: "none" }}>FAQ</Link></li>
          <li><Link to="/contact" style={{ color: "white", textDecoration: "none" }}>Contact</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;