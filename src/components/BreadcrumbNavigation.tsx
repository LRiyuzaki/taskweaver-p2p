
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbConfig {
  [key: string]: {
    label: string;
    parent?: string;
  };
}

const breadcrumbConfig: BreadcrumbConfig = {
  '/': { label: 'Dashboard' },
  '/dashboard': { label: 'Dashboard' },
  '/tasks': { label: 'Tasks', parent: '/' },
  '/client-management': { label: 'Clients', parent: '/' },
  '/reports': { label: 'Reports', parent: '/' },
  '/reports-list': { label: 'Reports List', parent: '/reports' },
  '/settings': { label: 'Settings', parent: '/' },
  '/advanced-settings': { label: 'Advanced Settings', parent: '/settings' },
  '/task-templates': { label: 'Task Templates', parent: '/tasks' },
  '/bulk-task-creation': { label: 'Bulk Creation', parent: '/tasks' },
  '/database': { label: 'Database', parent: '/settings' },
  '/help': { label: 'Help', parent: '/' },
};

export const BreadcrumbNavigation = ({ customItems }: { customItems?: Array<{ label: string; href?: string }> }) => {
  const location = useLocation();
  
  const getBreadcrumbItems = () => {
    if (customItems) {
      return [
        { label: 'Dashboard', href: '/' },
        ...customItems
      ];
    }
    
    const currentPath = location.pathname;
    const items = [];
    
    // Build breadcrumb trail
    let path = currentPath;
    const visited = new Set();
    
    while (path && !visited.has(path)) {
      visited.add(path);
      const config = breadcrumbConfig[path];
      
      if (config) {
        items.unshift({
          label: config.label,
          href: path === currentPath ? undefined : path
        });
        path = config.parent;
      } else {
        break;
      }
    }
    
    // Ensure we always have Dashboard as root
    if (items.length === 0 || items[0].href !== '/') {
      items.unshift({ label: 'Dashboard', href: '/' });
    }
    
    return items;
  };
  
  const items = getBreadcrumbItems();
  
  if (items.length <= 1) {
    return null;
  }
  
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link to={item.href} className="flex items-center">
                    {index === 0 && <Home className="h-4 w-4 mr-1" />}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="flex items-center">
                  {index === 0 && <Home className="h-4 w-4 mr-1" />}
                  {item.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
