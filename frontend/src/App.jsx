import React, { useState, useEffect, useMemo } from 'react';
// Imports de React Router ( useParams ajouté )
import { Routes, Route, Link, useNavigate, Outlet, Navigate, useLocation, useParams } from 'react-router-dom';

// Import des graphiques
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
// Import des icônes
import { 
  LayoutDashboard, FolderKanban, FileText, Settings, Users, Building, MapPin, 
  ChevronDown, ChevronRight, Sun, Moon, LogOut, CheckCircle, XCircle, Clock, 
  FileDiff, Plus, Trash2, Edit2, Search, Filter, Home, Layers, Copy, Download,
  Package, Wrench, UserCog, AlertCircle, X, Save, PlusCircle, Trash, Eye, 
  ArrowRight, ShieldCheck, ExternalLink // NOUVELLE ICÔNE
} from 'lucide-react';

// --- Données de Simulation (à remplacer par votre API) ---

// Données fictives pour les Wilayas, Daïras, Communes (Algérie)
const algeriaLocations = {
  "16 - Alger": {
    "Alger Centre": ["Alger Centre", "Sidi M'Hamed"],
    "Bab El Oued": ["Bab El Oued", "Oued Koriche", "Bologhine", "Raïs Hamidou", "Casbah"],
    "Hussein Dey": ["Hussein Dey", "Kouba", "Mohamed Belouizdad", "El Magharia"],
  },
  "31 - Oran": {
    "Oran": ["Oran"],
    "Es Senia": ["Es Senia", "Sidi Chami", "El Kerma"],
    "Arzew": ["Arzew", "Sidi Ben Yebka"],
  },
  "25 - Constantine": {
    "Constantine": ["Constantine"],
    "El Khroub": ["El Khroub", "Ouled Rahmoune", "Aïn Smara"],
  }
};

const mockUsers = [
  { id: 'u1', username: 'gérant.principal', role: 'Gérant principal', password: 'admin' }, // Mot de passe simulé
  { id: 'u2', username: 'admin.secondaire', role: 'Administrateur secondaire', password: 'admin' },
  { id: 'u3', username: 'ing.suivi', role: 'Ingénieur de suivi', password: 'user' },
  { id: 'u4', username: 'visiteur.temp', role: 'Visiteur', password: 'guest' },
];

const mockProjects = [
  { id: 'p1', nom: "Projet Pilote DUNE", abreviation: "DUNE", wilaya: "16 - Alger", daira: "Alger Centre", commune: "Alger Centre", adresse: "15 Rue Didouche Mourad", lien_maps: "https://maps.google.com/...", id_responsable: 'u3', statut: "en étude", date_creation: "2024-10-01", acces_visiteur: true },
  { id: 'p2', nom: "Complexe Hôtelier Oran", abreviation: "CHO", wilaya: "31 - Oran", daira: "Oran", commune: "Oran", adresse: "Front de Mer", lien_maps: "", id_responsable: 'u3', statut: "en exécution", date_creation: "2024-05-15", acces_visiteur: false },
  { id: 'p3', nom: "Tour de bureaux 'Le Phare'", abreviation: "PHARE", wilaya: "16 - Alger", daira: "Bab El Oued", commune: "Bab El Oued", adresse: "Place des Martyrs", lien_maps: "", id_responsable: 'u2', statut: "achevé", date_creation: "2023-01-10", acces_visiteur: false },
];

const mockLotsInit = [ 
  { id: 'l1', id_projet: 'p1', nom: 'Architecture', abreviation: 'ARCH', ctc_approbation: true, sousLots: [{ id: 'sl1', nom: 'Plans de masse', abreviation: 'PM' }] },
  { id: 'l2', id_projet: 'p1', nom: 'Génie Civil', abreviation: 'GCIV', ctc_approbation: true, sousLots: [] },
  { id: 'l3', id_projet: 'p1', nom: 'Électricité', abreviation: 'ELEC', ctc_approbation: false, sousLots: [{ id: 'sl2', nom: 'Courants Forts', abreviation: 'CF' }, { id: 'sl3', nom: 'Courants Faibles', abreviation: 'Cf' }] },
  { id: 'l4', id_projet: 'p2', nom: 'Architecture', abreviation: 'ARCH', ctc_approbation: true, sousLots: [] },
];

const mockBlocksInit = [ 
  { id: 'b1', id_projet: 'p1', nom: 'Administration', abreviation: 'ADM' },
  { id: 'b2', id_projet: 'p1', nom: 'Hébergement', abreviation: 'HEB' },
  { id: 'b3', id_projet: 'p2', nom: 'Restaurant', abreviation: 'REST' },
];

