import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, user]);

  return (
    <div className="grid min-h-screen place-items-center bg-[#f6f8fc] px-4">
      <section className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-xl shadow-slate-200/70">
        <div className="mx-auto grid h-28 w-28 place-items-center rounded-3xl bg-brand-800 shadow-lg shadow-brand-800/20">
          <span className="text-4xl font-black text-white">F</span>
        </div>
        <h1 className="mt-5 text-2xl font-black text-brand-800">FAETERJ</h1>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Estagios</p>
        <Link
          to="/login"
          className="mt-8 inline-flex h-11 min-w-40 items-center justify-center rounded-xl bg-brand-800 px-6 text-sm font-black uppercase text-white shadow-md shadow-brand-800/20 hover:bg-brand-900"
        >
          Acessar
        </Link>
      </section>
    </div>
  );
};

export default Home;
