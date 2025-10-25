import React, { useState, useEffect, useMemo } from 'react';
// CORRECTION: Import des graphiques depuis 'recharts'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
// CORRECTION: Import des icônes SEULEMENT depuis 'lucide-react'
import { 
  LayoutDashboard, FolderKanban, FileText, Settings, Users, Building, MapPin, 
  ChevronDown, ChevronRight, Sun, Moon, LogOut, CheckCircle, XCircle, Clock, 
  FileDiff, Plus, Trash2, Edit2, Search, Filter, Home, Layers, Copy, Download
} from 'lucide-react';

// --- Données de Simulation (à remplacer par votre API) ---

// Données fictives pour les Wilayas, Daïras, Communes (Algérie)
const algeriaLocations = {
  "16 - Alger": {
    "Alger Centre": ["Alger Centre", "Sidi M'Hamed"],
    "Bab El Oued": ["Bab El Oued", "Oued Koriche", "Bologhine", "Raïs Hamidou", "Casbah"],
  },
  "31 - Oran": {
    "Oran": ["Oran"],
    "Es Senia": ["Es Senia", "Sidi Chami"],
  }
};

const mockUsers = [
  { id: 'u1', username: 'gérant.principal', role: 'Gérant principal', password: 'admin' }, // Mot de passe simulé
  { id: 'u2', username: 'admin.secondaire', role: 'Administrateur secondaire', password: 'admin' },
  { id: 'u3', username: 'ing.suivi', role: 'Ingénieur de suivi', password: 'user' },
  { id: 'u4', username: 'visiteur.temp', role: 'Visiteur', password: 'guest' },
];

const mockProjects = [
  { id: 'p1', nom: "Projet Pilote DUNE", abreviation: "DUNE", wilaya: "16 - Alger", daira: "Alger Centre", commune: "Alger Centre", adresse: "15 Rue Didouche Mourad", lien_maps: "[https://maps.google.com/](https://maps.google.com/)...", id_responsable: 'u3', statut: "en étude", date_creation: "2024-10-01", acces_visiteur: true },
  { id: 'p2', nom: "Complexe Hôtelier Oran", abreviation: "CHO", wilaya: "31 - Oran", daira: "Oran", commune: "Oran", adresse: "Front de Mer", lien_maps: "", id_responsable: 'u3', statut: "en exécution", date_creation: "2024-05-15", acces_visiteur: false },
  { id: 'p3', nom: "Tour de bureaux 'Le Phare'", abreviation: "PHARE", wilaya: "16 - Alger", daira: "Bab El Oued", commune: "Bab El Oued", adresse: "Place des Martyrs", lien_maps: "", id_responsable: 'u2', statut: "achevé", date_creation: "2023-01-10", acces_visiteur: false },
];

const mockLots = [
  { id: 'l1', id_projet: 'p1', nom: 'Architecture', abreviation: 'ARCH', ctc_approbation: true, sousLots: [{ id: 'sl1', nom: 'Plans de masse', abreviation: 'PM' }] },
  { id: 'l2', id_projet: 'p1', nom: 'Génie Civil', abreviation: 'GCIV', ctc_approbation: true, sousLots: [] },
  { id: 'l3', id_projet: 'p1', nom: 'Électricité', abreviation: 'ELEC', ctc_approbation: false, sousLots: [{ id: 'sl2', nom: 'Courants Forts', abreviation: 'CF' }, { id: 'sl3', nom: 'Courants Faibles', abreviation: 'Cf' }] },
  { id: 'l4', id_projet: 'p2', nom: 'Architecture', abreviation: 'ARCH', ctc_approbation: true, sousLots: [] },
];

const mockBlocks = [
  { id: 'b1', id_projet: 'p1', nom: 'Administration', abreviation: 'ADM' },
  { id: 'b2', id_projet: 'p1', nom: 'Hébergement', abreviation: 'HEB' },
  { id: 'b3', id_projet: 'p2', nom: 'Restaurant', abreviation: 'REST' },
];

