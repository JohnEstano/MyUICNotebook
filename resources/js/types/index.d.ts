import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
import { PageProps } from '@/types';

export interface Auth {
  user: User;
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export type Note = {
  id: number;
  notebook_id: number;
  created_by: number;
  title?: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Attachment = {
  id: number;
  url: string;
  filename: string;

};
type ResponseWithAttachment = {
  attachment: {
    id: number;
    url: string;
    filename: string;
  };
};

export type Notebook = {
  id: number;
  title: string;
  description: string;      
  color: string;            
  is_public: boolean;        
  creator: User;
  users: User[];
  notes: Note[];
  permission: 'owner' | 'editor' | 'viewer';
 
};


export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon | null;
  isActive?: boolean;
}

export interface SharedData {
  name: string;
  quote: { message: string; author: string };
  auth: Auth;
  ziggy: Config & { location: string };
  [key: string]: unknown;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  pivot?: {
    permission: 'owner' | 'editor' | 'viewer';
  };
}



export type Notebook = {
  id: number;
  title: string;
  description: string;
  color: string;
  creator: User;
  users: User[];
};