const mockPlansInit = [ 
  { id: 'pl1', id_projet: 'p1', id_bloc: 'b1', id_lot: 'l1', id_souslot: 'sl1', reference: "DUNE-ADM-ARCH-001-R00", titre: "Plan de masse général", statut: "Approuvé CTC", numero: 1, revision: 0, date_creation: "2024-10-05", id_createur: 'u3', fichier_pdf: "sim-plan-a.pdf", historique: [{ version: 'R00', date: '2024-10-05', utilisateur: 'ing.suivi', commentaire: 'Version initiale pour approbation' }] },
  { id: 'pl2', id_projet: 'p1', id_bloc: 'b1', id_lot: 'l2', id_souslot: null, reference: "DUNE-ADM-GCIV-002-R01", titre: "Plans de fondation", statut: "En cours d'approbation", numero: 2, revision: 1, date_creation: "2024-10-10", id_createur: 'u2', fichier_pdf: "sim-plan-b.pdf", historique: [{ version: 'R00', date: '2024-10-08', utilisateur: 'admin.secondaire', commentaire: 'Première émission' }, { version: 'R01', date: '2024-10-10', utilisateur: 'admin.secondaire', commentaire: 'Mise à jour suite réunion' }] },
  { id: 'pl3', id_projet: 'p2', id_bloc: 'b3', id_lot: 'l4', id_souslot: null, reference: "CHO-REST-ARCH-001-R00", titre: "Plan de cuisine", statut: "Déposé au MO", numero: 1, revision: 0, date_creation: "2024-06-01", id_createur: 'u3', fichier_pdf: "sim-plan-c.pdf", historique: [{ version: 'R00', date: '2024-06-01', utilisateur: 'ing.suivi', commentaire: 'Version finale' }] },
];
// --- Fin des Données de Simulation ---


// Hook pour le mode sombre
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      root.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  return [isDarkMode, setIsDarkMode];
};

