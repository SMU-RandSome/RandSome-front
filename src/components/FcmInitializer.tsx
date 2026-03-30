import { useAuth } from '@/store/authStore';
import { useFcmToken } from '@/hooks/useFcmToken';
import { useFcmMessages } from '@/hooks/useFcmMessages';

/**
 * FCM 토큰 등록 및 포그라운드 메시지 수신을 초기화하는 무(無) 렌더 컴포넌트.
 * ToastProvider와 AuthProvider 양쪽 하위에 위치해야 한다.
 */
const FcmInitializer: React.FC = () => {
  const { isAuthenticated } = useAuth();
  useFcmToken(isAuthenticated);
  useFcmMessages();
  return null;
};

export default FcmInitializer;
