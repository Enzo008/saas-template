import { useNavigate } from 'react-router-dom';
import { useSidebar } from '@/shared/components/ui/sidebar';

export function useSidebarNavigation() {
  const { isMobile, setOpen } = useSidebar();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  return { handleNavigation };
}
