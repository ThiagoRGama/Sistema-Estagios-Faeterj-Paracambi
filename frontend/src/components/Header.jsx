import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NavIcon, getNavItems } from './Sidebar';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavItems(user?.tipo);
  const mobileLabels =
    user?.tipo === 'admin'
      ? ['Painel', 'Usuarios', 'Senhas', 'Vagas', 'FAQ']
      : user?.tipo === 'coordenacao'
        ? ['Painel', 'Alunos', 'Avisos', 'Chat', 'Senhas']
        : ['Inicio', 'Documentos', 'Vagas', 'Avisos', 'Chat'];
  const mobileItems = navItems.filter((item) => mobileLabels.includes(item.label));
  const mobileGridClass = mobileItems.length === 5 ? 'grid-cols-5 max-w-md' : 'grid-cols-4 max-w-sm';
  const roleLabel = user?.tipo === 'admin' ? 'Admin' : user?.tipo === 'coordenacao' ? 'Coordenacao' : 'Aluno';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <NavLink to={user ? '/dashboard' : '/'} className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-800 text-sm font-black text-white shadow-lg shadow-brand-800/20">
              F
            </div>
            <div>
              <p className="text-xs font-black uppercase leading-none text-brand-700">FAETERJ</p>
              <p className="text-sm font-bold text-slate-900">Estagios</p>
            </div>
          </NavLink>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-900">{user.nome}</p>
              <p className="text-xs font-semibold uppercase text-slate-500">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {user && (
        <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-3 lg:hidden">
          <div className={`mx-auto grid ${mobileGridClass} gap-1 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_-12px_35px_rgba(15,23,42,0.16)] backdrop-blur`}>
            {mobileItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex h-16 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-bold transition ${
                    isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                        isActive
                          ? 'bg-brand-800 text-white shadow-md shadow-brand-800/20'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-white'
                      }`}
                    >
                      <NavIcon name={item.icon} className="h-4 w-4" />
                    </span>
                    <span className="leading-none">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </>
  );
};

export default Header;