// Fonction pour charger l'état initial depuis le localStorage
const loadInitialState = (key, defaultValue) => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Erreur lors du chargement de ${key} depuis localStorage`, error);
    return defaultValue;
  }
};

// Hook pour synchroniser l'état avec le localStorage
const useLocalStorageState = (key, defaultValue) => {
  const [state, setState] = useState(() => loadInitialState(key, defaultValue));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
};

// --- Composant Racine ---
export default function App() {
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  
  // États Globaux
  const [currentUser, setCurrentUser] = useLocalStorageState('dune-user', null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!loadInitialState('dune-user', null));
  const [userProjects, setUserProjects] = useLocalStorageState('dune-userProjects', []); // Projets accessibles par l'utilisateur
  const [selectedProjectId, setSelectedProjectId] = useLocalStorageState('dune-selectedProjectId', null); // Projet actuellement actif
  
  // Listes de données maîtresses (simulant la BDD) - utilisent useState simple car non persistées entre sessions
  const [allProjects, setAllProjects] = useState(mockProjects);
  const [allBlocks, setAllBlocks] = useState(mockBlocksInit);
  const [allLots, setAllLots] = useState(mockLotsInit);
  const [allPlans, setAllPlans] = useState(mockPlansInit);
  const [allUsers, setAllUsers] = useState(mockUsers);
  
  const navigate = useNavigate();

  // Mémorisation du projet sélectionné (basé sur les projets *accessibles*)
  const selectedProject = useMemo(() => {
    // CORRECTION: Utiliser allProjects pour trouver les détails du projet sélectionné
    return allProjects.find(p => p.id === selectedProjectId); 
  }, [allProjects, selectedProjectId]);
  
  // Logique de login
  const handleLogin = (username, password) => {
    const user = allUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      setCurrentUser(user); 
      setIsAuthenticated(true);

      let filteredProjects = [];
      if (user.role === 'Gérant principal' || user.role === 'Administrateur secondaire') {
        filteredProjects = allProjects; 
      } else if (user.role === 'Ingénieur de suivi' || user.role === 'Visiteur') {
        filteredProjects = allProjects.filter(p => p.id_responsable === user.id || p.acces_visiteur === true); 
      }
      
      setUserProjects(filteredProjects);
      setSelectedProjectId(null); // Force la sélection
      
      navigate('/select-project'); // Rediriger vers la sélection de projet
    } else {
      console.error("Identifiants incorrects");
    }
  };

  // Déconnexion
  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUserProjects([]); 
    setSelectedProjectId(null);
    
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('dune-user');
      window.localStorage.removeItem('dune-userProjects');
      window.localStorage.removeItem('dune-selectedProjectId');
    }
    navigate('/login'); 
  };
  
  // Fonction pour activer un projet
  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    navigate(`/project/${projectId}/dashboard`); // Navigue vers le dashboard du projet
  };

  return (
    <div className={`h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans`}>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginScreen onLogin={handleLogin} isDarkMode={isDarkMode} /> : <Navigate to="/select-project" replace />}
        />
        
        <Route 
          path="/select-project"
          element={
            isAuthenticated ? (
              <ProjectSelectionPage 
                userProjects={userProjects} 
                onSelectProject={handleSelectProject} 
                handleLogout={handleLogout}
                currentUser={currentUser}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/project/:projectId/*" 
          element={
            isAuthenticated && selectedProjectId ? ( 
              <MainLayout
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                currentUser={currentUser}
                handleLogout={handleLogout}
                userProjects={userProjects} 
                selectedProjectId={selectedProjectId}
                setSelectedProjectId={setSelectedProjectId}
                // Données CUD + selectedProject détaillé
                appData={{
                  allProjects, setAllProjects,
                  allBlocks, setAllBlocks,
                  allLots, setAllLots,
                  allPlans, setAllPlans,
                  allUsers, setAllUsers,
                  selectedProject, // Le projet actuellement sélectionné AVEC TOUS LES DETAILS
                  userProjects, 
                  isDarkMode,
                  currentUser
                }}
              />
            ) : isAuthenticated ? ( 
               <Navigate to="/select-project" replace />
            ) : ( 
              <Navigate to="/login" replace /> 
            )
          }
        />
        
        <Route path="*" element={<Navigate to={isAuthenticated ? "/select-project" : "/login"} replace />} />

      </Routes>
    </div>
  );
}

// --- Page de Sélection de Projet ---
const ProjectSelectionPage = ({ userProjects, onSelectProject, handleLogout, currentUser, isDarkMode, setIsDarkMode }) => {
  return (
    <div className="flex flex-col h-screen">
      {/* Header simplifié */}
      <header className="h-20 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
         <div className="flex items-center">
            <Building className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <span className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-100">DUNE - Sélection</span>
         </div>
         <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
             <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {currentUser?.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.role}</p>
              </div>
            </div>
             <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-2" />
              <span>Déconnexion</span>
            </button>
         </div>
      </header>
      {/* Contenu */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Choisissez un projet à ouvrir</h1>
        {userProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userProjects.map(project => (
              <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{project.nom}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{project.abreviation}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{project.commune}, {project.wilaya}</p>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    project.statut === 'en étude' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    project.statut === 'en exécution' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    project.statut === 'achevé' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {project.statut}
                  </span>
                </div>
                <button 
                  onClick={() => onSelectProject(project.id)}
                  className="mt-6 w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                  Ouvrir <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">Aucun projet ne vous est actuellement assigné.</p>
        )}
      </main>
    </div>
  );
};

// --- Composant Layout Principal ---
const MainLayout = ({ 
  isDarkMode, setIsDarkMode, currentUser, handleLogout, 
  userProjects, selectedProjectId, setSelectedProjectId,
  appData // Contient maintenant selectedProject détaillé
}) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Vérifier si le projectId de l'URL est valide et correspond à l'état
  useEffect(() => {
    // Si l'URL a un ID de projet
    if (projectId) {
      // Vérifier si ce projet est accessible à l'utilisateur
      if (!userProjects.some(p => p.id === projectId)) {
        // ID invalide -> retour à la sélection
        setSelectedProjectId(null); 
        navigate('/select-project', { replace: true });
      } else if (projectId !== selectedProjectId) {
        // ID valide mais différent de l'état -> synchroniser l'état
        setSelectedProjectId(projectId);
      }
    } 
    // Si l'URL n'a PAS d'ID de projet (ex: /users)
    else {
      // Vérifier si un projet était sélectionné (ex: via dropdown "-- Aucun --")
      if (selectedProjectId) {
         // L'utilisateur a explicitement désélectionné -> retour à la sélection
         setSelectedProjectId(null); // Assurer la désélection dans l'état
         navigate('/select-project', { replace: true });
      }
      // Si ni URL ni état n'ont d'ID, on est probablement sur /users ou /settings, c'est ok.
    }
  }, [projectId, userProjects, navigate, selectedProjectId, setSelectedProjectId]);

  // Si l'URL demande un projet mais qu'il n'est pas encore chargé/validé
  // Ou si on est sur une route projet mais selectedProjectId est null (vient d'être désélectionné)
  if (projectId && (!selectedProjectId || selectedProjectId !== projectId)) {
    return <div className="flex items-center justify-center h-screen">Chargement du projet...</div>; 
  }
  
  // Cas spécifique pour les routes admin (/users, /settings) qui n'ont pas de projectId
  const isAdminRoute = location.pathname === '/users' || location.pathname === '/settings';
  if (!projectId && !isAdminRoute && currentUser) {
      // Si on n'est pas sur une route admin et qu'aucun projet n'est sélectionné, retourner à la sélection
      return <Navigate to="/select-project" replace />;
  }


  // Injecter projectId dans les données passées aux pages SI projectId existe
  const pageProps = projectId ? { ...appData, selectedProjectId: projectId } : appData;

  return (
    <>
      <Sidebar 
        handleLogout={handleLogout}
        currentUser={currentUser}
        projectId={projectId} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          currentUser={currentUser}
          userProjects={userProjects} 
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* MODIFIÉ: Structure de routage pour gérer les routes projet ET admin */}
          <Routes>
             {/* Routes spécifiques au projet */}
             <Route path="dashboard" element={<DashboardPage {...pageProps} />} />
             <Route path="plans" element={<PlansPage {...pageProps} />} />
             <Route path="blocks" element={<BlocksPage {...pageProps} />} />
             <Route path="lots" element={<LotsPage {...pageProps} />} />
             <Route path="revisions" element={<RevisionsPage {...pageProps} />} />
             
             {/* Redirection par défaut DANS un projet */}
             <Route index element={<Navigate to="dashboard" replace />} />
             <Route path="*" element={<Navigate to="dashboard" replace />} /> 
          </Routes>
        </main>
      </div>
    </>
  );
};

// NOUVELLE ROUTE HORS LAYOUT PROJET POUR ADMIN
const AdminLayout = ({ currentUser, handleLogout, appData }) => {
   const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';
   
   if (!isAdmin) {
      return <Navigate to="/select-project" replace />;
   }

   return (
      <>
         <Sidebar 
           handleLogout={handleLogout}
           currentUser={currentUser}
           projectId={null} // Pas de projet actif pour l'admin
         />
         <div className="flex-1 flex flex-col overflow-hidden">
           {/* Header simplifié pour admin ? Ou garder le même ? Pour l'instant on garde */}
           {/* Note: Le dropdown projet sera vide ou désactivé ici */}
            <Header 
              isDarkMode={appData.isDarkMode} 
              setIsDarkMode={appData.setIsDarkMode} 
              currentUser={currentUser}
              userProjects={[]} // Pas de projet actif
              selectedProjectId={null}
              setSelectedProjectId={() => {}} // Fonction vide
            />
           <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
             <Routes>
                <Route path="users" element={<UsersPage {...appData} />} />
                <Route path="settings" element={<PlaceholderPage title="Paramètres" icon={Wrench} />} />
                 {/* Redirection par défaut pour /admin/* */}
                <Route index element={<Navigate to="users" replace />} />
                <Route path="*" element={<Navigate to="users" replace />} /> 
             </Routes>
           </main>
         </div>
      </>
   );
};

/* --- Le reste des composants (LoginScreen, Sidebar, Header, Pages, Modals, Forms) --- */
/* ---             RESTE IDENTIQUE À LA VERSION PRÉCÉDENTE                      --- */
/* ---             SAUF pour DashboardPage qui est mise à jour                    --- */


// --- Composants de l'interface ---

// Écran de connexion
// ... (Identique)
const LoginScreen = ({ onLogin, isDarkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className={`flex items-center justify-center min-h-screen w-full ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900`}>
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
        <div className="flex flex-col items-center">
          <Building className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          <h1 className="mt-4 text-3xl font-bold text-center text-gray-900 dark:text-gray-100">DUNE</h1>
          <p className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400">Gestion des Projets et Plans Techniques</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Identifiant"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Barre latérale
// ... (Identique à la version précédente)
const Sidebar = ({ handleLogout, currentUser, projectId }) => { // MODIFIÉ: reçoit projectId
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';
  const location = useLocation(); 

  // NOUVEAU: Fonction pour créer l'URL du projet
  const projectUrl = (path) => `/project/${projectId}/${path}`;

  const NavItem = ({ icon, label, to, disabled = false }) => {
    // Vérifie si le chemin actuel commence par 'to' (pour gérer les sous-routes)
    const isActive = location.pathname.startsWith(to); 
    const isDisabled = disabled && !projectId; // Désactivé si pas de projetId

    return (
      <Link
        to={isDisabled ? "#" : to} 
        className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
          isActive && !isDisabled
            ? 'bg-blue-600 text-white'
            : isDisabled
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        {React.createElement(icon, { className: "w-5 h-5 mr-3" })}
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col flex-shrink-0">
      <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
        <Building className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        <span className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-100">DUNE</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {/* MODIFIÉ: Ce lien retourne à la sélection */}
        <NavItem icon={FolderKanban} label="Changer Projet" to="/select-project" /> 
        <NavItem icon={LayoutDashboard} label="Tableau de bord" to={projectUrl('dashboard')} disabled={true} />
        
        {/* Section spécifique au projet */}
        <div className="pt-4 mt-4 border-t dark:border-gray-700">
          <h3 className={`px-4 mb-2 text-xs font-semibold tracking-wider ${projectId ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'} uppercase`}>
            Gestion du projet {projectId ? '' : '(Sélectionnez un projet)'}
          </h3>
          
          {isAdmin && (
            <>
              {/* MODIFIÉ: Liens utilisent projectUrl */}
              <NavItem icon={Package} label="Blocs" to={projectUrl('blocks')} disabled={true} />
              <NavItem icon={Layers} label="Lots & Sous-Lots" to={projectUrl('lots')} disabled={true} />
            </>
          )}
          
          <NavItem icon={FileText} label="Plans" to={projectUrl('plans')} disabled={true} />
          <NavItem icon={FileDiff} label="Révisions" to={projectUrl('revisions')} disabled={true} />
        </div>

        {/* Section Admin */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t dark:border-gray-700">
            <h3 className="px-4 mb-2 text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Administration</h3>
            {/* MODIFIÉ: Liens directs car non liés à un projet */}
            <NavItem icon={UserCog} label="Utilisateurs" to="/users" /> 
            <NavItem icon={Wrench} label="Paramètres" to="/settings" />
          </div>
        )}
      </nav>
      <div className="px-4 py-4 border-t dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

