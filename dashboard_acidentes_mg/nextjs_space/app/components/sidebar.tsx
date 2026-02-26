'use client';
import { Home, BarChart3, MapPin, AlertTriangle, TrendingUp, Settings, Brain, Map } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Visão Geral', icon: Home, href: '/', active: pathname === '/' },
    { name: 'Evolução', icon: TrendingUp, href: '/#evolucao', active: false },
    { name: 'Causas', icon: BarChart3, href: '/#causas', active: false },
    { name: 'Áreas Críticas', icon: AlertTriangle, href: '/#areas', active: false },
    { name: 'Rankings', icon: MapPin, href: '/#rankings', active: false },
    { name: 'Análise por KM', icon: Map, href: '/analise-km', active: pathname === '/analise-km' },
    { name: 'Predições IA', icon: Brain, href: '/ia', active: pathname === '/ia' },
    { name: 'Configurações', icon: Settings, href: '#settings', active: false },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-purple to-primary-cyan rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">PRF</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">PRF</h2>
            <p className="text-xs text-gray-500">Polícia Rodoviária</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    item.active
                      ? 'bg-primary-purple text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Dashboard v1.0<br />© 2025 PRF - MG
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;