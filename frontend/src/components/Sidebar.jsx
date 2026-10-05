import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const icons = {
  dashboard: (
    <>
      <path d="M4 5h6v6H4z" />
      <path d="M14 5h6v4h-6z" />
      <path d="M14 13h6v6h-6z" />
      <path d="M4 15h6v4H4z" />
    </>
  ),
  users: (
    <>
      <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M3 21a6 6 0 0 1 12 0" />
      <path d="M17 11a3 3 0 1 0 0-6" />
      <path d="M16 15a5 5 0 0 1 5 5" />
    </>
  ),
  file: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h4" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M5 20h14" />
    </>
  ),
  bell: (
    <>
      <path d="M18 16H6l1.5-2V9a4.5 4.5 0 0 1 9 0v5z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  chat: (
    <>
      <path d="M5 5h14v10H8l-3 3z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </>
  ),
  profile: (
    <>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),
  lock: (
    <>
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M6 11h12v10H6z" />
      <path d="M12 15v2" />
    </>
  ),
  building: (
    <>
      <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />
      <path d="M9 21v-5h3v5" />
      <path d="M8 7h1" />
      <path d="M12 7h1" />
      <path d="M8 11h1" />
      <path d="M12 11h1" />
      <path d="M3 21h18" />
    </>
  ),
  briefcase: (
    <>
      <path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1" />
      <path d="M4 7h16v12H4z" />
      <path d="M4 12h16" />
      <path d="M10 12v2h4v-2" />
    </>
  ),
  help: (
    <>
      <path d="M12 19h.01" />
      <path d="M9.5 9a2.8 2.8 0 1 1 4.9 1.8c-.8.8-2.4 1.4-2.4 3.2" />
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
    </>
  ),
};

export const NavIcon = ({ name, className = 'h-5 w-5' }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {icons[name] || icons.dashboard}
  </svg>
);

export const getNavItems = (tipo) => {
  if (tipo === 'admin') {
    return [
      { label: 'Painel', path: '/dashboard', icon: 'dashboard' },
      { label: 'Usuarios', path: '/admin/users', icon: 'users' },
      { label: 'Senhas', path: '/security', icon: 'lock' },
      { label: 'Seguro', path: '/insurance', icon: 'lock' },
      { label: 'Vagas', path: '/vacancies', icon: 'briefcase' },
      { label: 'Empresas', path: '/companies', icon: 'building' },
      { label: 'FAQ', path: '/faq', icon: 'help' },
    ];
  }

  if (tipo === 'coordenacao') {
    return [
      { label: 'Painel', path: '/dashboard', icon: 'dashboard' },
      { label: 'Alunos', path: '/profile', icon: 'users' },
      { label: 'Analise', path: '/documents', icon: 'file' },
      { label: 'Modelos', path: '/upload', icon: 'upload' },
      { label: 'Seguro', path: '/insurance', icon: 'lock' },
      { label: 'Vagas', path: '/vacancies', icon: 'briefcase' },
      { label: 'Empresas', path: '/companies', icon: 'building' },
      { label: 'FAQ', path: '/faq', icon: 'help' },
      { label: 'Avisos', path: '/notifications', icon: 'bell' },
      { label: 'Chat', path: '/messages', icon: 'chat' },
      { label: 'Senhas', path: '/security', icon: 'lock' },
    ];
  }

  return [
    { label: 'Inicio', path: '/dashboard', icon: 'dashboard' },
    { label: 'Dados', path: '/profile', icon: 'profile' },
    { label: 'Documentos', path: '/documents', icon: 'file' },
    { label: 'Enviar', path: '/upload', icon: 'upload' },
    { label: 'Seguro', path: '/student-insurance', icon: 'lock' },
    { label: 'Vagas', path: '/vacancies', icon: 'briefcase' },
    { label: 'Empresas', path: '/companies', icon: 'building' },
    { label: 'FAQ', path: '/faq', icon: 'help' },
    { label: 'Avisos', path: '/notifications', icon: 'bell' },
    { label: 'Chat', path: '/messages', icon: 'chat' },
  ];
};

const Sidebar = () => {
  const { user } = useAuth();
  const navItems = getNavItems(user?.tipo);
  const title = user?.tipo === 'admin' ? 'Admin' : user?.tipo === 'coordenacao' ? 'Coordenacao' : 'Aluno';

  return (
    <aside className="hidden min-h-screen w-60 border-r border-slate-200/80 bg-white px-5 py-6 shadow-[8px_0_30px_rgba(15,23,42,0.03)] lg:block">
      <div className="mb-8 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-800 text-sm font-black text-white shadow-lg shadow-brand-800/20">
          F
        </div>
        <h2 className="mt-3 text-base font-black text-brand-800">FAETERJ</h2>
        <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'border-brand-800 bg-brand-800 text-white shadow-md shadow-brand-800/15'
                  : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'
              }`
            }
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/15">
              <NavIcon name={item.icon} className="h-4 w-4" />
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
