import React, { useState, useEffect, useMemo } from 'react';
// Imports de React Router
import { Routes, Route, Link, useNavigate, Outlet, Navigate, useLocation, useParams } from 'react-router-dom';

// Import des graphiques
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector 
} from 'recharts';
// Import des icônes
import { 
  LayoutDashboard, FolderKanban, FileText, Settings, Users, Building, MapPin, 
  ChevronDown, ChevronRight, Sun, Moon, LogOut, CheckCircle, XCircle, Clock, 
  FileDiff, Plus, Trash2, Edit2, Search, Filter, Home, Layers, Copy, Download,
  Package, Wrench, UserCog, AlertCircle, X, Save, PlusCircle, Trash, Eye, 
  ArrowRight, ShieldCheck, ExternalLink, Upload, History, Info, CalendarDays // NOUVELLES ICÔNES
} from 'lucide-react';

// --- Données de Simulation (Valeurs par défaut pour localStorage) ---

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

const defaultMockUsers = [
  { id: 'u1', username: 'gérant.principal', role: 'Gérant principal', password: 'admin' }, 
  { id: 'u2', username: 'admin.secondaire', role: 'Administrateur secondaire', password: 'admin' },
  { id: 'u3', username: 'ing.suivi', role: 'Ingénieur de suivi', password: 'user' },
  { id: 'u4', username: 'visiteur.temp', role: 'Visiteur', password: 'guest' },
  { id: 'u5', username: 'autre.ing', role: 'Ingénieur de suivi', password: 'user' }, 
];

// MODIFIÉ: Ajout date_demarrage, delai, unite_delai
const defaultMockProjects = [
  { id: 'p1', nom: "Projet Pilote DUNE", abreviation: "DUNE", wilaya: "16 - Alger", daira: "Alger Centre", commune: "Alger Centre", adresse: "15 Rue Didouche Mourad", lien_maps: "https://maps.google.com/...", assigned_users: ['u3', 'u5'], statut: "en étude", date_creation: "2024-10-01", acces_visiteur: true, date_demarrage: null, delai: null, unite_delai: 'jours' },
  { id: 'p2', nom: "Complexe Hôtelier Oran", abreviation: "CHO", wilaya: "31 - Oran", daira: "Oran", commune: "Oran", adresse: "Front de Mer", lien_maps: "", assigned_users: ['u3'], statut: "en exécution", date_creation: "2024-05-15", acces_visiteur: false, date_demarrage: "2024-06-01", delai: 18, unite_delai: 'mois' },
  { id: 'p3', nom: "Tour de bureaux 'Le Phare'", abreviation: "PHARE", wilaya: "16 - Alger", daira: "Bab El Oued", commune: "Bab El Oued", adresse: "Place des Martyrs", lien_maps: "", assigned_users: ['u2'], statut: "achevé", date_creation: "2023-01-10", acces_visiteur: false, date_demarrage: "2023-02-01", delai: 12, unite_delai: 'mois' },
];

const defaultMockLotsInit = [ 
  { id: 'l1', id_projet: 'p1', nom: 'Architecture', abreviation: 'ARCH', ctc_approbation: true, sousLots: [{ id: 'sl1', nom: 'Plans de masse', abreviation: 'PM' }] },
  { id: 'l2', id_projet: 'p1', nom: 'Génie Civil', abreviation: 'GCIV', ctc_approbation: true, sousLots: [] },
  { id: 'l3', id_projet: 'p1', nom: 'Électricité', abreviation: 'ELEC', ctc_approbation: false, sousLots: [{ id: 'sl2', nom: 'Courants Forts', abreviation: 'CF' }, { id: 'sl3', nom: 'Courants Faibles', abreviation: 'Cf' }] },
  { id: 'l4', id_projet: 'p2', nom: 'Architecture', abreviation: 'ARCH', ctc_approbation: true, sousLots: [] },
];

const defaultMockBlocksInit = [ 
  { id: 'b1', id_projet: 'p1', nom: 'Administration', abreviation: 'ADM' },
  { id: 'b2', id_projet: 'p1', nom: 'Hébergement', abreviation: 'HEB' },
  { id: 'b3', id_projet: 'p2', nom: 'Restaurant', abreviation: 'REST' },
];

// MODIFIÉ: Ajout lien PDF externe pour test
const defaultMockPlansInit = [ 
  { id: 'pl1', id_projet: 'p1', id_bloc: 'b1', id_lot: 'l1', id_souslot: 'sl1', reference: "DUNE-ADM-ARCH-001-R00", titre: "Plan de masse général", statut: "Approuvé CTC", numero: 1, revision: 0, date_creation: "2024-10-05", id_createur: 'u3', fichier_pdf: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf", historique: [{ version: 'R00', date: '2024-10-05', utilisateur: 'ing.suivi', commentaire: 'Version initiale pour approbation' }] }, // Exemple lien PDF
  { id: 'pl2', id_projet: 'p1', id_bloc: 'b1', id_lot: 'l2', id_souslot: null, reference: "DUNE-ADM-GCIV-002-R01", titre: "Plans de fondation", statut: "En cours d'approbation", numero: 2, revision: 1, date_creation: "2024-10-10", id_createur: 'u2', fichier_pdf: "sim-plan-b-r1.pdf", historique: [{ version: 'R00', date: '2024-10-08', utilisateur: 'admin.secondaire', commentaire: 'Première émission' }, { version: 'R01', date: '2024-10-10', utilisateur: 'admin.secondaire', commentaire: 'Mise à jour suite réunion' }] },
  { id: 'pl3', id_projet: 'p2', id_bloc: 'b3', id_lot: 'l4', id_souslot: null, reference: "CHO-REST-ARCH-001-R00", titre: "Plan de cuisine", statut: "Déposé au MO", numero: 1, revision: 0, date_creation: "2024-06-01", id_createur: 'u3', fichier_pdf: "sim-plan-c.pdf", historique: [{ version: 'R00', date: '2024-06-01', utilisateur: 'ing.suivi', commentaire: 'Version finale' }] },
  { id: 'pl4', id_projet: 'p1', id_bloc: 'b2', id_lot: 'l1', id_souslot: null, reference: "DUNE-HEB-ARCH-003-R00", titre: "Façade Ouest Hébergement\nEtage courant", statut: "En cours d'approbation", numero: 3, revision: 0, date_creation: "2024-10-20", id_createur: 'u5', fichier_pdf: "sim-plan-d.pdf", historique: [{ version: 'R00', date: '2024-10-20', utilisateur: 'autre.ing', commentaire: 'Première version' }] },
];
// --- Fin des Données de Simulation ---

// --- Fonctions Utilitaires ---
// MODIFIÉ: Abréviation plus intelligente
const generateAbbreviation = (name) => {
  if (!name) return '';
  name = name.trim(); 
  // Mots à ignorer (plus complet)
  const commonWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'au', 'aux', 'et', 'ou', 'à', 'en', 'sur', 'par', 'pour', "d'", "l'", "s'"]);
  // Si le nom contient des espaces, essayer de prendre les initiales des mots significatifs
  if (name.includes(' ')) {
    const words = name.split(/[\s'-]+/) // Sépare par espace, apostrophe, tiret
                      .map(word => word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")) // Retire accents
                      .filter(word => word.length > 1 && !commonWords.has(word)); // Filtre mots courts/communs
    
    // Si plus de 4 mots significatifs, prendre les 4 premiers
    // Sinon, prendre tous les mots significatifs
    let abrev = (words.length > 4 ? words.slice(0, 4) : words)
                  .map(word => word[0]).join('').toUpperCase();

    // Si l'abréviation est trop courte (ex: "Le Phare" -> P), essayer de prendre plus de lettres du premier mot
    if (abrev.length < 2 && words.length > 0) {
       abrev = words[0].substring(0, Math.min(4, words[0].length)).toUpperCase();
    }
    // S'assurer qu'elle n'est jamais vide
    if (!abrev && name.length > 0) {
       abrev = name.substring(0, Math.min(4, name.length)).toUpperCase();
    }
    return abrev.substring(0, 4); 
  } else {
    // Si pas d'espace, prendre les 4 premières lettres
    return name.substring(0, 4).toUpperCase();
  }
};

// NOUVEAU: Fonction pour calculer la date de fin
const calculateEndDate = (startDate, duration, unit) => {
  if (!startDate || !duration || isNaN(parseInt(duration))) return null;
  
  try {
    const start = new Date(startDate);
    // Vérifier si la date est valide
    if (isNaN(start.getTime())) return null; 

    const durationNum = parseInt(duration);
    if (unit === 'jours') {
      start.setDate(start.getDate() + durationNum);
    } else if (unit === 'mois') {
      start.setMonth(start.getMonth() + durationNum);
    } else {
      return null; // Unité non supportée
    }
    // Formater la date en YYYY-MM-DD
    return start.toISOString().split('T')[0];
  } catch (e) {
      console.error("Erreur calcul date fin:", e);
      return null;
  }
};


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

const loadInitialState = (key, defaultValue) => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) return defaultValue; 
    const parsed = JSON.parse(item);
    // CORRECTION: S'assurer que les listes vides sont bien gérées et que le type correspond
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
        console.warn(`LocalStorage key "${key}" was not an array, falling back to default.`);
        // Essayer de retourner la valeur par défaut plutôt qu'un array vide si defaultValue n'est pas un array
        return Array.isArray(defaultValue) ? defaultValue : (parsed || defaultValue); 
    }
    return parsed;
  } catch (error) {
    console.error(`Erreur lors du chargement de ${key} depuis localStorage`, error);
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.removeItem(key);
        } catch (removeError) {
            console.error(`Erreur lors de la suppression de la clé localStorage invalide "${key}"`, removeError);
        }
    }
    return defaultValue;
  }
};

