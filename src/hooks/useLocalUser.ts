import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useRef } from 'react';
import { User } from '../types/global.type';

export default function useLocalUser() {
  const localUser: React.MutableRefObject<User | null> = useRef(null);

  const jwtToken = Cookies.get('token');
  if (jwtToken) {
    localUser.current = jwtDecode(jwtToken);
  }

  return localUser.current;
}
