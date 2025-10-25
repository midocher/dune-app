import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Layers, 
  FileText, 
  Settings, 
  Users, 
  Building, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  MoreVertical, 
  File, 
  Search, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  User, 
  Moon, 
  Sun,
  ShieldCheck,
  MapPin,
  Calendar,
  BarChart2,
  PieChart,
  List,
  Grid,
  Edit2,
  Trash2,
  FileUp,
  History,
  AlertCircle,
  CheckCircle,
  Package,
  FileArchive,
  BookMarked
} from 'lucide-react';

// --- CONTEXTE POUR L'APPLICATION (Thème, Authentification) ---

// Contexte pour le thème (Clair/Sombre)
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('dune-theme') || 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('dune-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const useTheme = () => useContext(ThemeContext);

// Contexte pour l'authentification
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username: 'gerant', role: 'Gérant principal' }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Définir l'URL de base de l'API
  // IMPORTANT : Ceci sera remplacé par l'URL de Render à la Phase 5
  const API_BASE_URL = 'http://localhost:4000/api/v1';

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Identifiant ou mot de passe incorrect');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      // Simuler la sauvegarde du token
      localStorage.setItem('dune-token', data.token);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dune-token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, logout, API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// --- COMPOSANTS DE L'INTERFACE UTILISATEUR (UI) ---

/**
 * Composant de Connexion
 */
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <div className="p-3 mb-4 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full">
            <BookMarked className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            DUNE
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Gestion des Projets et Plans Techniques
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Identifiant
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md group hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Composant principal de l'application (Layout)
 */
function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar (Mobile) */}
      <MobileSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} setCurrentPage={setCurrentPage} />

      {/* Sidebar (Desktop) */}
      <DesktopSidebar setCurrentPage={setCurrentPage} currentPage={currentPage} />

      {/* Contenu principal */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <MainContent currentPage={currentPage} />
      </div>
    </div>
  );
}

/**
 * Header (Barre supérieure)
 */
function Header({ setSidebarOpen }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700">
      <button
        className="px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Ouvrir le menu</span>
        <Menu className="w-6 h-6" />
      </button>
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex items-center">
          <div className="relative w-full max-w-md text-gray-400 focus-within:text-gray-600">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              className="block w-full h-full py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 bg-white border-transparent rounded-md dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-transparent focus:placeholder-gray-400 sm:text-sm"
              placeholder="Rechercher un projet, un plan..."
              type="search"
            />
          </div>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <button
            onClick={toggleTheme}
            className="p-1 text-gray-400 rounded-full hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800"
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>

          {/* Menu Utilisateur */}
          <div className="ml-3 relative">
            <div>
              <button className="max-w-xs bg-white dark:bg-gray-800 flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800">
                <span className="sr-only">Ouvrir le menu utilisateur</span>
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
              </button>
            </div>
            {/* Dropdown Menu (à implémenter)
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                ...
              </div>
            */}
          </div>
          <button
            onClick={logout}
            title="Se déconnecter"
            className="ml-4 p-1 text-gray-400 rounded-full hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Sidebar (Mobile)
 */
function MobileSidebar({ sidebarOpen, setSidebarOpen, setCurrentPage }) {
  return (
    <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
      {/* Overlay */}
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
      
      {/* Contenu Sidebar */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800 dark:bg-gray-900">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Fermer le menu</span>
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        <SidebarContent setCurrentPage={setCurrentPage} />
      </div>
      <div className="flex-shrink-0 w-14"></div>
    </div>
  );
}

/**
 * Sidebar (Desktop)
 */
function DesktopSidebar({ setCurrentPage, currentPage }) {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800 dark:bg-gray-900">
          <SidebarContent setCurrentPage={setCurrentPage} currentPage={currentPage} />
        </div>
      </div>
    </div>
  );
}

/**
 * Contenu commun des Sidebars
 */
function SidebarContent({ setCurrentPage, currentPage }) {
  const { user } = useAuth();
  
  const navItems = [
    { name: 'Tableau de bord', icon: LayoutDashboard, page: 'dashboard', roles: ['Gérant principal', 'Administrateur secondaire', 'Ingénieur de suivi', 'Visiteur'] },
    { name: 'Projets', icon: Briefcase, page: 'projects', roles: ['Gérant principal', 'Administrateur secondaire', 'Ingénieur de suivi', 'Visiteur'] },
    { name: 'Plans', icon: FileText, page: 'plans', roles: ['Gérant principal', 'Administrateur secondaire', 'Ingénieur de suivi', 'Visiteur'] },
    { name: 'Lots & Blocs', icon: Layers, page: 'lots', roles: ['Gérant principal', 'Administrateur secondaire'] },
    { name: 'Utilisateurs', icon: Users, page: 'users', roles: ['Gérant principal', 'Administrateur secondaire'] },
    { name: 'Paramètres', icon: Settings, page: 'settings', roles: ['Gérant principal'] },
  ];
  
  const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <div className="p-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-lg">
          <BookMarked className="w-8 h-8 text-white" />
        </div>
        <h1 className="ml-3 text-2xl font-bold text-white">DUNE</h1>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {filteredNavItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setCurrentPage(item.page)}
            className={`
              ${currentPage === item.page
                ? 'bg-gray-900 dark:bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white'}
              group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full
            `}
          >
            <item.icon className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" />
            {item.name}
          </button>
        ))}
      </nav>
      <div className="flex-shrink-0 flex border-t border-gray-700 dark:border-gray-800 p-4">
        <div className="flex-shrink-0 group block">
          <div className="flex items-center">
            <div>
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                {user?.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs font-medium text-gray-400 group-hover:text-gray-300">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Conteneur du Contenu Principal
 */
function MainContent({ currentPage }) {
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'plans':
        return <PlansPage />;
      case 'lots':
        return <LotsBlocsPage />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <main className="flex-1 relative overflow-y-auto focus:outline-none">
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {renderPage()}
      </div>
    </main>
  );
}

