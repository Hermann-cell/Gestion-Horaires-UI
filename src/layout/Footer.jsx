export default function Footer() {
  return (
    <footer className="dashboard-footer">
      <div className="footer-content">
        © {new Date().getFullYear()} Gestion des Horaires — Tous droits réservés
      </div>
    </footer>
  );
}