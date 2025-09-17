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

interface NavigationItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasDropdown?: boolean;
  submenu?: NavigationItem[];
}

export default function Navigation({ currentPath = '/' }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
    setIsUserMenuOpen(false);
    window.location.href = '/';
  };

  const getNavigationItems = (): NavigationItem[] => {
    if (!isLoggedIn) {
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: '/courses', label: 'Courses', icon: HardHat },
        { href: '/about', label: 'About OSH', icon: FileText },
      ];
    }

    // Authenticated user navigation with dropdown support
    const roleBasedItems = {
      student: [
        { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
        { href: '/courses', label: 'My Courses', icon: HardHat },
        { href: '/profile', label: 'Profile', icon: User },
        { href: '/certificates', label: 'Certificates', icon: Award },
      ],
      instructor: [
        { href: '/instructors', label: 'Dashboard', icon: BarChart3 },
        { 
          label: 'Course Management', 
          icon: HardHat, 
          hasDropdown: true,
          submenu: [
            { href: '/course-management', label: 'Manage Courses', icon: HardHat },
            { href: '/course-creation', label: 'Create Course', icon: Plus },
            { href: '/ai-content-builder', label: 'AI Content Builder', icon: Sparkles },
          ]
        },
        { 
          label: 'Student Management', 
          icon: Users, 
          hasDropdown: true,
          submenu: [
            { href: '/students', label: 'Student Directory', icon: Users },
            { href: '/observations', label: 'Observations', icon: ClipboardList },
            { href: '/assessments', label: 'Assessments', icon: Award },
          ]
        },
        { href: '/schedule', label: 'Schedule', icon: Calendar },
        { href: '/analytics', label: 'Analytics', icon: BarChart3 },
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

    return roleBasedItems[userRole as keyof typeof roleBasedItems] || [];
  };

  const isLoggedIn = !!user;
  const userRole = user?.role || 'student';
  const navigationItems = getNavigationItems();

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const isActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath.startsWith(href);
  };

  const isDropdownActive = (submenu: NavigationItem[]) => {
    return submenu.some(item => item.href && isActive(item.href));
  };

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-teal-600 rounded-lg mr-3 animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center mr-3">
                <HardHat className="h-6 w-6 text-white" />
              </div>
              <div className="text-xl font-bold text-gray-900">
                Operator Skills Hub
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <div key={item.label} className="relative">
                {item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        isDropdownActive(item.submenu || [])
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <div className="py-1">
                          {item.submenu?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href!}
                              className={`flex items-center px-4 py-2 text-sm transition-colors ${
                                isActive(subItem.href!)
                                  ? 'bg-teal-50 text-teal-700'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <subItem.icon className="h-4 w-4 mr-3" />
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href!)
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'text-gray-700 hover:text-teal-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 rounded-md p-2"
                >
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-teal-600" />
                  </div>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        {user?.email}
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <div key={item.label}>
                  {item.hasDropdown ? (
                    <div>
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      </button>
                      {openDropdown === item.label && (
                        <div className="ml-6 space-y-1">
                          {item.submenu?.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href!}
                              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                              onClick={() => {
                                setIsMenuOpen(false);
                                setOpenDropdown(null);
                              }}
                            >
                              <subItem.icon className="h-4 w-4 mr-3" />
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href!}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(openDropdown || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpenDropdown(null);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </header>
  );
}