// En-tête
// ... (Identique à la version précédente)
const Header = ({ isDarkMode, setIsDarkMode, currentUser, userProjects, selectedProjectId, setSelectedProjectId }) => {
  const navigate = useNavigate();

  // NOUVEAU: Gérer le changement de projet via le dropdown
  const handleProjectSwitch = (e) => {
    const newProjectId = e.target.value;
    setSelectedProjectId(newProjectId || null);
    if (newProjectId) {
      navigate(`/project/${newProjectId}/dashboard`); // Navigue vers le nouveau projet
    } else {
      navigate('/select-project'); // Retourne à la sélection si "-- Aucun --"
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
      {/* Sélecteur de projet */}
      <div className="flex items-center">
        {userProjects.length > 0 ? (
          <>
            <label htmlFor="project-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Projet Actif :</label>
            <select
              id="project-select"
              value={selectedProjectId || ''} 
              onChange={handleProjectSwitch} // Utilise la nouvelle fonction
              className="w-64 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- Aucun (Retour à la liste) --</option>
              {userProjects.map(p => (
                <option key={p.id} value={p.id}>{p.nom} ({p.abreviation})</option>
              ))}
            </select>
          </>
        ) : (
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Aucun projet assigné</span>
        )}
      </div>

      {/* Icônes et Profil */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {currentUser?.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser?.username}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

// Composant Placeholder
// ... (Identique)
const PlaceholderPage = ({ title, icon }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
    {React.createElement(icon, { className: "w-16 h-16 mb-4" })}
    <h1 className="text-2xl font-bold mb-2">{title}</h1>
    <p>Cette page est en cours de construction.</p>
  </div>
);


// --- Composants de Page ---

// MODIFIÉ: Tableau de bord (prend les données du projet)
const DashboardPage = ({ isDarkMode, selectedProject, allPlans, allUsers, allBlocks, allLots }) => {
  const { projectId } = useParams();

  // Filtrer les données pour le projet courant
  const projectPlans = useMemo(() => allPlans.filter(p => p.id_projet === projectId), [allPlans, projectId]);
  const projectBlocksCount = useMemo(() => allBlocks.filter(b => b.id_projet === projectId).length, [allBlocks, projectId]);
  const projectLotsCount = useMemo(() => allLots.filter(l => l.id_projet === projectId).length, [allLots, projectId]);
  const projectRevisionsCount = useMemo(() => projectPlans.reduce((sum, plan) => sum + plan.historique.length, 0), [projectPlans]);

  // Préparer les données pour les graphiques (spécifiques au projet)
  const pieData = useMemo(() => {
    const statuses = projectPlans.reduce((acc, plan) => {
      acc[plan.statut] = (acc[plan.statut] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: 'Approuvés CTC', value: statuses['Approuvé CTC'] || 0, color: '#10B981' },
      { name: 'En cours', value: statuses["En cours d'approbation"] || 0, color: '#F59E0B' }, // Jaune pour en cours
      { name: 'Déposés MO', value: statuses['Déposé au MO'] || 0, color: '#3B82F6' }, // Bleu pour déposé
      { name: 'Obsolètes', value: statuses['Obsolète'] || 0, color: '#EF4444' },
    ];
  }, [projectPlans]);

  // StatCard reste générique pour l'instant, mais utilise les données filtrées
  const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className={`p-3 rounded-full ${colorClass} text-white`}>
        {React.createElement(icon, { className: "w-6 h-6" })}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tableau de bord : {selectedProject?.nom || ''}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Plans du Projet" value={projectPlans.length} icon={FileText} colorClass="bg-green-500" />
        <StatCard title="Blocs" value={projectBlocksCount} icon={Package} colorClass="bg-blue-500" />
        <StatCard title="Lots" value={projectLotsCount} icon={Layers} colorClass="bg-indigo-500" />
        <StatCard title="Révisions Totales" value={projectRevisionsCount} icon={FileDiff} colorClass="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Statut des Plans (Projet)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
           <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Activité Récente (Prochainement)</h3>
           <div className="flex items-center justify-center h-[300px] text-gray-400">
              Graphique d'activité à venir...
           </div>
        </div>
      </div>
    </div>
  );
};


// Page Projets (avec CUD)
// ... (Identique)
const ProjectsPage = ({ currentUser, userProjects, allProjects, setAllProjects, allUsers, setSelectedProjectId }) => {
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';
  const navigate = useNavigate();

  // Les admins voient tout, les autres ne voient que leurs projets filtrés
  const projectsToDisplay = isAdmin ? allProjects : userProjects;
  
  const getStatusColor = (statut) => {
    switch (statut) {
      case 'en étude': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'en exécution': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'achevé': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'suspendu': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const openModalToEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const openModalToCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleSave = (projectData) => {
    if (editingProject) {
      // Modification
      setAllProjects(allProjects.map(p => p.id === editingProject.id ? { ...p, ...projectData } : p));
    } else {
      // Création
      const newProject = {
        ...projectData,
        id: 'p' + Date.now(), // ID unique simple
        date_creation: new Date().toISOString().split('T')[0], // Date du jour
      };
      setAllProjects([...allProjects, newProject]);
    }
    closeModal();
    // TODO: Mettre à jour la liste `userProjects` si un ingénieur se crée un projet
  };

  const handleDelete = (projectId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
      setAllProjects(allProjects.filter(p => p.id !== projectId));
      // TODO: Supprimer aussi les blocs, lots, plans associés
    }
  };
  
  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    navigate(`/project/${projectId}/dashboard`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Sélection des Projets</h1>
        {isAdmin && (
          <button 
            onClick={openModalToCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Projet
          </button>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex space-x-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Rechercher un projet..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-3 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          <option value="en étude">En étude</option>
          <option value="en exécution">En exécution</option>
          <option value="achevé">Achevé</option>
          <option value="suspendu">Suspendu</option>
        </select>
        {isAdmin && (
          <button 
            onClick={() => alert("L'exportation sera ajoutée prochainement.")}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Download className="w-5 h-5 mr-2" />
            Exporter (PDF/Excel)
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom du Projet</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Localisation</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Responsable</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projectsToDisplay.filter(p => filter ? p.statut === filter : true).map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{project.nom}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{project.abreviation}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div>{project.commune}, {project.wilaya}</div>
                  <div className_="text-xs text-gray-400">{project.adresse}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {allUsers.find(u => u.id === project.id_responsable)?.username || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.statut)}`}>
                    {project.statut}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button 
                    onClick={() => handleSelectProject(project.id)}
                    title="Ouvrir le projet"
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
                  >
                    <Home className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => openModalToEdit(project)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingProject ? "Modifier le Projet" : "Créer un Nouveau Projet"}
      >
        <ProjectForm 
          project={editingProject} 
          onSave={handleSave} 
          onCancel={closeModal}
          allUsers={allUsers}
          currentUser={currentUser}
        />
      </Modal>
    </div>
  );
};

// Formulaire Projet
// ... (Identique)
const ProjectForm = ({ project, onSave, onCancel, allUsers, currentUser }) => {
  const [nom, setNom] = useState(project ? project.nom : '');
  const [abreviation, setAbreviation] = useState(project ? project.abreviation : '');
  const [wilaya, setWilaya] = useState(project ? project.wilaya : '');
  const [daira, setDaira] = useState(project ? project.daira : '');
  const [commune, setCommune] = useState(project ? project.commune : '');
  const [adresse, setAdresse] = useState(project ? project.adresse : '');
  const [statut, setStatut] = useState(project ? project.statut : 'en étude');
  const [idResponsable, setIdResponsable] = useState(project ? project.id_responsable : currentUser.id); // Par défaut, l'ingénieur qui crée
  
  const [dairas, setDairas] = useState([]);
  const [communes, setCommunes] = useState([]);
  
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';
  const ingenieurs = allUsers.filter(u => u.role.includes('Ingénieur') || u.role.includes('Admin')); // Simplifié

  useEffect(() => {
    if (wilaya && algeriaLocations[wilaya]) {
      setDairas(Object.keys(algeriaLocations[wilaya]));
    } else {
      setDairas([]);
    }
    setDaira('');
    setCommune('');
  }, [wilaya]);

  useEffect(() => {
    if (wilaya && daira && algeriaLocations[wilaya] && algeriaLocations[wilaya][daira]) {
      setCommunes(algeriaLocations[wilaya][daira]);
    } else {
      setCommunes([]);
    }
    setCommune('');
  }, [wilaya, daira]);
  
  // Pré-remplir les listes si on édite
  useEffect(() => {
    if (project) {
      if (project.wilaya && algeriaLocations[project.wilaya]) {
        setDairas(Object.keys(algeriaLocations[project.wilaya]));
      }
      if (project.wilaya && project.daira && algeriaLocations[project.wilaya] && algeriaLocations[project.wilaya][project.daira]) {
        setCommunes(algeriaLocations[project.wilaya][project.daira]);
      }
    }
  }, [project]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...project,
      nom,
      abreviation: abreviation.toUpperCase(),
      wilaya, daira, commune, adresse, statut, id_responsable: idResponsable
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du Projet</label>
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Abréviation (auto-majuscule)</label>
          <input type="text" value={abreviation} onChange={(e) => setAbreviation(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adresse ou description du site</label>
        <input type="text" value={adresse} onChange={(e) => setAdresse(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wilaya</label>
          <select value={wilaya} onChange={(e) => setWilaya(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700">
            <option value="">-- Sélectionner --</option>
            {Object.keys(algeriaLocations).map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Daïra</label>
          <select value={daira} onChange={(e) => setDaira(e.target.value)} required disabled={dairas.length === 0}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
            <option value="">-- Sélectionner --</option>
            {dairas.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Commune</label>
          <select value={commune} onChange={(e) => setCommune(e.target.value)} required disabled={communes.length === 0}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
            <option value="">-- Sélectionner --</option>
            {communes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
          <select value={statut} onChange={(e) => setStatut(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700">
            <option value="en étude">En étude</option>
            <option value="en exécution">En exécution</option>
            <option value="achevé">Achevé</option>
            <option value="suspendu">Suspendu</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Responsable du Projet</label>
          <select value={idResponsable} onChange={(e) => setIdResponsable(e.target.value)} required disabled={!isAdmin}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
            {ingenieurs.map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          Annuler
        </button>
        <button type="submit"
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </button>
      </div>
    </form>
  );
};


// Page Plans
// ... (Identique, sauf vérification projectId)
const PlansPage = ({ selectedProject, plans, setPlans, blocks, lots, currentUser }) => { 
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';
  const { projectId } = useParams(); // Récupérer l'ID depuis l'URL

  // Vérifier si un projet est sélectionné (via l'URL maintenant)
  if (!projectId || !selectedProject || selectedProject.id !== projectId) {
     return <Navigate to="/select-project" replace />; // Rediriger si incohérent
  }
  
  const projectPlans = plans.filter(p => p.id_projet === projectId);

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'Approuvé CTC': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "En cours d'approbation": return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Déposé au MO': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'Obsolète': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Plans pour : {selectedProject.nom}</h1>
        {isAdmin && (
          <button 
            onClick={() => alert("La création de plan sera ajoutée prochainement.")}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Plan
          </button>
        )}
      </div>

      {/* Barre de filtre (simplifiée) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex space-x-4">
        <input 
          type="text" 
          placeholder="Filtrer par référence, titre, lot..."
          className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tableau des plans */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Référence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Infos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dernière MàJ</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projectPlans.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(plan.statut)}
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{plan.statut}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{plan.reference}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">{plan.fichier_pdf}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{plan.titre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div><span className="font-semibold">Bloc:</span> {blocks.find(b => b.id === plan.id_bloc)?.abreviation || 'N/A'}</div>
                  <div><span className="font-semibold">Lot:</span> {lots.find(l => l.id === plan.id_lot)?.abreviation || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div>{plan.historique[plan.historique.length - 1].date}</div>
                  <div className="text-xs text-gray-400">par {plan.historique[plan.historique.length - 1].utilisateur}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  {isAdmin && (
                    <button 
                      onClick={() => alert("La gestion des révisions sera ajoutée prochainement.")}
                      title="Gérer les révisions" 
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      <FileDiff className="w-5 h-5" />
                    </button>
                  )}
                  {!isAdmin && (
                    <button 
                      onClick={() => alert("Affichage de l'historique des révisions...")}
                      title="Voir les révisions" 
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => navigator.clipboard.writeText(plan.reference)}
                    title="Copier la référence" 
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Modal Générique
// ... (Identique)
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg m-4">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Formulaire Blocs
// ... (Identique)
const BlockForm = ({ block, onSave, onCancel }) => {
  const [nom, setNom] = useState(block ? block.nom : '');
  const [abreviation, setAbreviation] = useState(block ? block.abreviation : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...block, // Garde l'id et id_projet si en modification
      nom,
      abreviation: abreviation.toUpperCase(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="block-nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du Bloc</label>
        <input
          type="text"
          id="block-nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
        />
      </div>
      <div>
        <label htmlFor="block-abreviation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Abréviation (auto-majuscule)</label>
        <input
          type="text"
          id="block-abreviation"
          value={abreviation}
          onChange={(e) => setAbreviation(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </button>
      </div>
    </form>
  );
};


// Page Blocs
// ... (Identique, sauf vérification projectId)
const BlocksPage = ({ selectedProject, allBlocks, setAllBlocks, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null); 
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';
  const { projectId } = useParams();

  if (!selectedProject || selectedProject.id !== projectId) {
     return <Navigate to="/select-project" replace />;
  }
  
  if (!isAdmin) {
     return <Navigate to={`/project/${projectId}/dashboard`} replace />; // Redirige les non-admins vers le dashboard
  }

  const projectBlocks = allBlocks.filter(b => b.id_projet === projectId);

  const openModalToEdit = (block) => {
    setEditingBlock(block);
    setIsModalOpen(true);
  };

  const openModalToCreate = () => {
    setEditingBlock(null);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlock(null);
  };

  const handleSave = (blockData) => {
    if (editingBlock) {
      setAllBlocks(allBlocks.map(b => b.id === editingBlock.id ? { ...b, ...blockData } : b));
    } else {
      const newBlock = {
        ...blockData,
        id: 'b' + Date.now(), 
        id_projet: projectId // Utilise projectId de l'URL
      };
      setAllBlocks([...allBlocks, newBlock]);
    }
    closeModal();
  };

  const handleDelete = (blockId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bloc ?")) {
      setAllBlocks(allBlocks.filter(b => b.id !== blockId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Blocs pour : {selectedProject.nom}</h1>
        {isAdmin && (
          <button 
            onClick={openModalToCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Bloc
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Abréviation</th>
              {isAdmin && (
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projectBlocks.map((block) => (
              <tr key={block.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{block.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{block.abreviation}</td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => openModalToEdit(block)} className="text-blue-600 dark:text-blue-400"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(block.id)} className="text-red-600 dark:text-red-400"><Trash2 className="w-5 h-5" /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingBlock ? "Modifier le Bloc" : "Créer un Nouveau Bloc"}
      >
        <BlockForm 
          block={editingBlock} 
          onSave={handleSave} 
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

// Formulaire Lots
// ... (Identique)
const LotForm = ({ lot, onSave, onCancel }) => {
  const [nom, setNom] = useState(lot ? lot.nom : '');
  const [abreviation, setAbreviation] = useState(lot ? lot.abreviation : '');
  const [ctc, setCtc] = useState(lot ? lot.ctc_approbation : false);
  const [sousLots, setSousLots] = useState(lot ? lot.sousLots : []);
  const [newSousLotNom, setNewSousLotNom] = useState('');
  const [newSousLotAbrev, setNewSousLotAbrev] = useState('');

  const handleAddSousLot = () => {
    if (newSousLotNom && newSousLotAbrev) {
      setSousLots([...sousLots, {
        id: 'sl' + Date.now(),
        nom: newSousLotNom,
        abreviation: newSousLotAbrev.toUpperCase()
      }]);
      setNewSousLotNom('');
      setNewSousLotAbrev('');
    }
  };

  const handleRemoveSousLot = (id) => {
    setSousLots(sousLots.filter(sl => sl.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...lot, // Garde l'id et id_projet si en modification
      nom,
      abreviation: abreviation.toUpperCase(),
      ctc_approbation: ctc,
      sousLots: sousLots
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div>
        <label htmlFor="lot-nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du Lot</label>
        <input
          type="text"
          id="lot-nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
        />
      </div>
      <div>
        <label htmlFor="lot-abreviation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Abréviation (auto-majuscule)</label>
        <input
          type="text"
          id="lot-abreviation"
          value={abreviation}
          onChange={(e) => setAbreviation(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="lot-ctc"
          checked={ctc}
          onChange={(e) => setCtc(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="lot-ctc" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Soumis à approbation CTC</label>
      </div>
      
      {/* Gestion des Sous-Lots */}
      <div className="space-y-2 pt-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sous-Lots</label>
        {sousLots.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto border dark:border-gray-600 rounded-md p-2">
            {sousLots.map(sl => (
              <div key={sl.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">{sl.nom} ({sl.abreviation})</span>
                <button type="button" onClick={() => handleRemoveSousLot(sl.id)} className="text-red-500 hover:text-red-700">
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500">Nom sous-lot</label>
            <input 
              type="text"
              value={newSousLotNom}
              onChange={(e) => setNewSousLotNom(e.target.value)}
              className="mt-1 block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              placeholder="Ex: Courants Forts"
            />
          </div>
          <div className="w-1/3">
            <label className="text-xs text-gray-500">Abrev. sous-lot</label>
            <input 
              type="text"
              value={newSousLotAbrev}
              onChange={(e) => setNewSousLotAbrev(e.target.value)}
              className="mt-1 block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              placeholder="Ex: CF"
            />
          </div>
          <button
            type="button"
            onClick={handleAddSousLot}
            className="p-2 text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </button>
      </div>
    </form>
  );
};


// Page Lots
// ... (Identique, sauf vérification projectId)
const LotsPage = ({ selectedProject, allLots, setAllLots, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLot, setEditingLot] = useState(null); 
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';
  const { projectId } = useParams();

  if (!selectedProject || selectedProject.id !== projectId) {
     return <Navigate to="/select-project" replace />;
  }

  if (!isAdmin) {
     return <Navigate to={`/project/${projectId}/dashboard`} replace />;
  }
  
  const projectLots = allLots.filter(l => l.id_projet === projectId);

  const openModalToEdit = (lot) => {
    setEditingLot(lot);
    setIsModalOpen(true);
  };

  const openModalToCreate = () => {
    setEditingLot(null);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLot(null);
  };
  
  const handleSave = (lotData) => {
    if (editingLot) {
      setAllLots(allLots.map(l => l.id === editingLot.id ? { ...l, ...lotData } : l));
    } else {
      const newLot = {
        ...lotData,
        id: 'l' + Date.now(), 
        id_projet: projectId
      };
      setAllLots([...allLots, newLot]);
    }
    closeModal();
  };

  const handleDelete = (lotId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce lot ?")) {
      setAllLots(allLots.filter(l => l.id !== lotId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Lots & Sous-Lots pour : {selectedProject.nom}</h1>
        {isAdmin && (
          <button 
            onClick={openModalToCreate}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau Lot
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lot</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Approbation CTC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sous-Lots</th>
              {isAdmin && (
                <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projectLots.map((lot) => (
              <tr key={lot.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{lot.nom}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{lot.abreviation}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    lot.ctc_approbation 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {lot.ctc_approbation ? 'Oui' : 'Non'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {lot.sousLots.map(sl => sl.abreviation).join(', ') || 'N/A'}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => openModalToEdit(lot)} className="text-blue-600 dark:text-blue-400"><Edit2 className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(lot.id)} className="text-red-600 dark:text-red-400"><Trash2 className="w-5 h-5" /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingLot ? "Modifier le Lot" : "Créer un Nouveau Lot"}
      >
        <LotForm 
          lot={editingLot} 
          onSave={handleSave} 
          onCancel={closeModal}
        />
      </Modal>
      
    </div>
  );
};

// Page Révisions
// ... (Identique, sauf vérification projectId)
const RevisionsPage = ({ selectedProject, plans }) => {
  const { projectId } = useParams();
  
  if (!selectedProject || selectedProject.id !== projectId) {
     return <Navigate to="/select-project" replace />;
  }
  
  const allRevisions = plans
    .filter(p => p.id_projet === projectId)
    .flatMap(plan => 
      plan.historique.map(rev => ({
        ...rev,
        planReference: plan.reference,
        planTitre: plan.titre,
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Historique des Révisions pour : {selectedProject.nom}</h1>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Version</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commentaire</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {allRevisions.map((rev, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rev.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{rev.planReference}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{rev.planTitre}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{rev.version}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rev.utilisateur}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rev.commentaire}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Formulaire Utilisateur
// ... (Identique)
const UserForm = ({ user, onSave, onCancel }) => {
  const [username, setUsername] = useState(user ? user.username : '');
  const [password, setPassword] = useState(''); // Toujours vide pour la sécurité
  const [role, setRole] = useState(user ? user.role : 'Ingénieur de suivi');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...user,
      username,
      // Ne pas écraser le mot de passe si le champ est vide lors de la modification
      ...(password && { password: password }), 
      role,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Identifiant</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Mot de passe {user ? "(laisser vide pour ne pas changer)" : ""}
        </label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!user}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700">
          <option value="Ingénieur de suivi">Ingénieur de suivi</option>
          <option value="Administrateur secondaire">Administrateur secondaire</option>
          <option value="Visiteur">Visiteur</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          Annuler
        </button>
        <button type="submit"
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </button>
      </div>
    </form>
  );
};


// Page Utilisateurs (avec CUD)
// ... (Identique, sauf redirection si pas admin)
const UsersPage = ({ currentUser, allUsers, setAllUsers }) => { 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';

  if (!isAdmin) {
     // Rediriger vers la page de sélection si pas admin et pas de projet sélectionné, sinon au dashboard
     return <Navigate to={currentUser ? "/select-project" : "/login"} replace />;
  }
  
  const openModalToEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const openModalToCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSave = (userData) => {
    if (editingUser) {
      // Modification
      setAllUsers(allUsers.map(u => u.id === editingUser.id ? { ...u, ...userData } : u));
    } else {
      // Création
      const newUser = {
        ...userData,
        id: 'u' + Date.now(), // ID unique simple
      };
      setAllUsers([...allUsers, newUser]);
    }
    closeModal();
  };

  const handleDelete = (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setAllUsers(allUsers.filter(u => u.id !== userId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestion des Utilisateurs</h1>
        <button 
          onClick={openModalToCreate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvel Utilisateur
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Identifiant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rôle</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {allUsers.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button 
                    onClick={() => openModalToEdit(user)}
                    className="text-blue-600 dark:text-blue-400 disabled:text-gray-400"
                    disabled={user.role === 'Gérant principal'} // On ne peut pas modifier le gérant principal
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 dark:text-red-400 disabled:text-gray-400"
                    disabled={user.role === 'Gérant principal'} // On ne peut pas supprimer le gérant principal
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingUser ? "Modifier un Utilisateur" : "Créer un Nouvel Utilisateur"}
      >
        <UserForm 
          user={editingUser} 
          onSave={handleSave} 
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

