import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';  // ⭐ NEW IMPORT
import { 
  MagnifyingGlassIcon, 
  DocumentTextIcon, 
  BeakerIcon, 
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const { user } = useAuth();  // ⭐ NEW: Get user from auth context

  const modules = [
    {
      id: 'research',
      title: 'Research & News',
      description: 'Análisis de noticias, investigación de mercado y seguimiento de tendencias.',
      icon: MagnifyingGlassIcon,
      color: 'bg-blue-500',
      link: '/modules/research',
      stats: { agents: 2, queries: 156 }
    },
    {
      id: 'ocr',
      title: 'OCR & Document Processing',
      description: 'Extracción y procesamiento de texto de documentos e imágenes.',
      icon: DocumentTextIcon,
      color: 'bg-green-500',
      link: '/modules/ocr',
      stats: { agents: 3, documents: 89 }
    },
    {
      id: 'rd',
      title: 'I+D & Innovation',
      description: 'Investigación y desarrollo, análisis de patentes y seguimiento tecnológico.',
      icon: BeakerIcon,
      color: 'bg-purple-500',
      link: '/modules/rd',
      stats: { projects: 12, patents: 45 }
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Analytics',
      description: 'Monitoreo de sistemas, análisis de datos y generación de reportes.',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      link: '/modules/monitoring',
      stats: { dashboards: 8, alerts: 23 }
    }
  ];

  const recentActivity = [
    { id: 1, action: 'News Agent ejecutado', module: 'Research & News', time: '5 min ago', status: 'completed' },
    { id: 2, action: 'Scraper Agent procesó 3 URLs', module: 'Research & News', time: '12 min ago', status: 'completed' },
    { id: 3, action: 'Análisis OCR completado', module: 'OCR', time: '1 hour ago', status: 'completed' },
    { id: 4, action: 'Reporte generado', module: 'I+D', time: '2 hours ago', status: 'completed' },
    { id: 5, action: 'Análisis de patentes finalizado', module: 'I+D', time: '3 hours ago', status: 'completed' },
    { id: 6, action: 'Dashboard actualizado', module: 'Monitoring', time: '4 hours ago', status: 'completed' },
    { id: 7, action: 'Scraper Agent ejecutado', module: 'Research & News', time: '5 hours ago', status: 'completed' },
    { id: 8, action: 'Proceso OCR completado', module: 'OCR', time: '6 hours ago', status: 'completed' }
  ];

  return (
    <div className="min-h-full">
      <div className="p-6 max-w-7xl mx-auto">
        {/* ⭐ CHANGED SECTION - Personalized Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido{user?.username ? `, ${user.username}` : ''} a SAIP
          </h1>
          <p className="text-lg text-gray-600">
            Sistema de Automatización Inteligente Petroil
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CogIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agentes Activos</p>
                <p className="text-2xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tareas Completadas</p>
                <p className="text-2xl font-semibold text-gray-900">1,247</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Módulos</p>
                <p className="text-2xl font-semibold text-gray-900">4</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <EyeIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-semibold text-gray-900">99.9%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Módulos Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {modules.map((module) => {
              const IconComponent = module.icon;
              return (
                <Link
                  key={module.id}
                  to={module.link}
                  className="block group"
                >
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group-hover:border-gray-300 group-hover:scale-[1.02]">
                    <div className="flex items-start">
                      <div className={`p-3 rounded-lg ${module.color}`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                          {module.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                          {module.description}
                        </p>
                        <div className="flex space-x-4 text-sm text-gray-500">
                          {Object.entries(module.stats).map(([key, value]) => (
                            <span key={key}>
                              <span className="font-medium">{value}</span> {key}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.module}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-sm text-gray-500 py-8">
          <p>Sistema SAIP v2.1.0 - Petroil © 2025</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;