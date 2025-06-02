import { Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-zinc-900 text-zinc-300 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-2xl font-bold text-white hover:text-amber-400 transition-colors">
              Almeida Filmes
            </Link>
            <p className="mt-2 text-sm">
              Projeto desenvolvido com React, TypeScript e TMDB API
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <p className="mb-2">Conecte-se comigo:</p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/Gabriel-Almeida0" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "p-2 rounded-full bg-zinc-800 hover:bg-amber-500 hover:text-zinc-900",
                  "transition-colors duration-200"
                )}
              >
                <Github size={20} />
              </a>
              <a 
                href="https://www.linkedin.com/in/gabriel-almeida-695b9933b/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={cn(
                  "p-2 rounded-full bg-zinc-800 hover:bg-amber-500 hover:text-zinc-900",
                  "transition-colors duration-200"
                )}
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="mailto:contato@example.com" 
                className={cn(
                  "p-2 rounded-full bg-zinc-800 hover:bg-amber-500 hover:text-zinc-900",
                  "transition-colors duration-200"
                )}
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 mt-6 pt-6 text-center text-sm">
          <p>© {currentYear} Almeida Filmes. Todos os direitos reservados.</p>
          <p className="mt-1">
            Dados fornecidos pela{' '}
            <a 
              href="https://www.themoviedb.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              The Movie Database API
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
} 