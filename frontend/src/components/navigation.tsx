"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  User, 
  HardHat, 
  BarChart3, 
  Home,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  GraduationCap,
  FileText,
  Award,
  Calendar,
  MessageSquare,
  Sparkles,
  Plus,
  ClipboardList
} from 'lucide-react';
import { api, getAuthHeaders } from '@/lib/api';
import { User as UserType } from '@/types/user';

interface NavigationProps {
  currentPath?: string;
}

export default function Navigation({ currentPath = '/' }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch(api.userProfiles.me, {
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  const isAuthenticated = !!user;
  const userRole = user?.role || 'guest';

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { href: '/', label: 'Home', icon: Home },
    ];

    if (!isAuthenticated) {
      return [
        ...baseItems,
        { href: '/courses', label: 'Courses & training', icon: HardHat },
        { href: '/about', label: 'About OSH', icon: FileText },
      ];
    }

    // Authenticated user navigation
    const roleBasedItems = {
      student: [
        { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
        { href: '/courses', label: 'My Courses', icon: HardHat },
        { href: '/profile', label: 'Profile', icon: User },
        { href: '/certificates', label: 'Certificates', icon: Award },
      ],
      instructor: [
        { href: '/instructors', label: 'Instructor Dashboard', icon: BarChart3 },
        { href: '/course-management', label: 'Manage Courses', icon: HardHat },
        { href: '/course-creation', label: 'Create Course', icon: Plus },
        { href: '/ai-content-builder', label: 'AI Content Builder', icon: Sparkles },
        { href: '/observations', label: 'Observations', icon: ClipboardList },
        { href: '/students', label: 'Students', icon: Users },
        { href: '/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/schedule', label: 'Schedule', icon: Calendar },
      ],
      admin: [
        { href: '/admin', label: 'Admin Dashboard', icon: BarChart3 },
        { href: '/users', label: 'User Management', icon: Users },
        { href: '/courses', label: 'Course Management', icon: HardHat },
        { href: '/instructors', label: 'Instructor Management', icon: GraduationCap },
        { href: '/analytics', label: 'System Analytics', icon: BarChart3 },
        { href: '/settings', label: 'System Settings', icon: Settings },
      ]
    };

    return roleBasedItems[userRole as keyof typeof roleBasedItems] || baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 min-h-[4.5rem]">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-teal-700 rounded-lg flex items-center justify-center">
                <HardHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Operator Skills Hub</span>
            </Link>
          </div>

          {/* Medium Screen Navigation (shows only key items) */}
          <nav className="hidden md:flex lg:hidden space-x-1">
            {navigationItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-100 text-teal-700 shadow-sm'
                      : 'text-slate-700 hover:text-teal-700 hover:bg-slate-50 hover:shadow-sm'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Large Screen Navigation (shows all items) */}
          <nav className="hidden lg:flex space-x-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-teal-100 text-teal-700 shadow-sm'
                      : 'text-slate-700 hover:text-teal-700 hover:bg-slate-50 hover:shadow-sm'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2.5" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 p-2"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </Button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.profile?.first_name} {user?.profile?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-blue-600 capitalize">{userRole}</p>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                    
                    {userRole === 'student' && (
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        My Dashboard
                      </Link>
                    )}
                    
                    {userRole === 'instructor' && (
                      <Link
                        href="/instructors"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Instructor Dashboard
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-4 pt-4 pb-6 space-y-2 sm:px-6 bg-white border-t">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-teal-100 text-teal-700 shadow-sm'
                        : 'text-slate-700 hover:text-teal-700 hover:bg-slate-50 hover:shadow-sm'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-4" />
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.profile?.first_name} {user?.profile?.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-blue-600 capitalize">{userRole}</p>
                    </div>
                    <Link href="/profile" className="w-full">
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-gray-600 hover:text-gray-900"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" className="w-full">
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/login" className="w-full">
                      <Button className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

