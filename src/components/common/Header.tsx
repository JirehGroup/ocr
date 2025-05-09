// @/components/common/Header.tsx

"use client";
import React from "react";
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';

const Header: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 z-50 flex space-x-2 p-0 m-0 items-center">
      <ThemeToggle />
      <LanguageToggle />
    </div>
  );
};

export default Header;