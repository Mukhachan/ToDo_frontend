import React, { useEffect, useState } from 'react';
import Modal from './AuthModal';


type Profile = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string;
};

// Вспомогательная функция для получения куки по имени
function getCookie(name: string): string | null {
  const matches = document.cookie.match(new RegExp(
    '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
  ));
  return matches ? decodeURIComponent(matches[1]) : null;
}

// Чтение домена из переменной окружения
const DOMAIN = import.meta.env.VITE_API_DOMAIN || 'localhost';

export const Header: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalLogin = () => {
    // Здесь ваша логика входа
    console.log('Выполняется вход');
    // После успешного входа:
    // setIsModalOpen(false);
    // setProfile(userData);
  };

  const handleModalRegister = () => {
    // Здесь ваша логика регистрации
    console.log('Выполняется регистрация');
    // После успешной регистрации:
    // setIsModalOpen(false);
    // Можно сразу выполнить вход или другие действия
  };

  // Получение профиля из API
  const fetchProfile = () => {
    setLoading(true);
    setError(null);

    const authToken = getCookie('authToken');
    if (!authToken) {
      setProfile(null);
      setLoading(false);
      return;
    }

    fetch(`http://${DOMAIN}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    })
      .then(async response => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Не удалось получить профиль');
        }
        return response.json();
      })
      .then((data: Profile) => {
        setProfile(data);
      })
      .catch((err) => {
        console.error('Ошибка при получении профиля:', err);
        setProfile(null);
        setError('Не удалось загрузить профиль');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);


  return (
    <div className="flex justify-end items-end ml-8 text-white font-sans">
      {!profile && !loading && (
        <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLogin={handleModalLogin}
        onRegister={handleModalRegister}
        isLoading={false}
        /> 
      )}
      {loading && <span>Загрузка профиля...</span>}
      {error && <span className="text-red-400 ml-4">{error}</span>}
      {profile && (
        <div className="text-sm text-gray-300">
          {profile.email}
        </div>
      )}
      

    </div>
  );
};



