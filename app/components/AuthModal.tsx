import React, { useState } from "react";
import Cookies from 'js-cookie';

type User = {
  email: string;
  token?: string;
};
type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

const DOMAIN = import.meta.env.VITE_API_DOMAIN || "localhost";


const mockLogin = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`http://${DOMAIN}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: email,
      password: password,
    }).toString(),
  });
  const data = await response.json();

  if (response.status == 200) {
    return { email, token: data.access_token};
  }
  throw new Error("Неверный email или пароль");
};

const mockRegister = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`http://${DOMAIN}/register`, {
    method: "POST",
    headers: {
    'Content-Type': 'application/json;charset=utf-8'
    },
    body: JSON.stringify({
      email: email,
      password: password,
    })
  });
  const data = await response.json()
  if (password.length < 6) {
    throw new Error("Пароль должен содержать минимум 6 символов");
  }
  else if (response.status != 200) {
    throw new Error(data.detail)
  }
  return await mockLogin(email, password);
};

const Modal: React.FC<{
  isOpen: boolean | null;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string) => Promise<void>;
}> = ({ isOpen, onClose, onLogin, onRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoginView, setIsLoginView] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.includes("@")) {
      newErrors.email = "Введите корректный email";
    }

    if (password.length < 6) {
      newErrors.password = "Пароль должен содержать минимум 6 символов";
    }

    if (!isLoginView && password !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isLoginView) {
        await onLogin(email, password);
      } else {
        await onRegister(email, password);
      }
      // Сброс формы при успехе
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Произошла ошибка",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#000000b0] z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative text-[black] font-[Comfortaa]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 font-bold text-xl"
          aria-label="Закрыть"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {isLoginView ? "Вход в систему" : "Регистрация"}
        </h2>

        {errors.general && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded shadow appearance-none ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded shadow appearance-none ${
                errors.password ? "border-red-500" : ""
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {!isLoginView && (
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="confirmPassword"
              >
                Подтвердите пароль
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded shadow appearance-none ${
                  errors.confirmPassword ? "border-red-500" : ""
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs italic mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoginView ? (
                "Войти"
              ) : (
                "Зарегистрироваться"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLoginView(!isLoginView);
                setErrors({});
              }}
              className="w-full text-blue-600 hover:text-blue-800 text-sm"
            >
              {isLoginView
                ? "Нет аккаунта? Зарегистрироваться"
                : "Уже есть аккаунт? Войти"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const getUser = async (sessionId: string): Promise<any> => {
    const response = await fetch(`http://${DOMAIN}/users/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionId}`,
        },
    })
    const data = await response.json()
    if (data.email && data.hashed_password) {
        return { email: data.email, token: data.hashed_password }
    } else {
        return data.detail
    }
}

const AuthSection = () => {
  const sessionId = Cookies.get("sessionId")

  const [isModalOpen, setIsModalOpen] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [error, setError] = useState("");
  

  const authorized = async (sessionId: string) => {
    try {
      const user = await getUser(sessionId);
      if (user.token) {
        Cookies.set('sessionId', user.token, {
            expires: 14, 
            secure: false, // Только HTTPS (обязательно для прода)
            sameSite: 'strict', // Защита от CSRF-атак
            path: '/', // Доступ на всех страницах сайта
        });
        setProfile(user);
      }   

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
      throw err;
    } 
  };

  if (sessionId && profile==null) { authorized(sessionId) } 


  const handleLogin = async (email: string, password: string) => {
    try {
      setError("");
      const user = await mockLogin(email, password);
      if (user.token) {
        setProfile(user);
        setIsModalOpen(false);
        Cookies.set('sessionId', user.token, {
            expires: 14, 
            secure: false, // Только HTTPS (обязательно для прода)
            sameSite: 'strict', // Защита от CSRF-атак
            path: '/', // Доступ на всех страницах сайта
        });        
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
      throw err;
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      setError("");
      const user = await mockRegister(email, password);
      if (user.token) {
        setProfile(user);
        Cookies.set('sessionId', user.token, {
            expires: 14, 
            secure: false, // Только HTTPS (обязательно для прода)
            sameSite: 'strict', // Защита от CSRF-атак
            path: '/', // Доступ на всех страницах сайта
        }); 
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
      throw err;
    }
  };

  const handleLogout = () => {
    setProfile(null);
    Cookies.remove('sessionId');
  };

  return (
    <div className="flex justify-end items-end mr-8 text-white font-sans">
      {!profile && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-400 hover:bg-blue-500 text-gray-900 font-bold py-2 px-4 rounded"
        > Войти
        </button>
      )}

      {error && <span className="text-red-400 ml-4">{error}</span>}

      {profile && (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300">{profile.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-blue-400 hover:text-blue-300"
          > Выйти
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError("");
        }}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
};

export default AuthSection;
