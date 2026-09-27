import React, { createContext, useContext, useState, useEffect } from 'react';
import { Usuario, PeticionLogin, PeticionRegistro } from '../types';
import { clienteApi } from '../api/cliente_api';

interface ContextoAutenticacionTipo {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
  iniciarSesion: (datos: PeticionLogin) => Promise<void>;
  registrarUsuario: (datos: PeticionRegistro) => Promise<void>;
  cerrarSesion: () => void;
  tieneRol: (rolesPermitidos: string[]) => boolean;
}

const ContextoAutenticacion = createContext<ContextoAutenticacionTipo | undefined>(undefined);

export const ProveedorAutenticacion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token_academico_jwt'));
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const tokenGuardado = localStorage.getItem('token_academico_jwt');
      if (tokenGuardado) {
        try {
          const perfil = await clienteApi.obtenerPerfilUsuario();
          setUsuario(perfil);
          setToken(tokenGuardado);
        } catch (error) {
          console.error("Sesión expirada o token inválido:", error);
          localStorage.removeItem('token_academico_jwt');
          setUsuario(null);
          setToken(null);
        }
      }
      setCargando(false);
    };

    verificarSesion();
  }, []);

  const iniciarSesion = async (datos: PeticionLogin) => {
    const respuesta = await clienteApi.iniciarSesion(datos);
    localStorage.setItem('token_academico_jwt', respuesta.access_token);
    setToken(respuesta.access_token);
    setUsuario(respuesta.usuario);
  };

  const registrarUsuario = async (datos: PeticionRegistro) => {
    await clienteApi.registrarUsuario(datos);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token_academico_jwt');
    setToken(null);
    setUsuario(null);
  };

  const tieneRol = (rolesPermitidos: string[]): boolean => {
    if (!usuario) return false;
    return rolesPermitidos.includes(usuario.rol);
  };

  return (
    <ContextoAutenticacion.Provider
      value={{
        usuario,
        token,
        cargando,
        iniciarSesion,
        registrarUsuario,
        cerrarSesion,
        tieneRol
      }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  );
};

export const useAutenticacion = (): ContextoAutenticacionTipo => {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error('useAutenticacion debe ser utilizado dentro de ProveedorAutenticacion');
  }
  return contexto;
};