// --- PAGES DE L'APPLICATION ---

/**
 * Page: Tableau de bord
 */
function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Projets Actifs" value="12" icon={Briefcase} color="bg-blue-500" />
        <StatCard title="Plans Approuvés CTC" value="185" icon={ShieldCheck} color="bg-green-500" />
        <StatCard title="Plans en Attente" value="32" icon={AlertCircle} color="bg-yellow-500" />
        <StatCard title="Utilisateurs" value="8" icon={Users} color="bg-purple-500" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-5 mt-6 lg:grid-cols-2">
        <ChartCard title="Statut des Projets">
          <PieChart className="w-full h-64 text-gray-400" />
          <p className="text-center text-gray-500 dark:text-gray-400">Graphique (Camembert)</p>
        </ChartCard>
        <ChartCard title="Révisions par mois">
          <BarChart2 className="w-full h-64 text-gray-400" />
          <p className="text-center text-gray-500 dark:text-gray-400">Graphique (Barres)</p>
        </ChartCard>
      </div>
      
      {/* Projets Récents */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Projets Récents</h2>
        <div className="mt-4 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Simuler des données */}
            <li className="px-6 py-4 flex items-center justify-between">
              <span className="font-medium dark:text-white">PROJET PILOTE DUNE (DUNE)</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">En Étude</span>
            </li>
            <li className="px-6 py-4 flex items-center justify-between">
              <span className="font-medium dark:text-white">TOUR CÔTIÈRE ORAN (TCO)</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">En Exécution</span>
            </li>
            <li className="px-6 py-4 flex items-center justify-between">
              <span className="font-medium dark:text-white">LOGEMENTS OPGI (OPGI-ALG)</span>
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">Achevé</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 p-3 rounded-md ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
              <dd className="text-3xl font-bold text-gray-900 dark:text-white">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-5">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Page: Projets
 */
function ProjectsPage() {
  const { token, API_BASE_URL } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Impossible de récupérer les projets. Problème d\'autorisation ou de réseau.');
        }
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token, API_BASE_URL]);

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projets</h1>
        <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Projet
        </button>
      </div>

      {loading && <p className="mt-4 dark:text-white">Chargement des projets...</p>}
      {error && (
        <div className="mt-4 flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900 dark:text-red-200">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {!loading && !error && projects.map(project => (
          <div key={project.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-transform hover:scale-105">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-amber-500 uppercase">{project.abreviation}</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{project.nom}</h3>
                </div>
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  {project.wilaya}
                </div>
                <div className="mt-2">
                  <span 
                    className={`px-3 py-1 text-xs font-medium rounded-full 
                      ${project.statut === 'en étude' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                      ${project.statut === 'en exécution' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                    `}
                  >
                    {project.statut}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Page: Plans
 */
function PlansPage() {
  const MOCK_PLANS = [
    { id: 1, ref: 'DUNE-ADM-ARCH-001-R00', titre: 'Plan de Masse', statut: 'Approuvé CTC', projet: 'DUNE', lot: 'ARCH' },
    { id: 2, ref: 'DUNE-ADM-ARCH-002-R01', titre: 'Façade Principale', statut: 'En cours d\'approbation', projet: 'DUNE', lot: 'ARCH' },
    { id: 3, ref: 'TCO-HEB-GCIV-010-R00', titre: 'Plan de Coffrage Étage 1', statut: 'Approuvé CTC', projet: 'TCO', lot: 'GCIV' },
    { id: 4, ref: 'TCO-REST-ELEC-005-R00', titre: 'Schéma Unifilaire TGBT', statut: 'Déposé au MO', projet: 'TCO', lot: 'ELEC' },
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Plans</h1>
        <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700">
          <FileUp className="w-5 h-5 mr-2" />
          Nouveau Plan
        </button>
      </div>

      {/* Filtres */}
      <div className="mt-6 flex gap-4">
        <select className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option>Filtrer par Projet</option>
          <option>DUNE</option>
          <option>TCO</option>
        </select>
        <select className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option>Filtrer par Lot</option>
          <option>ARCH</option>
          <option>GCIV</option>
          <option>ELEC</option>
        </select>
        <select className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option>Filtrer par Statut</option>
          <option>Approuvé CTC</option>
          <option>En cours</option>
        </select>
      </div>
      
      {/* Tableau des plans */}
      <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Référence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Projet / Lot</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {MOCK_PLANS.map(plan => (
              <tr key={plan.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{plan.ref}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{plan.titre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span 
                    className={`px-3 py-1 text-xs font-medium rounded-full 
                      ${plan.statut === 'Approuvé CTC' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
                      ${plan.statut === 'En cours d\'approbation' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : ''}
                      ${plan.statut === 'Déposé au MO' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : ''}
                    `}
                  >
                    {plan.statut}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-bold">{plan.projet}</span> / {plan.lot}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-amber-600 hover:text-amber-800 mr-3"><History className="w-5 h-5" /></button>
                  <button className="text-blue-600 hover:text-blue-800 mr-3"><Edit2 className="w-5 h-5" /></button>
                  <button className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Page: Lots & Blocs
 */
function LotsBlocsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Lots & Blocs</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Simulation de la page de gestion des lots (ARCH, GCIV, ELEC...) et des blocs (ADM, HEB, REST...). 
        Accessible uniquement par les administrateurs.
      </p>
      {/* Contenu à implémenter */}
    </div>
  );
}

/**
 * Page: Utilisateurs
 */
function UsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Simulation de la page de gestion des utilisateurs (Gérant, Admin, Ingénieur...). 
        Accessible uniquement par les administrateurs.
      </p>
      {/* Contenu à implémenter */}
    </div>
  );
}

/**
 * Page: Paramètres
 */
function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Simulation de la page des paramètres généraux de l'application.
        Accessible uniquement par le gérant principal.
      </p>
      {/* Contenu à implémenter */}
    </div>
  );
}

/**
 * Composant Racine de l'application
 */
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}

function Root() {
  const { user } = useAuth();
  
  // Affiche l'écran de connexion si l'utilisateur n'est pas authentifié
  if (!user) {
    return <LoginPage />;
  }

  // Affiche l'application principale si l'utilisateur est connecté
  return <AppLayout />;
}