const mockPlans = [
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

// Composant principal
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [isDarkMode, setIsDarkMode] = useDarkMode();

  // État de l'application
  const [projects, setProjects] = useState(mockProjects);
  const [selectedProjectId, setSelectedProjectId] = useState(mockProjects[0]?.id || null);
  
  // Mémorisation du projet sélectionné
  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);
  
  const handleLogin = (username, password) => {
    // Simulation d'une API d'authentification
    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    } else {
      // Gérer l'échec de la connexion (par exemple, afficher un message)
      console.error("Identifiants incorrects");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  if (currentPage === 'login') {
    return <LoginScreen onLogin={handleLogin} isDarkMode={isDarkMode} />;
  }

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans`}>
      {/* Barre latérale */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        handleLogout={handleLogout}
        currentUser={currentUser}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* En-tête */}
        <Header 
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode} 
          currentUser={currentUser}
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
        />

        {/* Zone de contenu défilable */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <PageContent 
            page={currentPage} 
            currentUser={currentUser} 
            selectedProject={selectedProject}
          />
        </main>
      </div>
    </div>
  );
}

// --- Composants de l'interface ---

// Écran de connexion
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
const Sidebar = ({ currentPage, setCurrentPage, handleLogout, currentUser }) => {
  const isAdmin = currentUser?.role === 'Gérant principal' || currentUser?.role === 'Administrateur secondaire';

  const NavItem = ({ icon, label, pageName }) => (
    <button
      onClick={() => setCurrentPage(pageName)}
      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        currentPage === pageName
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {React.createElement(icon, { className: "w-5 h-5 mr-3" })}
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col flex-shrink-0">
      <div className="flex items-center justify-center h-20 border-b dark:border-gray-700">
        <Building className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        <span className="ml-3 text-2xl font-bold text-gray-800 dark:text-gray-100">DUNE</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NavItem icon={LayoutDashboard} label="Tableau de bord" pageName="dashboard" />
        <NavItem icon={FolderKanban} label="Projets" pageName="projects" />
        
        {/* Section spécifique au projet */}
        <div className="pt-4 mt-4 border-t dark:border-gray-700">
          <h3 className="px-4 mb-2 text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Gestion du projet</h3>
          <NavItem icon={Layers} label="Blocs" pageName="blocks" />
          <NavItem icon={Home} label="Lots & Sous-Lots" pageName="lots" />
          <NavItem icon={FileText} label="Plans" pageName="plans" />
          <NavItem icon={FileDiff} label="Révisions" pageName="revisions" />
        </div>

        {/* Section Admin */}
        {isAdmin && (
          <div className="pt-4 mt-4 border-t dark:border-gray-700">
            <h3 className="px-4 mb-2 text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Administration</h3>
            <NavItem icon={Users} label="Utilisateurs" pageName="users" />
            <NavItem icon={Settings} label="Paramètres" pageName="settings" />
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
const Header = ({ isDarkMode, setIsDarkMode, currentUser, projects, selectedProjectId, setSelectedProjectId }) => {
  return (
    <header className="h-20 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
      {/* Sélecteur de projet */}
      <div className="flex items-center">
        <label htmlFor="project-select" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">Projet Actif :</label>
        <select
          id="project-select"
          value={selectedProjectId || ''}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-64 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.nom} ({p.abreviation})</option>
          ))}
        </select>
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

// Routeur de contenu de page
const PageContent = ({ page, currentUser, selectedProject }) => {
  switch (page) {
    case 'dashboard':
      return <DashboardPage />;
    case 'projects':
      return <ProjectsPage />;
    case 'plans':
      return <PlansPage selectedProject={selectedProject} />;
    // ... autres cas pour 'blocks', 'lots', 'revisions', 'users', 'settings'
    default:
      return <DashboardPage />;
  }
};


// --- Composants de Page (Exemples) ---

// Tableau de bord
const DashboardPage = () => {
  const pieData = [
    { name: 'Approuvés CTC', value: 40, color: '#10B981' }, // green-500
    { name: 'En cours', value: 30, color: '#3B82F6' }, // blue-500
    { name: 'Déposés MO', value: 20, color: '#F59E0B' }, // amber-500
    { name: 'Obsolètes', value: 10, color: '#EF4444' }, // red-500
  ];

  const barData = [
    { name: 'DUNE', "Plans Actifs": 40, "Révisions": 15 },
    { name: 'CHO', "Plans Actifs": 30, "Révisions": 5 },
    { name: 'PHARE', "Plans Actifs": 120, "Révisions": 45 },
  ];
  
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
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tableau de bord</h1>
      
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Projets Actifs" value={mockProjects.filter(p => p.statut !== 'achevé').length} icon={FolderKanban} colorClass="bg-blue-500" />
        <StatCard title="Plans Totaux" value={mockPlans.length} icon={FileText} colorClass="bg-green-500" />
        <StatCard title="Approbations CTC" value={mockPlans.filter(p => p.statut === 'Approuvé CTC').length} icon={CheckCircle} colorClass="bg-yellow-500" />
        <StatCard title="Utilisateurs" value={mockUsers.length} icon={Users} colorClass="bg-purple-500" />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Statut des Plans</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
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
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">Activité par Projet</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#374151' : '#FFFFFF', 
                  borderColor: isDarkMode ? '#4B5563' : '#E5E7EB' 
                }} 
                itemStyle={{ color: isDarkMode ? '#F3F4F6' : '#111827' }} 
              />
              <Legend />
              <Bar dataKey="Plans Actifs" fill="#3B82F6" />
              <Bar dataKey="Révisions" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Page Projets
const ProjectsPage = () => {
  // Statut pour filtrer la liste des projets
  const [filter, setFilter] = useState('');
  
  const getStatusColor = (statut) => {
    switch (statut) {
      case 'en étude': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'en exécution': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'achevé': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'suspendu': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestion des Projets</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Projet
        </button>
      </div>
      
      {/* Barre de filtre et de recherche */}
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
        <button className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
          <Download className="w-5 h-5 mr-2" />
          Exporter (PDF/Excel)
        </button>
      </div>

      {/* Tableau des projets */}
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
            {mockProjects.filter(p => filter ? p.statut === filter : true).map((project) => (
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
                  {mockUsers.find(u => u.id === project.id_responsable)?.username || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.statut)}`}>
                    {project.statut}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"><Edit2 className="w-5 h-5" /></button>

                  <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"><Trash2 className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Page Plans