// CORRECTION: S'assurer que la valeur par défaut est bien stockée si l'état initial est vide/incorrect
const useLocalStorageState = (key, defaultValue) => {
  const [state, setState] = useState(() => loadInitialState(key, defaultValue));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Si l'état devient null/undefined mais qu'on attendait un array, stocker un array vide
        let valueToStore = state;
        if (Array.isArray(defaultValue) && !Array.isArray(state)) {
            console.warn(`State for key "${key}" is not an array, storing empty array instead.`);
            valueToStore = []; // Stocker un array vide pour éviter les erreurs futures au chargement
        }
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
          console.error(`Erreur lors de la sauvegarde de ${key} dans localStorage`, error);
      }
    }
  }, [key, state, defaultValue]); 

  return [state, setState];
};

// --- Composant Racine ---
export default function App() {
  const [isDarkMode, setIsDarkMode] = useDarkMode();
  
  // États Globaux (Utilise localStorage pour la persistance)
  const [currentUser, setCurrentUser] = useLocalStorageState('dune-user', null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!loadInitialState('dune-user', null));
  const [userProjects, setUserProjects] = useLocalStorageState('dune-userProjects', []); 
  const [selectedProjectId, setSelectedProjectId] = useLocalStorageState('dune-selectedProjectId', null); 
  
  const [allProjects, setAllProjects] = useLocalStorageState('dune-allProjects', defaultMockProjects);
  const [allBlocks, setAllBlocks] = useLocalStorageState('dune-allBlocks', defaultMockBlocksInit);
  const [allLots, setAllLots] = useLocalStorageState('dune-allLots', defaultMockLotsInit);
  const [allPlans, setAllPlans] = useLocalStorageState('dune-allPlans', defaultMockPlansInit);
  const [allUsers, setAllUsers] = useLocalStorageState('dune-allUsers', defaultMockUsers);
  
  const navigate = useNavigate();

  // Mémorisation du projet sélectionné
  const selectedProject = useMemo(() => {
    return Array.isArray(allProjects) ? allProjects.find(p => p.id === selectedProjectId) : undefined; 
  }, [allProjects, selectedProjectId]);
  
  // Logique de login
  const handleLogin = (username, password) => {
    const user = allUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      setCurrentUser(user); 
      setIsAuthenticated(true);

      let filteredProjects = [];
      const currentProjects = Array.isArray(allProjects) ? allProjects : []; // Assurer array
      if (user.role === 'Gérant principal' || user.role === 'Administrateur secondaire') {
        filteredProjects = currentProjects; 
      } else {
        filteredProjects = currentProjects.filter(p => 
          (p.assigned_users && p.assigned_users.includes(user.id)) || 
          (user.role === 'Visiteur' && p.acces_visiteur === true)
        ); 
      }
      
      setUserProjects(filteredProjects);
      setSelectedProjectId(null); 
      
      navigate('/select-project'); 
    } else {
      console.error("Identifiants incorrects");
      alert("Identifiant ou mot de passe incorrect."); 
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
    navigate(`/project/${projectId}/dashboard`); 
  };

  // Données CUD passées comme props
  const appData = {
    allProjects, setAllProjects,
    allBlocks, setAllBlocks,
    allLots, setAllLots,
    allPlans, setAllPlans,
    allUsers, setAllUsers,
    selectedProject, 
    userProjects, 
    isDarkMode,
    currentUser,
    setSelectedProjectId 
  };

  // --- Rendu Racine ---
  return (
    <div className={`bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans min-h-screen`}> 
      <Routes>
        {/* Route Login */}
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginScreen onLogin={handleLogin} isDarkMode={isDarkMode} /> : <Navigate to="/select-project" replace />}
        />
        
        {/* Route Sélection Projet */}
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
                isAdmin={currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire'}
                allProjects={allProjects}
                setAllProjects={setAllProjects}
                allUsers={allUsers}
                setUserProjects={setUserProjects} 
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Layout Projet */}
        <Route 
          path="/project/:projectId/*" 
          element={
            isAuthenticated ? (
              <MainLayoutWrapper
                isAuthenticated={isAuthenticated}
                selectedProjectId={selectedProjectId}
                userProjects={userProjects}
                setSelectedProjectId={setSelectedProjectId}
              >
                <MainLayout
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  currentUser={currentUser}
                  handleLogout={handleLogout}
                  userProjects={userProjects} 
                  selectedProjectId={selectedProjectId}
                  setSelectedProjectId={setSelectedProjectId}
                  appData={appData}
                />
              </MainLayoutWrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        
         {/* Layout Admin */}
         <Route 
           path="/admin/*"
           element={
             isAuthenticated ? (
               <AdminLayoutWrapper
                 currentUser={currentUser}
               >
                 <AdminLayout 
                   currentUser={currentUser} 
                   handleLogout={handleLogout} 
                   appData={appData} 
                   isDarkMode={isDarkMode}
                   setIsDarkMode={setIsDarkMode}
                 />
               </AdminLayoutWrapper>
             ) : (
               <Navigate to="/login" replace />
             )
           }
         />

        {/* Route par défaut */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/select-project" : "/login"} replace />} />

      </Routes>
    </div>
  );
}

// --- Wrappers pour la logique de redirection ---
// ... (Identiques) ...
const MainLayoutWrapper = ({ children, isAuthenticated, selectedProjectId, userProjects, setSelectedProjectId }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    // CORRECTION: S'assurer que userProjects est un array avant d'utiliser some
    if (!projectId || (projectId && Array.isArray(userProjects) && !userProjects.some(p => p.id === projectId)) || !selectedProjectId) {
      if (selectedProjectId !== null) {
          setSelectedProjectId(null); 
      }
      navigate('/select-project', { replace: true });
    } else if (projectId && projectId !== selectedProjectId) {
      setSelectedProjectId(projectId); // Synchronise l'état
    } 
  }, [isAuthenticated, projectId, userProjects, navigate, selectedProjectId, setSelectedProjectId]);

  if (!selectedProjectId || selectedProjectId !== projectId) {
    return <div className="flex items-center justify-center h-screen">Chargement du projet...</div>;
  }

  return <div className="h-screen">{children}</div>;
};

const AdminLayoutWrapper = ({ children, currentUser }) => {
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';

  if (!isAdmin) {
    return <Navigate to="/select-project" replace />;
  }
  return <div className="h-screen">{children}</div>;
};


