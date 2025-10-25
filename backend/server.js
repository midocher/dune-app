import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// --- Configuration ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// --- Middlewares ---
// Important : Nous configurerons CORS plus tard
// Autorise seulement votre frontend (défini dans les variables d'environnement de Render)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
};
app.use(cors(corsOptions));
app.use(express.json()); // pour parser le JSON

// --- Routes de l'API (Exemples) ---

// Route de test
app.get('/api/v1', (req, res) => {
  res.json({ message: "Bienvenue sur l'API DUNE !" });
});

// Récupérer tous les projets (simulé)
app.get('/api/v1/projects', (req, res) => {
  // TODO: Remplacer par un appel à la base de données PostgreSQL
  // Ici, on simule une vérification de token
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: "Accès non autorisé" });
  }

  console.log("Token reçu:", authHeader.split(' ')[1]);

  // Données simulées (MOCK_DATA)
  const MOCK_PROJECTS = [
    { id: 1, nom: "PROJET PILOTE DUNE", abreviation: "DUNE", wilaya: "Alger", statut: "en étude" },
    { id: 2, nom: "TOUR CÔTIÈRE ORAN", abreviation: "TCO", wilaya: "Oran", statut: "en exécution" },
  ];

  res.status(200).json(MOCK_PROJECTS);
});

// Connexion (simulée)
app.post('/api/v1/auth/login', (req, res) => {
  const { username, password } = req.body;

  // TODO: Remplacer par une vraie vérification en BDD
  if (username === "gerant" && password === "Dune2025!") {
    // Générer un faux token JWT
    const token = "FAUX_TOKEN_JWT_POUR_LE_TEST_" + Math.random(); 
    res.status(200).json({ 
      message: "Connexion réussie", 
      token: token, 
      user: { username: "gerant", role: "Gérant principal" } 
    });
  } else {
    res.status(401).json({ error: "Identifiant ou mot de passe incorrect" });
  }
});

// --- Lancement du serveur ---
app.listen(PORT, () => {
  console.log(`Serveur DUNE démarré sur le port ${PORT}`);
});