const PlansPage = ({ selectedProject }) => {
  if (!selectedProject) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Veuillez d'abord sélectionner un projet.</div>;
  }
  
  const projectPlans = mockPlans.filter(p => p.id_projet === selectedProject.id);

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'Approuvé CTC': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "En cours d'approbation": return <Clock className="w-5 h-5 text-yellow-500" />; // <-- CORRECTION ICI
      case 'Déposé au MO': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'Obsolète': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Plans pour : {selectedProject.nom}</h1>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Nouveau Plan
        </button>
      </div>

      {/* Barre de filtre (simplifiée) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex space-x-4">
        <input 
          type="text" 
          placeholder="Filtrer par référence, titre, lot..."
          className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Des filtres plus avancés (par Lot, Bloc, Statut) pourraient être ajoutés ici */}
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
                <td className="px-6 py-4 whitespace-Nrap text-sm text-gray-700 dark:text-gray-300">{plan.titre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div><span className="font-semibold">Bloc:</span> {mockBlocks.find(b => b.id === plan.id_bloc)?.abreviation || 'N/A'}</div>
                  <div><span className="font-semibold">Lot:</span> {mockLots.find(l => l.id === plan.id_lot)?.abreviation || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <div>{plan.historique[plan.historique.length - 1].date}</div>
                  <div className="text-xs text-gray-400">par {plan.historique[plan.historique.length - 1].utilisateur}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button title="Gérer les révisions" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"><FileDiff className="w-5 h-5" /></button>
                  <button title="Copier la référence" className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"><Copy className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