// --- Page de Sélection de Projet ---
// ... (Identique) ...
const ProjectSelectionPage = ({ 
  userProjects, onSelectProject, handleLogout, currentUser, isDarkMode, setIsDarkMode,
  isAdmin, allProjects, setAllProjects, allUsers, setUserProjects
}) => {
  const [filter, setFilter] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); 
  const [editingProject, setEditingProject] = useState(null);
  const [infoProject, setInfoProject] = useState(null); 
  
  const currentAllProjects = Array.isArray(allProjects) ? allProjects : [];
  const projectsToDisplay = isAdmin ? currentAllProjects : userProjects; 
  
  const getStatusColor = (statut) => { /* ... Identique ... */ 
    switch (statut) {
      case 'en étude': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'en exécution': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'achevé': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'suspendu': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  const openProjectModalToEdit = (project) => { setEditingProject(project); setIsProjectModalOpen(true); };
  const openProjectModalToCreate = () => { setEditingProject(null); setIsProjectModalOpen(true); };
  const closeProjectModal = () => { setIsProjectModalOpen(false); setEditingProject(null); };

  const openInfoModal = (project) => { setInfoProject(project); setIsInfoModalOpen(true); };
  const closeInfoModal = () => { setIsInfoModalOpen(false); setInfoProject(null); };


  const handleSave = (projectData) => {
    let savedProject = null;
    let updatedAllProjects; 

    if (editingProject) {
      savedProject = { ...editingProject, ...projectData };
      updatedAllProjects = currentAllProjects.map(p => p.id === editingProject.id ? savedProject : p);
      setAllProjects(updatedAllProjects); 
    } else {
      savedProject = {
        ...projectData,
        id: 'p' + Date.now(), 
        date_creation: new Date().toISOString().split('T')[0], 
      };
      updatedAllProjects = [...currentAllProjects, savedProject]; 
      setAllProjects(updatedAllProjects); 
    }
    closeProjectModal();
    
    // Mettre à jour userProjects
    if (isAdmin || (savedProject.assigned_users && savedProject.assigned_users.includes(currentUser.id))) {
        let updatedUserProjects = [];
         if (isAdmin) {
           updatedUserProjects = updatedAllProjects; 
         } else {
           updatedUserProjects = updatedAllProjects.filter(p => 
              (p.assigned_users && p.assigned_users.includes(currentUser.id)) ||
              (currentUser.role === 'Visiteur' && p.acces_visiteur === true) 
           ); 
         }
        setUserProjects(updatedUserProjects); 

        // Si création et admin ou assigné, ouvrir
        if (!editingProject && (isAdmin || (savedProject.assigned_users && savedProject.assigned_users.includes(currentUser.id)))) {
           onSelectProject(savedProject.id); 
        }
    }
  };

  const handleDelete = (projectId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible et supprimera aussi ses blocs, lots et plans.")) {
      const updatedAllProjects = currentAllProjects.filter(p => p.id !== projectId);
      setAllProjects(updatedAllProjects); 
      
      if (!isAdmin) {
          setUserProjects(updatedUserProjects.filter(p => 
              (p.assigned_users && p.assigned_users.includes(currentUser.id)) ||
              (currentUser.role === 'Visiteur' && p.acces_visiteur === true) 
           )); 
      } else {
          setUserProjects(updatedAllProjects); 
      }
      // TODO: Supprimer données associées (localStorage)
       if (typeof window !== 'undefined') {
          const blocks = JSON.parse(window.localStorage.getItem('dune-allBlocks') || '[]').filter(b => b.id_projet !== projectId);
          const lots = JSON.parse(window.localStorage.getItem('dune-allLots') || '[]').filter(l => l.id_projet !== projectId);
          const plans = JSON.parse(window.localStorage.getItem('dune-allPlans') || '[]').filter(pl => pl.id_projet !== projectId);
          window.localStorage.setItem('dune-allBlocks', JSON.stringify(blocks));
          window.localStorage.setItem('dune-allLots', JSON.stringify(lots));
          window.localStorage.setItem('dune-allPlans', JSON.stringify(plans));
       }
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-20 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
         <div className="flex items-center">
            <Building className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <span className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-100">DUNE - Projets</span>
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
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
             {isAdmin ? 'Gestion des Projets' : 'Sélectionnez un projet'}
           </h1>
           {isAdmin && (
             <button 
               onClick={openProjectModalToCreate}
               className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
             >
               <Plus className="w-5 h-5 mr-2" />
               Nouveau Projet
             </button>
           )}
         </div>
         {/* Barre Filtre/Recherche */}
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex space-x-4 mb-6">
           <div className="flex-1 relative">
             <input type="text" placeholder="Rechercher..."
               className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
             <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
           </div>
           <select value={filter} onChange={(e) => setFilter(e.target.value)}
             className="pl-3 pr-10 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
             <option value="">Tous les statuts</option>
             <option value="en étude">En étude</option>
             <option value="en exécution">En exécution</option>
             <option value="achevé">Achevé</option>
             <option value="suspendu">Suspendu</option>
           </select>
           {isAdmin && (
             <button onClick={() => alert("Fonctionnalité d'exportation bientôt disponible.")}
               className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
               <Download className="w-5 h-5 mr-2" /> Exporter
             </button>
           )}
         </div>
         
         {/* Liste des Projets (Tableau) */}
         {projectsToDisplay.length > 0 ? (
           <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-700">
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider">Projet</th>
                   <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider">Localisation</th>
                   <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider">Assignés</th>
                   <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider">Statut</th>
                   <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                 </tr>
               </thead>
               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                 {projectsToDisplay.filter(p => filter ? p.statut === filter : true).map((project) => (
                   <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium dark:text-gray-100">{project.nom}</div>
                       <div className="text-sm dark:text-gray-400">{project.abreviation}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-400">
                       {project.commune}, {project.wilaya}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-400">
                       {/* MODIFIÉ: S'assurer que allUsers est un array */}
                       {project.assigned_users?.map(userId => (Array.isArray(allUsers)? allUsers.find(u => u.id === userId)?.username : '?')).join(', ') || 'N/A'}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.statut)}`}>
                         {project.statut}
                       </span>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1"> 
                       <button onClick={() => onSelectProject(project.id)} title="Ouvrir"
                         className="p-1.5 text-white bg-blue-600 rounded hover:bg-blue-700">
                         <Home className="w-4 h-4" />
                       </button>
                        {/* NOUVEAU: Bouton Info Projet */}
                       {(isAdmin || (project.assigned_users && project.assigned_users.includes(currentUser.id))) && (
                           <button onClick={() => openInfoModal(project)} title="Infos Projet"
                             className="p-1.5 text-cyan-600 dark:text-cyan-400 rounded hover:bg-cyan-100 dark:hover:bg-gray-700">
                             <Info className="w-4 h-4" />
                           </button>
                        )}
                       {isAdmin && (
                         <>
                           <button onClick={() => openProjectModalToEdit(project)} title="Modifier"
                             className="p-1.5 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-gray-700">
                             <Edit2 className="w-4 h-4" />
                           </button>
                           <button onClick={() => handleDelete(project.id)} title="Supprimer"
                             className="p-1.5 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-gray-700">
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </>
                       )}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ) : (
           <p className="text-center text-gray-500 dark:text-gray-400 mt-10">Aucun projet trouvé {isAdmin ? '' : 'pour cet utilisateur'}.</p>
         )}
         
         {/* Modal Projet */}
         <Modal isOpen={isProjectModalOpen} onClose={closeProjectModal} title={editingProject ? "Modifier le Projet" : "Créer un Projet"}>
           <ProjectForm 
             project={editingProject} 
             onSave={handleSave} 
             onCancel={closeProjectModal}
             allUsers={allUsers} 
             currentUser={currentUser}
           />
         </Modal>
         
         {/* NOUVEAU: Modal Info Projet */}
         <ProjectInfoModal 
            isOpen={isInfoModalOpen} 
            onClose={closeInfoModal} 
            project={infoProject} 
            allUsers={allUsers} 
         />
      </main>
    </div>
  );
};


// --- Composant Layout Principal ---
const MainLayout = ({ 
  isDarkMode, setIsDarkMode, currentUser, handleLogout, 
  userProjects, selectedProjectId, setSelectedProjectId,
  appData 
}) => {
  const { projectId } = useParams(); 
  const { selectedProject } = appData; 

  // Prépare les props à passer aux pages
  // CORRECTION: Assurer que TOUTES les données (allBlocks, allLots etc.) sont incluses dans pageProps
  const pageProps = { 
      ...appData, // Inclut allUsers, allBlocks, allLots, allPlans et leurs setters
      isDarkMode, 
      currentUser, 
      selectedProject, 
      selectedProjectId, 
      setSelectedProjectId 
  };
          
  if (!selectedProject || selectedProject.id !== projectId) {
      console.error("MainLayout: Erreur - selectedProject invalide ou non synchronisé.", {selectedProject, projectId});
      return <Navigate to="/select-project" replace />; // Rediriger si incohérent
  }

  return (
    <div className="flex h-full"> 
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
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
          <Routes>
             <Route path="dashboard" element={<DashboardPage {...pageProps} />} />
             <Route path="plans" element={<PlansPage {...pageProps} />} /> 
             <Route path="blocks" element={<BlocksPage {...pageProps} />} />
             <Route path="lots" element={<LotsPage {...pageProps} />} />
             {/* SUPPRIMÉ: Route Révisions */}
             
             <Route index element={<Navigate to="dashboard" replace />} />
             <Route path="*" element={<Navigate to="dashboard" replace />} /> 
          </Routes>
        </main>
      </div>
    </div>
  );
};

// --- Layout Admin ---
const AdminLayout = ({ currentUser, handleLogout, appData, isDarkMode, setIsDarkMode }) => {
   const pageProps = { ...appData, isDarkMode, currentUser }; 
   const navigate = useNavigate(); 

   return (
     <div className="flex h-full"> 
         <Sidebar 
           handleLogout={handleLogout}
           currentUser={currentUser}
           projectId={null} 
         />
         <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              isDarkMode={isDarkMode} 
              setIsDarkMode={setIsDarkMode} 
              currentUser={currentUser}
              userProjects={[]} 
              selectedProjectId={null}
              setSelectedProjectId={() => navigate('/select-project')} 
            />
           <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-100 dark:bg-gray-900">
             <Routes>
                <Route path="users" element={<UsersPage {...pageProps} />} /> 
                <Route path="settings" element={<PlaceholderPage title="Paramètres" icon={Wrench} />} />
                <Route index element={<Navigate to="users" replace />} />
                <Route path="*" element={<Navigate to="users" replace />} /> 
             </Routes>
           </main>
         </div>
      </div>
   );
};

/* --- Le reste des composants --- */

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
// ... (Identique)
const Sidebar = ({ handleLogout, currentUser, projectId }) => { 
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';
  const location = useLocation(); 

  const projectUrl = (path) => projectId ? `/project/${projectId}/${path}` : '#'; 
  const adminUrl = (path) => `/admin/${path}`; 

  const NavItem = ({ icon, label, to, disabled = false }) => {
    const isActive = to === '/select-project' ? location.pathname === to : location.pathname.startsWith(to) && to !== '/select-project'; 
    const isDisabled = !projectId && !to.startsWith('/admin') && to !== '/select-project';

    return (
      <Link
        to={isDisabled ? "#" : to} 
        className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
          isActive && !isDisabled
            ? 'bg-blue-600 text-white shadow-inner' 
            : isDisabled
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        onClick={(e) => { if (isDisabled) e.preventDefault(); }} 
      >
        {React.createElement(icon, { className: "w-5 h-5 mr-3 flex-shrink-0" })}
        <span className="font-medium truncate">{label}</span>
      </Link>
    );
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col flex-shrink-0 h-full"> 
      <div className="flex items-center justify-center h-20 border-b dark:border-gray-700 flex-shrink-0"> 
        <Building className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        <span className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-100">DUNE</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavItem icon={FolderKanban} label="Changer Projet" to="/select-project" /> 
        <NavItem icon={LayoutDashboard} label="Tableau de bord" to={projectUrl('dashboard')} disabled={!projectId} />
        
        <div className="pt-4 mt-4 border-t dark:border-gray-700">
          <h3 className={`px-4 mb-2 text-xs font-semibold tracking-wider ${projectId ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'} uppercase`}>
            Gestion du projet {projectId ? '' : '(Sélectionnez)'}
          </h3>
          {isAdmin && (
            <>
              <NavItem icon={Package} label="Blocs" to={projectUrl('blocks')} disabled={!projectId} />
              <NavItem icon={Layers} label="Lots & Sous-Lots" to={projectUrl('lots')} disabled={!projectId} />
            </>
          )}
          <NavItem icon={FileText} label="Plans" to={projectUrl('plans')} disabled={!projectId} />
          {/* SUPPRIMÉ: NavItem Révisions */}
        </div>

        {isAdmin && (
          <div className="pt-4 mt-4 border-t dark:border-gray-700">
            <h3 className="px-4 mb-2 text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Administration</h3>
            <NavItem icon={UserCog} label="Utilisateurs" to={adminUrl('users')} /> 
            <NavItem icon={Wrench} label="Paramètres" to={adminUrl('settings')} />
          </div>
        )}
      </nav>
      <div className="px-4 py-4 border-t dark:border-gray-700 flex-shrink-0"> 
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
// ... (Identique)
const Header = ({ isDarkMode, setIsDarkMode, currentUser, userProjects, selectedProjectId, setSelectedProjectId }) => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleProjectSwitch = (e) => {
    const newProjectId = e.target.value;
    if (newProjectId) {
      navigate(`/project/${newProjectId}/dashboard`); 
    } else {
      navigate('/select-project'); 
    }
  };

  return (
    <header className="h-20 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0"> 
      <div className="flex items-center">
        {location.pathname.startsWith('/project/') && selectedProjectId && userProjects.length > 0 ? ( 
          <>
            <label htmlFor="project-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Projet Actif :</label>
            <select
              id="project-select"
              value={selectedProjectId || ''} 
              onChange={handleProjectSwitch} 
              className="w-64 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">-- Aucun (Retour à la liste) --</option>
              {userProjects.map(p => (
                <option key={p.id} value={p.id}>{p.nom} ({p.abreviation})</option>
              ))}
            </select>
          </>
        ) : location.pathname.startsWith('/admin') ? ( 
           <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">Administration</span> 
        ): ( 
           <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Sélectionnez un projet</span>
        )}
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

// Tableau de bord
// ... (Identique)
const DashboardPage = ({ isDarkMode, selectedProject, allPlans, allUsers, currentUser }) => { 
  const { projectId } = useParams();
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';

  // Stats Spécifiques au projet sélectionné
  const projectPlans = useMemo(() => (Array.isArray(allPlans) ? allPlans.filter(p => p.id_projet === projectId) : []), [allPlans, projectId]);
  const totalProjectPlans = projectPlans.length;

  // Calcul des comptes par statut pour les cartes
  const planStatusCounts = useMemo(() => {
    return projectPlans.reduce((acc, plan) => {
      acc[plan.statut] = (acc[plan.statut] || 0) + 1;
      return acc;
    }, {
      'Approuvé CTC': 0, 
      "En cours d'approbation": 0, 
      'Déposé au MO': 0, 
      'Obsolète': 0
    });
  }, [projectPlans]);


  // Données pour le Pie Chart (Statuts du projet sélectionné avec pourcentages)
  const projectPieData = useMemo(() => {
    return [
      { name: 'Approuvés CTC', value: planStatusCounts['Approuvé CTC'], color: '#10B981' }, 
      { name: 'En cours', value: planStatusCounts["En cours d'approbation"], color: '#F59E0B' }, 
      { name: 'Déposés MO', value: planStatusCounts['Déposé au MO'], color: '#3B82F6' },
      { name: 'Obsolètes', value: planStatusCounts['Obsolète'], color: '#EF4444' },
    ].filter(d => d.value > 0); 
  }, [planStatusCounts]);
  
  // Fonction pour afficher les labels du PieChart avec pourcentages
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; 

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Activité Récente (5 derniers plans ajoutés au projet)
  const recentPlans = useMemo(() => {
      return projectPlans
          .slice() 
          .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation)) 
          .slice(0, 5); 
  }, [projectPlans]);

  // StatCard reste générique
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

  if (!selectedProject) {
     return <div className="flex items-center justify-center h-full">Chargement des données du tableau de bord...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tableau de bord : {selectedProject.nom}</h1>
      
      {/* MODIFIÉ: Cartes de statuts des plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Plans Approuvés CTC" value={planStatusCounts['Approuvé CTC']} icon={CheckCircle} colorClass="bg-green-500" />
        <StatCard title="Plans En Cours" value={planStatusCounts["En cours d'approbation"]} icon={Clock} colorClass="bg-yellow-500" />
        <StatCard title="Plans Déposés MO" value={planStatusCounts['Déposé au MO']} icon={ExternalLink} colorClass="bg-blue-500" />
        <StatCard title="Plans Obsolètes" value={planStatusCounts['Obsolète']} icon={XCircle} colorClass="bg-red-500" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {/* MODIFIÉ: Graphique Pie spécifique au projet */}
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Répartition des Statuts (Projet)</h3>
          {totalProjectPlans > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={projectPieData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" cy="50%" 
                  outerRadius={110} 
                  labelLine={false}
                  label={renderCustomizedLabel} 
                >
                  {projectPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} (${((value / totalProjectPlans) * 100).toFixed(1)}%)`, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">Aucun plan pour ce projet.</div>
          )}
        </div>
         {/* Activité Récente (visible seulement par admins) */}
         {isAdmin && (
           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
             <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Activité Récente (Derniers Plans Ajoutés)</h3>
             {recentPlans.length > 0 ? (
                 <ul className="space-y-3 max-h-[300px] overflow-y-auto">
                     {recentPlans.map(plan => {
                         const creator = Array.isArray(allUsers) ? allUsers.find(u => u.id === plan.id_createur)?.username : '?';
                         return (
                             <li key={plan.id} className="flex items-start space-x-3 text-sm pb-3 border-b dark:border-gray-700 last:border-b-0">
                                 <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"/>
                                 <div>
                                     <p className="font-medium dark:text-gray-100 truncate" title={plan.titre}>{plan.titre || <span className="italic">Sans titre</span>}</p>
                                     <p className="text-xs text-gray-500 dark:text-gray-400">
                                         <span className="font-semibold">{plan.reference}</span> - Ajouté le {plan.date_creation} par {creator}
                                     </p>
                                 </div>
                             </li>
                         );
                     })}
                 </ul>
             ) : (
                 <div className="flex items-center justify-center h-[300px] text-gray-400">Aucune activité récente.</div>
             )}
           </div>
         )}
         {/* Placeholder si non admin */}
         {!isAdmin && (
             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                 <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Informations Projet</h3>
                   <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 space-y-2">
                       <Building className="w-12 h-12"/>
                       <p>Bienvenue sur le projet {selectedProject.nom}.</p>
                       <p className="text-xs">Consultez les plans via le menu latéral.</p>
                   </div>
             </div>
         )}
      </div>
    </div>
  );
};


// Formulaire Projet (avec dates exécution)
// ... (Identique)
const ProjectForm = ({ project, onSave, onCancel, allUsers, currentUser }) => {
  const [nom, setNom] = useState(project ? project.nom : '');
  const [abreviation, setAbreviation] = useState(project ? project.abreviation : generateAbbreviation(nom)); 
  const [wilaya, setWilaya] = useState(project ? project.wilaya : '');
  const [daira, setDaira] = useState(project ? project.daira : '');
  const [commune, setCommune] = useState(project ? project.commune : '');
  const [adresse, setAdresse] = useState(project ? project.adresse : '');
  const [statut, setStatut] = useState(project ? project.statut : 'en étude');
  const [assignedUsers, setAssignedUsers] = useState(project ? project.assigned_users || [] : [currentUser.id]); 
  
  // NOUVEAU: Champs date et délai
  const [dateDemarrage, setDateDemarrage] = useState(project ? project.date_demarrage || '' : '');
  const [delai, setDelai] = useState(project ? project.delai || '' : '');
  const [uniteDelai, setUniteDelai] = useState(project ? project.unite_delai || 'jours' : 'jours');
  const dateFinCalculee = useMemo(() => calculateEndDate(dateDemarrage, delai, uniteDelai), [dateDemarrage, delai, uniteDelai]);

  
  const [dairas, setDairas] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [autoAbrev, setAutoAbrev] = useState(project ? project.abreviation : generateAbbreviation(nom)); 
  
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';
  // CORRECTION: AssignableUsers inclut TOUS les users SAUF gérant principal
  const assignableUsers = useMemo(() => allUsers.filter(u => u.role !== 'Gérant principal'), [allUsers]); 

  useEffect(() => { /* ... Logique abréviation identique ... */ 
    const newAbrev = generateAbbreviation(nom);
    if (!abreviation || abreviation === autoAbrev) {
      setAbreviation(newAbrev);
    }
    setAutoAbrev(newAbrev);
  }, [nom]);

  useEffect(() => { /* ... Logique Wilaya -> Daira identique ... */ 
    if (wilaya && algeriaLocations[wilaya]) {
      setDairas(Object.keys(algeriaLocations[wilaya]));
    } else {
      setDairas([]);
    }
    // Ne pas réinitialiser daira si on édite et que la wilaya est la même
    if (!project || (project && project.wilaya !== wilaya)) {
        setDaira('');
    }
  }, [wilaya, project]);

  useEffect(() => { /* ... Logique Daira -> Commune identique ... */ 
    if (wilaya && daira && algeriaLocations[wilaya] && algeriaLocations[wilaya][daira]) {
      setCommunes(algeriaLocations[wilaya][daira]);
    } else {
      setCommunes([]);
    }
     // Ne pas réinitialiser commune si on édite et que la daira est la même
    if (!project || (project && (project.wilaya !== wilaya || project.daira !== daira))) {
        setCommune('');
    }
  }, [wilaya, daira, project]);
  
  // Pré-remplir si édition
  useEffect(() => {
    if (project) {
       setNom(project.nom); setAbreviation(project.abreviation); setWilaya(project.wilaya);
       setAdresse(project.adresse); setStatut(project.statut);
       setAssignedUsers(project.assigned_users || []); 
       // Dates
       setDateDemarrage(project.date_demarrage || '');
       setDelai(project.delai || '');
       setUniteDelai(project.unite_delai || 'jours');
       
       if (project.wilaya && algeriaLocations[project.wilaya]) {
         setDairas(Object.keys(algeriaLocations[project.wilaya]));
         setDaira(project.daira); 
       }
        if (project.wilaya && project.daira && algeriaLocations[project.wilaya] && algeriaLocations[project.wilaya][project.daira]) {
           setCommunes(algeriaLocations[project.wilaya][project.daira]);
           setCommune(project.commune); 
        }
       setAutoAbrev(project.abreviation); 
    } else {
        // Réinitialiser si création
        setNom(''); setAbreviation(''); setWilaya(''); setDaira(''); setCommune(''); 
        setAdresse(''); setStatut('en étude'); setAssignedUsers([currentUser.id]);
        setDateDemarrage(''); setDelai(''); setUniteDelai('jours');
        setDairas([]); setCommunes([]); setAutoAbrev('');
    }
  }, [project, currentUser.id]); 

  // Gère la sélection multiple
  const handleUserAssignmentChange = (userId) => {
    setAssignedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation pour dates si statut = en exécution
    if (statut === 'en exécution' && (!dateDemarrage || !delai || isNaN(parseInt(delai)))) {
       alert("Pour un projet 'en exécution', la date de démarrage et le délai sont obligatoires.");
       return;
    }
    
    onSave({
      ...project,
      nom,
      abreviation: abreviation.toUpperCase(),
      wilaya, daira, commune, adresse, statut, 
      assigned_users: assignedUsers,
      // NOUVEAU: Sauvegarder dates et délai
      date_demarrage: dateDemarrage || null, 
      delai: delai ? parseInt(delai) : null,
      unite_delai: delai ? uniteDelai : 'jours' 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2"> {/* Hauteur modale augmentée */}
      {/* ... Champs Nom, Abréviation, Adresse, Localisation ... Identiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du Projet</label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Abréviation</label>
              <input type="text" value={abreviation} onChange={(e) => setAbreviation(e.target.value.toUpperCase())} required maxLength="4"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 uppercase" />
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Générée automatiquement, modifiable (max 4 lettres).</p>
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
          
        {/* MODIFIÉ: Statut et Champs Délai regroupés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
             {/* NOUVEAU: Affichage conditionnel des champs de délai */}
             {statut === 'en exécution' && (
               <>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date démarrage</label>
                   <input type="date" value={dateDemarrage} onChange={(e) => setDateDemarrage(e.target.value)} 
                     required={statut === 'en exécution'} 
                     className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600`} />
                 </div>
                 <div className="flex space-x-2">
                     <div className="flex-1">
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Délai</label>
                         <input type="number" value={delai} onChange={(e) => setDelai(e.target.value)} min="1" 
                           required={statut === 'en exécution'} 
                           className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600`} />
                     </div>
                     <div className="w-1/3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unité</label>
                         <select value={uniteDelai} onChange={(e) => setUniteDelai(e.target.value)} required={statut === 'en exécution'}
                           className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600`}>
                           <option value="jours">Jours</option>
                           <option value="mois">Mois</option>
                         </select>
                     </div>
                 </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Date fin (estimée)</label>
                     <input type="date" value={dateFinCalculee || ''} readOnly disabled 
                       className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 cursor-not-allowed" />
                 </div>
               </>
             )}
          </div>
          {statut === 'en exécution' && (!dateDemarrage || !delai) && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Date démarrage et délai sont requis pour le statut 'en exécution'.</p>
          )}
      
      {/* CORRECTION: Champ Assignation Multiple (affiche TOUS les users sauf gérant principal) */}
      {isAdmin && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Utilisateurs Assignés</label>
          <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border dark:border-gray-600 rounded-md p-2">
            {assignableUsers.map(user => (
              <div key={user.id} className="flex items-center">
                <input
                  id={`user-assign-${user.id}`} // ID unique pour le label
                  type="checkbox"
                  checked={assignedUsers.includes(user.id)}
                  onChange={() => handleUserAssignmentChange(user.id)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`user-assign-${user.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  {user.username} <span className="text-xs text-gray-500">({user.role})</span>
                </label>
              </div>
            ))}
          </div>
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Admins ont accès à tout. Assignez les ingénieurs/visiteurs.</p>
        </div>
      )}
      {!isAdmin && project && ( // Afficher les assignés en lecture seule si non admin ET en modification
         <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Utilisateurs Assignés</label>
             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {assignedUsers.map(uid => assignableUsers.find(u => u.id === uid)?.username).filter(Boolean).join(', ') || 'Aucun'}
             </p>
         </div>
      )}
      {!isAdmin && !project && ( // Afficher l'auto-assignation si non admin ET en création
         <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Vous serez automatiquement assigné comme responsable.</p>
      )}


      {/* Boutons */}
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

// Modal Info Projet (avec dates exécution)
const ProjectInfoModal = ({ isOpen, onClose, project, allUsers }) => {
   if (!isOpen || !project) return null;

   const assignedUsernames = project.assigned_users
       // CORRECTION: S'assurer que allUsers est un array
       ?.map(userId => (Array.isArray(allUsers) ? allUsers.find(u => u.id === userId)?.username : '?'))
       .filter(Boolean) 
       .join(', ') || 'Aucun';
       
   const endDate = calculateEndDate(project.date_demarrage, project.delai, project.unite_delai);

   return (
     <Modal isOpen={isOpen} onClose={onClose} title={`Informations: ${project.nom}`}>
       <div className="space-y-3 text-sm max-h-[75vh] overflow-y-auto pr-2"> {/* Hauteur modale augmentée */}
         <p><strong>Abréviation:</strong> {project.abreviation}</p>
         <p><strong>Localisation:</strong> {project.commune}, {project.daira}, {project.wilaya}</p>
         <p><strong>Adresse:</strong> {project.adresse || 'N/A'}</p>
         <p><strong>Statut:</strong> {project.statut}</p>
         <p><strong>Date Création:</strong> {project.date_creation}</p>
         <p><strong>Utilisateurs Assignés:</strong> {assignedUsernames}</p>
         {project.lien_maps && (
            <p><strong>Lien Maps:</strong> <a href={project.lien_maps} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ouvrir <ExternalLink className="w-3 h-3 inline"/></a></p>
         )}
         
         {/* MODIFIÉ: Affiche section délais si date_demarrage existe */}
         {project.date_demarrage && (
            <div className="pt-3 mt-3 border-t dark:border-gray-600">
               <h4 className="font-semibold mb-2 text-md">Délais d'Exécution</h4>
               <p><CalendarDays className="w-4 h-4 inline mr-1 text-gray-500"/><strong>Date Démarrage:</strong> {project.date_demarrage}</p>
               <p><Clock className="w-4 h-4 inline mr-1 text-gray-500"/><strong>Délai:</strong> {project.delai ? `${project.delai} ${project.unite_delai}` : 'Non défini'}</p>
               <p><ShieldCheck className="w-4 h-4 inline mr-1 text-gray-500"/><strong>Date Fin (Estimée):</strong> {endDate || 'N/A'}</p>
            </div>
         )}
         
       </div>
       <div className="flex justify-end pt-4 mt-4 border-t dark:border-gray-700">
         <button type="button" onClick={onClose}
           className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
           Fermer
         </button>
       </div>
     </Modal>
   );
};


// Modal Info Plan (remplace RevisionHistoryModal)
// ... (Identique)
const PlanInfoModal = ({ isOpen, onClose, plan, allUsers, projectBlocks, projectLots }) => {
  if (!isOpen || !plan) return null;

   const bloc = projectBlocks.find(b => b.id === plan.id_bloc);
   const lot = projectLots.find(l => l.id === plan.id_lot);
   const sousLot = lot?.sousLots.find(sl => sl.id === plan.id_souslot);
   const creator = Array.isArray(allUsers) ? allUsers.find(u => u.id === plan.id_createur)?.username : '?';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Détails: ${plan.reference}`}>
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2"> {/* Hauteur modale augmentée */}
         {/* Détails du Plan */}
         <div className="pb-4 border-b dark:border-gray-700">
             <h4 className="font-semibold mb-2 text-lg">Informations Générales</h4>
             <p className="text-sm"><strong>Titre:</strong> {plan.titre}</p>
             <p className="text-sm"><strong>Référence:</strong> {plan.reference}</p>
             <p className="text-sm"><strong>Statut:</strong> {plan.statut}</p>
             <p className="text-sm"><strong>Bloc:</strong> {bloc?.nom || '?'} ({bloc?.abreviation || '?'})</p>
             <p className="text-sm"><strong>Lot:</strong> {lot?.nom || '?'} ({lot?.abreviation || '?'})</p>
             {sousLot && <p className="text-sm"><strong>Sous-Lot:</strong> {sousLot.nom} ({sousLot.abreviation})</p>}
             <p className="text-sm"><strong>Créé le:</strong> {plan.date_creation} par {creator}</p>
             <p className="text-sm">
                <strong>Fichier:</strong> 
                {plan.fichier_pdf?.startsWith('http') ? (
                   <a href={plan.fichier_pdf} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1"> {plan.fichier_pdf} <ExternalLink className="w-3 h-3 inline-block ml-1"/></a>
                ) : (
                   <span className="ml-1">{plan.fichier_pdf || 'Aucun'}</span>
                )}
             </p>
         </div>
         {/* Historique des Révisions */}
         <div>
            <h4 className="font-semibold mb-2 text-lg">Historique des Révisions</h4>
             {plan.historique && plan.historique.length > 0 ? ( 
              plan.historique
                .slice() 
                .sort((a, b) => new Date(b.date) - new Date(a.date)) 
                .map((rev, index) => (
                  <div key={index} className="pb-4 border-b dark:border-gray-700 last:border-b-0 mb-4 last:mb-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-md text-blue-600 dark:text-blue-400">{rev.version}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{rev.date}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Par: <span className="font-medium">{rev.utilisateur || 'N/A'}</span></p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">{rev.commentaire || <span className="italic">Aucun commentaire</span>}</p>
                  </div>
                ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">Aucun historique de révision pour ce plan.</p>
            )}
         </div>
      </div>
       <div className="flex justify-end pt-4 mt-4 border-t dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Fermer
        </button>
      </div>
    </Modal>
  );
};


// Page Plans (avec CUD partiel et modals info/révision)
// ... (Identique, sauf alertes pour exports)
const PlansPage = ({ selectedProject, allPlans, setAllPlans, allBlocks, allLots, currentUser, allUsers }) => { 
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPlanInfoModalOpen, setIsPlanInfoModalOpen] = useState(false); 
  const [selectedPlanForInfo, setSelectedPlanForInfo] = useState(null); 
  const [editingPlan, setEditingPlan] = useState(null); 
  const [isAddRevisionModalOpen, setIsAddRevisionModalOpen] = useState(false); 
  const [planToRevise, setPlanToRevise] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(''); 

  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';
  const { projectId } = useParams(); 

  // Vérification de sécurité et de validité
  if (!projectId || !selectedProject || selectedProject.id !== projectId) {
     console.error("PlansPage: ProjectId invalide ou selectedProject non synchronisé", {projectId, selectedProject});
     return <Navigate to="/select-project" replace />; 
  }
  
  // Utiliser allPlans/allBlocks/allLots reçus en props et les filtrer
  // CORRECTION: Vérifier que allBlocks/allLots sont bien des arrays avant de filtrer
  const projectPlansBase = useMemo(() => Array.isArray(allPlans) ? allPlans.filter(p => p.id_projet === projectId) : [], [allPlans, projectId]);
  const projectBlocks = useMemo(() => Array.isArray(allBlocks) ? allBlocks.filter(b => b.id_projet === projectId) : [], [allBlocks, projectId]);
  const projectLots = useMemo(() => Array.isArray(allLots) ? allLots.filter(l => l.id_projet === projectId) : [], [allLots, projectId]);

  const projectPlans = useMemo(() => {
    if (!searchTerm) return projectPlansBase;
    const lowerSearchTerm = searchTerm.toLowerCase();
    return projectPlansBase.filter(plan => {
      const bloc = projectBlocks.find(b => b.id === plan.id_bloc);
      const lot = projectLots.find(l => l.id === plan.id_lot);
      return (
        plan.titre?.toLowerCase().includes(lowerSearchTerm) ||
        plan.reference?.toLowerCase().includes(lowerSearchTerm) ||
        bloc?.abreviation?.toLowerCase().includes(lowerSearchTerm) ||
        lot?.abreviation?.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [projectPlansBase, searchTerm, projectBlocks, projectLots]);


  const openPlanModalToCreate = () => { setEditingPlan(null); setIsPlanModalOpen(true); };
  const openPlanModalToEdit = (plan) => { setEditingPlan(plan); setIsPlanModalOpen(true); }; 
  const closePlanModal = () => { setIsPlanModalOpen(false); setEditingPlan(null); };
  
  const openPlanInfoModal = (plan) => { setSelectedPlanForInfo(plan); setIsPlanInfoModalOpen(true); };
  const closePlanInfoModal = () => { setIsPlanInfoModalOpen(false); setSelectedPlanForInfo(null); };

  const openAddRevisionModal = (plan) => { setPlanToRevise(plan); setIsAddRevisionModalOpen(true); };
  const closeAddRevisionModal = () => { setIsAddRevisionModalOpen(false); setPlanToRevise(null); };
  
  const handleSavePlan = (planData) => { 
    if (editingPlan) {
       // Modification (simplifiée pour titre, statut, fichier)
       setAllPlans(prevPlans => prevPlans.map(p => p.id === editingPlan.id ? { ...p, titre: planData.titre, statut: planData.statut, fichier_pdf: planData.fichier_pdf } : p));
    } else {
      // Création
      const newPlan = { ...planData, id: 'pl' + Date.now() };
      setAllPlans(prevPlans => [...prevPlans, newPlan]);
    }
    closePlanModal();
  };
  
   const handleDeletePlan = (planId) => { 
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce plan et tout son historique ?")) {
      setAllPlans(prevPlans => prevPlans.filter(p => p.id !== planId));
    }
   };
   
   const handleSaveRevision = (revisionData) => {
      setAllPlans(prevPlans => prevPlans.map(p => {
          if (p.id === planToRevise.id) {
              const nextRevisionNum = p.revision + 1;
              const nextRevisionStr = String(nextRevisionNum).padStart(2, '0');
              const baseReference = p.reference.substring(0, p.reference.lastIndexOf('-R') + 2); 
              const newReference = `${baseReference}${nextRevisionStr}`;
              const newHistoryEntry = {
                  version: `R${nextRevisionStr}`,
                  date: new Date().toISOString().split('T')[0],
                  utilisateur: currentUser.username,
                  commentaire: revisionData.commentaire || 'Nouvelle révision'
              };
              return {
                  ...p,
                  reference: newReference,
                  revision: nextRevisionNum,
                  fichier_pdf: revisionData.fichier_pdf, 
                  historique: [...p.historique, newHistoryEntry],
                  statut: "En cours d'approbation" 
              };
          }
          return p;
      }));
      closeAddRevisionModal();
   };

  const getStatusIcon = (statut) => { /* ... Identique ... */ 
    switch (statut) {
      case 'Approuvé CTC': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "En cours d'approbation": return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Déposé au MO': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'Obsolète': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };
  
  // Fonction pour gérer le clic sur le lien PDF/local
  const handlePdfLinkClick = (e, plan) => {
      if (plan.fichier_pdf && !plan.fichier_pdf.startsWith('http')) {
          e.preventDefault();
          // Message plus informatif pour les fichiers locaux simulés
          alert(`Ceci est une simulation de fichier local: ${plan.fichier_pdf}\n\nDans la version réelle, ce fichier serait ouvert ou téléchargé.`);
      }
      // Si c'est un lien http, le comportement par défaut (target="_blank") fonctionnera
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Plans pour : {selectedProject.nom}</h1>
        {isAdmin && (
          // CORRECTION: Assurer que le bouton ouvre bien le modal
          <button onClick={openPlanModalToCreate} 
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5 mr-2" /> Nouveau Plan
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Filtrer par titre, réf, bloc, lot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
         {/* NOUVEAU: onClick ajouté */}
         <button onClick={() => alert("Fonctionnalité d'exportation PDF bientôt disponible.")} className="flex items-center px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700">
           <Download className="w-4 h-4 mr-1"/> PDF
         </button>
         <button onClick={() => alert("Fonctionnalité d'exportation Excel bientôt disponible.")} className="flex items-center px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700">
           <Download className="w-4 h-4 mr-1"/> Excel
         </button>
         <button onClick={() => alert("Fonctionnalité d'exportation Word bientôt disponible.")} className="flex items-center px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
           <Download className="w-4 h-4 mr-1"/> Word
         </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
             <tr>
              <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider">Référence</th>
              <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider">Infos</th>
              <th className="px-6 py-3 text-left text-xs font-medium dark:text-gray-300 uppercase tracking-wider">Dernière MàJ</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projectPlans.map((plan) => {
               // Utilisation des listes déjà filtrées pour le projet
               const bloc = projectBlocks.find(b => b.id === plan.id_bloc);
               const lot = projectLots.find(l => l.id === plan.id_lot);
               const lastRevision = plan.historique && plan.historique.length > 0 ? plan.historique[plan.historique.length - 1] : null;
               // CORRECTION: S'assurer que allUsers existe avant de chercher le créateur
               const creator = Array.isArray(allUsers) ? allUsers.find(u=> u.id === plan.id_createur) : null; 
               const isLink = typeof plan.fichier_pdf === 'string' && plan.fichier_pdf.startsWith('http');
               const hasFile = plan.fichier_pdf && plan.fichier_pdf !== 'aucun'; // Vérifie si un fichier/lien existe

               return (
                  <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(plan.statut)}
                        <span className="text-sm font-medium dark:text-gray-100">{plan.statut}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold dark:text-gray-100">{plan.reference}</div>
                       {/* MODIFIÉ: Logique affichage fichier/lien */}
                       {hasFile && isLink ? (
                         <a href={plan.fichier_pdf} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline truncate block" title={plan.fichier_pdf}>Lien <ExternalLink className="w-3 h-3 inline"/></a>
                       ) : hasFile ? (
                           <span className="text-sm text-gray-500 dark:text-gray-400 truncate block" title={plan.fichier_pdf}>{plan.fichier_pdf}</span>
                       ) : (
                           <span className="text-sm text-gray-400 italic">Aucun fichier</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-sm dark:text-gray-300 whitespace-pre-wrap max-w-xs">{plan.titre}</td> 
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-400">
                      <div><span className="font-semibold">Bloc:</span> {bloc?.abreviation || 'N/A'}</div>
                      <div><span className="font-semibold">Lot:</span> {lot?.abreviation || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-400">
                      <div>{lastRevision ? lastRevision.date : plan.date_creation}</div>
                      <div className="text-xs text-gray-500">
                        {lastRevision ? `par ${lastRevision.utilisateur}` : `par ${creator?.username || '?'}`}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1"> 
                      <button onClick={() => openPlanInfoModal(plan)} title="Voir Détails & Historique"
                         className="p-1.5 text-cyan-600 dark:text-cyan-400 rounded hover:bg-cyan-100 dark:hover:bg-gray-700">
                         <Info className="w-4 h-4" /> 
                      </button>
                      {isAdmin && (
                        <>
                        <button onClick={() => openPlanModalToEdit(plan)} title="Modifier" 
                           className="p-1.5 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-gray-700">
                           <Edit2 className="w-4 h-4" />
                         </button>
                        <button onClick={() => openAddRevisionModal(plan)} title="Ajouter Révision"
                           className="p-1.5 text-indigo-600 dark:text-indigo-400 rounded hover:bg-indigo-100 dark:hover:bg-gray-700">
                           <FileDiff className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDeletePlan(plan.id)} title="Supprimer"
                           className="p-1.5 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-gray-700">
                           <Trash2 className="w-4 h-4" />
                         </button>
                        </>
                      )}
                      <button onClick={() => navigator.clipboard.writeText(plan.reference)} title="Copier Référence"
                        className="p-1.5 text-gray-500 dark:text-gray-400 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Copy className="w-4 h-4" />
                      </button>
                       {/* MODIFIÉ: Gestion du clic sur fichier local/lien */}
                       <a href={isLink ? plan.fichier_pdf : "#"} 
                          target={isLink ? "_blank" : ""} 
                          rel={isLink ? "noopener noreferrer" : ""} 
                          onClick={(e) => handlePdfLinkClick(e, plan)} 
                          title={hasFile ? "Voir PDF" : "Aucun PDF"}
                         className={`p-1.5 inline-block rounded ${hasFile ? 'text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-gray-700' : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'}`}>
                         <ExternalLink className="w-4 h-4" />
                       </a>
                    </td>
                  </tr>
               );
            })}
             {projectPlans.length === 0 && (
                <tr>
                   <td colSpan="6" className="text-center py-10 text-gray-500 dark:text-gray-400">Aucun plan trouvé pour ce projet {searchTerm ? 'avec ces filtres' : ''}.</td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
      
       {/* Modal Création/Modification Plan */}
       <Modal isOpen={isPlanModalOpen} onClose={closePlanModal} title={editingPlan ? "Modifier le Plan" : "Créer Nouveau Plan"}>
         <PlanForm 
           plan={editingPlan} 
           selectedProject={selectedProject}
           allBlocks={projectBlocks} 
           allLots={projectLots}     
           allPlans={allPlans} // Passer allPlans ici
           onSave={handleSavePlan} 
           onCancel={closePlanModal}
           currentUser={currentUser}
         />
       </Modal>
       
       {/* MODIFIÉ: Utilisation PlanInfoModal */}
       <PlanInfoModal 
         isOpen={isPlanInfoModalOpen} 
         onClose={closePlanInfoModal} 
         plan={selectedPlanForInfo}
         allUsers={allUsers} 
         projectBlocks={projectBlocks} 
         projectLots={projectLots}
       />
       
       {/* Modal Ajout Révision */}
       <Modal isOpen={isAddRevisionModalOpen} onClose={closeAddRevisionModal} title={`Ajouter Révision à ${planToRevise?.reference.split('-R')[0]}-R${String((planToRevise?.revision || 0) + 1).padStart(2,'0')}`}>
          <RevisionForm 
             plan={planToRevise}
             onSave={handleSaveRevision}
             onCancel={closeAddRevisionModal}
             currentUser={currentUser}
          />
       </Modal>
    </div>
  );
};


// Modal Générique (largeur augmentée)
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      {/* MODIFIÉ: max-w-2xl */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"> 
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* MODIFIÉ: Suppression de la hauteur max interne, comptant sur celle du parent */}
        <div className="p-6 overflow-y-auto"> 
          {children}
        </div>
      </div>
    </div>
  );
};

// Formulaire Blocs (avec abréviation auto)
// ... (Identique)
const BlockForm = ({ block, onSave, onCancel }) => {
  const [nom, setNom] = useState(block ? block.nom : '');
  const [abreviation, setAbreviation] = useState(block ? block.abreviation : generateAbbreviation(nom));
  const [autoAbrev, setAutoAbrev] = useState(block ? block.abreviation : generateAbbreviation(nom));

  useEffect(() => {
    const newAbrev = generateAbbreviation(nom);
    if (!abreviation || abreviation === autoAbrev) {
      setAbreviation(newAbrev);
    }
    setAutoAbrev(newAbrev);
  }, [nom]);

   useEffect(() => { // Pour préremplir en édition
      if (block) {
         setNom(block.nom);
         setAbreviation(block.abreviation);
         setAutoAbrev(block.abreviation);
      } else { // Réinitialiser si création
          setNom('');
          setAbreviation('');
          setAutoAbrev('');
      }
   }, [block]);


  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...block, 
      nom,
      abreviation: abreviation.toUpperCase(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="block-nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du Bloc</label>
        <input type="text" id="block-nom" value={nom} onChange={(e) => setNom(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700" />
      </div>
      <div>
        <label htmlFor="block-abreviation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Abréviation</label>
        <input type="text" id="block-abreviation" value={abreviation} onChange={(e) => setAbreviation(e.target.value.toUpperCase())} required maxLength="4"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 uppercase" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Générée automatiquement, modifiable (max 4 lettres).</p>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"> Annuler </button>
        <button type="submit"
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" /> Enregistrer </button>
      </div>
    </form>
  );
};


// Page Blocs
// ... (Identique)
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
 // CORRECTION: Assurer que allBlocks est un array
 const projectBlocks = useMemo(() => Array.isArray(allBlocks) ? allBlocks.filter(b => b.id_projet === projectId) : [], [allBlocks, projectId]);


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
             {projectBlocks.length === 0 && (
                <tr>
                   <td colSpan={isAdmin ? 3 : 2} className="text-center py-10 text-gray-500 dark:text-gray-400">Aucun bloc trouvé pour ce projet.</td>
                </tr>
             )}
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

// Formulaire Lots (avec abréviation auto)
// ... (Identique)
const LotForm = ({ lot, onSave, onCancel }) => {
  const [nom, setNom] = useState(lot ? lot.nom : '');
  const [abreviation, setAbreviation] = useState(lot ? lot.abreviation : generateAbbreviation(nom));
  const [autoAbrev, setAutoAbrev] = useState(lot ? lot.abreviation : generateAbbreviation(nom));
  const [ctc, setCtc] = useState(lot ? lot.ctc_approbation : false);
  const [sousLots, setSousLots] = useState(lot ? lot.sousLots : []);
  const [newSousLotNom, setNewSousLotNom] = useState('');
  const [newSousLotAbrev, setNewSousLotAbrev] = useState('');
  
   useEffect(() => {
    const newAbrev = generateAbbreviation(nom);
    if (!abreviation || abreviation === autoAbrev) {
      setAbreviation(newAbrev);
    }
    setAutoAbrev(newAbrev);
  }, [nom]);
  
   useEffect(() => { // Préremplissage édition
      if (lot) {
         setNom(lot.nom);
         setAbreviation(lot.abreviation);
         setAutoAbrev(lot.abreviation);
         setCtc(lot.ctc_approbation);
         setSousLots(lot.sousLots);
      } else { // Réinitialiser si création
          setNom('');
          setAbreviation('');
          setAutoAbrev('');
          setCtc(false);
          setSousLots([]);
      }
   }, [lot]);

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
      ...lot, 
      nom,
      abreviation: abreviation.toUpperCase(),
      ctc_approbation: ctc,
      sousLots: sousLots
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2"> {/* Hauteur modale augmentée */}
      <div>
        <label htmlFor="lot-nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du Lot</label>
        <input type="text" id="lot-nom" value={nom} onChange={(e) => setNom(e.target.value)} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700" />
      </div>
      <div>
        <label htmlFor="lot-abreviation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Abréviation</label>
        <input type="text" id="lot-abreviation" value={abreviation} onChange={(e) => setAbreviation(e.target.value.toUpperCase())} required maxLength="4"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 uppercase" />
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Générée automatiquement, modifiable (max 4 lettres).</p>
      </div>
      <div className="flex items-center">
        <input type="checkbox" id="lot-ctc" checked={ctc} onChange={(e) => setCtc(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
        <label htmlFor="lot-ctc" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Soumis à approbation CTC</label>
      </div>
      
      {/* Gestion des Sous-Lots */}
      <div className="space-y-2 pt-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sous-Lots</label>
        {sousLots.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto border dark:border-gray-600 rounded-md p-2"> {/* Hauteur sous-lots augmentée */}
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
            <input type="text" value={newSousLotNom} onChange={(e) => setNewSousLotNom(e.target.value)}
              className="mt-1 block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700" placeholder="Ex: Courants Forts" />
          </div>
          <div className="w-1/3">
            <label className="text-xs text-gray-500">Abrev. sous-lot</label>
            <input type="text" value={newSousLotAbrev} onChange={(e) => setNewSousLotAbrev(e.target.value.toUpperCase())} maxLength="4"
              className="mt-1 block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 uppercase" placeholder="Ex: CF" />
          </div>
          <button type="button" onClick={handleAddSousLot} className="p-2 text-white bg-green-600 rounded-md hover:bg-green-700">
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"> Annuler </button>
        <button type="submit"
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" /> Enregistrer </button>
      </div>
    </form>
  );
};


// Page Lots
// ... (Identique)
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
  
  // CORRECTION: Assurer que allLots est un array
  const projectLots = useMemo(() => Array.isArray(allLots) ? allLots.filter(l => l.id_projet === projectId) : [], [allLots, projectId]);


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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce lot et ses sous-lots ?")) {
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
             {projectLots.length === 0 && (
                <tr>
                   <td colSpan={isAdmin ? 4 : 3} className="text-center py-10 text-gray-500 dark:text-gray-400">Aucun lot trouvé pour ce projet.</td>
                </tr>
             )}
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

// SUPPRIMÉ: Page Révisions

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
          {/* Ne permet pas de créer/modifier un Gérant Principal via le formulaire */}
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
// ... (Identique)
const UsersPage = ({ currentUser, allUsers, setAllUsers }) => { 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';

  // NOTE: La redirection est gérée par AdminLayoutWrapper
  
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
      // Vérifier si l'identifiant existe déjà
      if (allUsers.some(u => u.username === userData.username)) {
         alert("Erreur: Cet identifiant existe déjà.");
         return; // Arrêter la sauvegarde
      }
      const newUser = {
        ...userData,
        id: 'u' + Date.now(), 
      };
      setAllUsers([...allUsers, newUser]);
    }
    closeModal();
  };

  const handleDelete = (userId) => {
     const userToDelete = allUsers.find(u => u.id === userId);
     if (!userToDelete) return;
     // Vérification supplémentaire (ne devrait pas arriver car bouton désactivé)
     if (userToDelete.role === 'Gérant principal') {
        alert("Impossible de supprimer le Gérant Principal.");
        return;
     }
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete.username}" ?`)) {
      setAllUsers(allUsers.filter(u => u.id !== userId));
      // TODO: Vérifier si cet utilisateur était responsable de projets et les réassigner ou marquer comme non assigné
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
                    className="text-blue-600 dark:text-blue-400 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={user.role === 'Gérant principal'} 
                    title={user.role === 'Gérant principal' ? "Modification non autorisée" : "Modifier"}
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 dark:text-red-400 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={user.role === 'Gérant principal'} 
                     title={user.role === 'Gérant principal' ? "Suppression non autorisée" : "Supprimer"}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
             {allUsers.length === 0 && (
                <tr>
                   <td colSpan="3" className="text-center py-10 text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé.</td>
                </tr>
             )}
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

// --- Formulaire Plan ---
const PlanForm = ({ plan, selectedProject, allBlocks, allLots, allPlans, onSave, onCancel, currentUser }) => {
    const [titre, setTitre] = useState(plan ? plan.titre : '');
    const [idBloc, setIdBloc] = useState(plan ? plan.id_bloc : '');
    const [idLot, setIdLot] = useState(plan ? plan.id_lot : '');
    const [idSousLot, setIdSousLot] = useState(plan ? plan.id_souslot : '');
    const [statut, setStatut] = useState(plan ? plan.statut : "En cours d'approbation");
    const [fichier, setFichier] = useState(plan ? plan.fichier_pdf : null); 
    const [commentaire, setCommentaire] = useState(''); 

    // Utilise les listes filtrées passées en props
    const projectBlocks = allBlocks || []; 
    const projectLots = allLots || [];   
    const selectedLot = useMemo(() => projectLots.find(l => l.id === idLot), [projectLots, idLot]);
    const sousLotsDisponibles = useMemo(() => selectedLot?.sousLots || [], [selectedLot]);

    useEffect(() => { 
        if (plan) {
            setTitre(plan.titre);
            setIdBloc(plan.id_bloc);
            setIdLot(plan.id_lot);
            setIdSousLot(plan.id_souslot);
            setStatut(plan.statut);
            setFichier(plan.fichier_pdf); 
        } else { 
             setTitre(''); setIdBloc(''); setIdLot(''); setIdSousLot('');
             setStatut("En cours d'approbation"); setFichier(null); setCommentaire('');
        }
    }, [plan]);


    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (plan) { // Modification (simplifiée pour titre, statut, fichier)
           const planData = {
               ...plan,
               titre,
               statut,
               fichier_pdf: fichier instanceof File ? `sim-${fichier.name}` : (fichier || plan.fichier_pdf || 'aucun'),
           };
          onSave(planData);
      } else { // Création
          if (!idBloc || !idLot) {
            alert("Veuillez sélectionner un Bloc et un Lot.");
            return;
          }
          // --- Génération référence ---
          // CORRECTION: Assurer que allPlans est un array avant de filtrer
          const plansInContext = (Array.isArray(allPlans) ? allPlans : []).filter(p => 
            p.id_projet === selectedProject.id && 
            p.id_bloc === idBloc && 
            p.id_lot === idLot
          );
          const nextNumero = plansInContext.length > 0 ? Math.max(0, ...plansInContext.map(p => p.numero || 0)) + 1 : 1;
          const numeroStr = String(nextNumero).padStart(3, '0');
          const projAbrev = selectedProject.abreviation || 'PROJ';
          const blocAbrev = projectBlocks.find(b => b.id === idBloc)?.abreviation || 'BLOC'; 
          const lotAbrev = projectLots.find(l => l.id === idLot)?.abreviation || 'LOT';
          const reference = `${projAbrev}-${blocAbrev}-${lotAbrev}-${numeroStr}-R00`;
          const initialHistorique = [{
              version: 'R00',
              date: new Date().toISOString().split('T')[0],
              utilisateur: currentUser.username,
              commentaire: commentaire || 'Création initiale'
          }];

          const planData = {
              id_projet: selectedProject.id,
              titre, id_bloc: idBloc, id_lot: idLot, id_souslot: idSousLot || null, 
              statut,
              fichier_pdf: fichier instanceof File ? `sim-${fichier.name}` : (fichier || 'aucun'), 
              reference, numero: nextNumero, revision: 0, 
              date_creation: new Date().toISOString().split('T')[0], 
              id_createur: currentUser.id, 
              historique: initialHistorique, 
          };
          onSave(planData);
      }
    };

    // Simule la sélection de fichier OU la saisie d'un lien
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFichier(e.target.files[0]);
        }
    };
    const handleLinkChange = (e) => {
        setFichier(e.target.value); // Stocke l'URL comme string
    };


    return (
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2"> {/* Hauteur modale augmentée */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre / Description</label>
          <textarea value={titre} onChange={(e) => setTitre(e.target.value)} required rows="3"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700" />
        </div>
        
        {!plan && ( // Masquer sélection bloc/lot en modification pour éviter incohérence référence
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bloc</label>
              <select value={idBloc} onChange={(e) => setIdBloc(e.target.value)} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700">
                <option value="">-- Sélectionner Bloc --</option>
                {projectBlocks.map(b => <option key={b.id} value={b.id}>{b.nom} ({b.abreviation})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lot</label>
              <select value={idLot} onChange={(e) => {setIdLot(e.target.value); setIdSousLot('');}} required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700">
                <option value="">-- Sélectionner Lot --</option>
                {projectLots.map(l => <option key={l.id} value={l.id}>{l.nom} ({l.abreviation})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sous-Lot (Optionnel)</label>
              <select value={idSousLot} onChange={(e) => setIdSousLot(e.target.value)} disabled={sousLotsDisponibles.length === 0}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-600">
                <option value="">-- Aucun --</option>
                {sousLotsDisponibles.map(sl => <option key={sl.id} value={sl.id}>{sl.nom} ({sl.abreviation})</option>)}
              </select>
            </div>
          </div>
        )}
        {plan && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
             <p><strong>Référence:</strong> {plan.reference}</p>
             <p><strong>Bloc:</strong> {projectBlocks.find(b=>b.id === plan.id_bloc)?.abreviation || '?'}</p>
             <p><strong>Lot:</strong> {projectLots.find(l=>l.id === plan.id_lot)?.abreviation || '?'}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
          <select value={statut} onChange={(e) => setStatut(e.target.value)} required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700">
            <option value="En cours d'approbation">En cours d'approbation</option>
            <option value="Approuvé CTC">Approuvé CTC</option>
            <option value="Déposé au MO">Déposé au MO</option>
            <option value="Obsolète">Obsolète</option>
          </select>
        </div>

        {/* MODIFIÉ: Champ Fichier OU Lien */}
        <div>
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fichier PDF {plan ? `(Actuel: ${plan.fichier_pdf || 'aucun'})` : '(R00)'}</label>
           <div className="mt-1 flex items-center space-x-2">
              <label htmlFor="file-upload-plan" className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                 <Upload className="w-4 h-4 mr-2"/> {plan ? "Remplacer" : "Choisir"}
              </label>
              <input id="file-upload-plan" name="file-upload-plan" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf"/>
              <span className="text-sm text-gray-500">OU</span>
              <input type="url" placeholder="Coller lien Google Drive..." value={typeof fichier === 'string' && fichier.startsWith('http') ? fichier : ''} onChange={handleLinkChange}
                className="flex-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm" />
           </div>
           {fichier instanceof File && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Fichier sélectionné: {fichier.name}</p>}
           {typeof fichier === 'string' && fichier.startsWith('http') && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Lien Google Drive: {fichier}</p>}
           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choisissez un fichier OU collez un lien.</p>
        </div>
        
         {!plan && ( 
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Commentaire Initial (Optionnel)</label>
              <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} rows="2"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"
                placeholder="Ex: Version initiale pour approbation CTC"
               />
            </div>
         )}

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            Annuler
          </button>
          <button type="submit"
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {plan ? "Mettre à jour" : "Créer Plan (R00)"} 
          </button>
        </div>
      </form>
    );
};

// Formulaire Ajout Révision
const RevisionForm = ({ plan, onSave, onCancel, currentUser }) => {
    const [fichier, setFichier] = useState(null); 
    const [commentaire, setCommentaire] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fichier) {
            alert("Veuillez sélectionner un fichier PDF ou coller un lien pour la nouvelle révision.");
            return;
        }
        onSave({
            fichier_pdf: fichier instanceof File ? `sim-${fichier.name}` : fichier, // Stocke nom simulé ou URL
            commentaire: commentaire || 'Nouvelle révision',
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFichier(e.target.files[0]);
        }
    };
     const handleLinkChange = (e) => {
        setFichier(e.target.value); 
    };

    if (!plan) return null; 

    const nextRevisionNum = (plan.revision || 0) + 1;
    const nextRevisionStr = String(nextRevisionNum).padStart(2, '0');

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2"> {/* Hauteur modale augmentée */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Ajout révision <strong className="text-indigo-600 dark:text-indigo-400">R{nextRevisionStr}</strong> pour <strong className="dark:text-gray-100">{plan.reference.split('-R')[0]}</strong>.
            </p>
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nouveau Fichier PDF (R{nextRevisionStr})</label>
               <div className="mt-1 flex items-center space-x-2">
                 <label htmlFor="file-upload-revision" className="cursor-pointer inline-flex items-center px-3 py-2 border dark:border-gray-600 rounded-md shadow-sm text-sm font-medium dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <Upload className="w-4 h-4 mr-2"/> Choisir
                 </label>
                 <input id="file-upload-revision" name="file-upload-revision" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" />
                 <span className="text-sm text-gray-500">OU</span>
                 <input type="url" placeholder="Coller lien Google Drive..." value={typeof fichier === 'string' && fichier.startsWith('http') ? fichier : ''} onChange={handleLinkChange}
                   className="flex-1 block w-full px-3 py-2 border dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm" />
               </div>
               {fichier instanceof File && <p className="text-xs text-green-600 dark:text-green-400 mt-1">Fichier: {fichier.name}</p>}
               {typeof fichier === 'string' && fichier.startsWith('http') && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Lien: {fichier}</p>}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choisissez un fichier OU collez un lien.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Commentaire (Optionnel)</label>
              <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700"
                placeholder={`Commentaire pour la révision R${nextRevisionStr}...`}
               />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-600 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"> Annuler </button>
              <button type="submit"
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700">
                <FileDiff className="w-4 h-4 mr-2" /> Ajouter Révision R{nextRevisionStr} </button>
            </div>
        </form>
    );
};

