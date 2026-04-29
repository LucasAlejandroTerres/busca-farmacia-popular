import { useState, useEffect } from "react";
import { Menu, X, Github, Linkedin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function LogoFarmacia({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className={className}>
      <g transform="rotate(-45 50 50)">
        <path d="M 25 30 h 50 a 20 20 0 0 1 0 40 h -50 a 20 20 0 0 1 0 -40 z" fill="#fbbf24" />
        <path d="M 25 30 h 25 v 40 h -25 a 20 20 0 0 1 0 -40 z" fill="#16a34a" />
        <line x1="50" y1="30" x2="50" y2="70" stroke="#ffffff" strokeWidth="3"/>
      </g>
    </svg>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const links = [
    { label: "Buscar", id: "buscar", href: "#buscar" },
    { label: "Medicamentos", id: "medicamentos", href: "#medicamentos" },
    { label: "Como Funciona", id: "duvidas", href: "#duvidas" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      let current = "";
      const scrollPos = window.scrollY + 180;
      
      links.forEach((link) => {
        const el = document.getElementById(link.id);
        if (el && el.offsetTop <= scrollPos) {
          current = link.id;
        }
      });
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 text-green-700 no-underline hover:opacity-90 transition-opacity">
          <LogoFarmacia className="w-8 h-8" />
          <span className="text-xl md:text-2xl font-black tracking-tight text-gray-900 leading-none">
            Busca<span className="text-green-600 font-black">Farmácia</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`px-4 py-2 font-semibold text-[15px] rounded-full transition-all duration-300 ${
                activeSection === l.id
                  ? "bg-green-100 text-green-800"
                  : "text-gray-500 hover:text-green-700 hover:bg-green-50"
              }`}
            >
              {l.label}
            </a>
          ))}
          <Dialog>
            <DialogTrigger asChild>
              <button className="px-4 py-2 font-semibold text-[15px] rounded-full transition-all duration-300 text-gray-500 hover:text-green-700 hover:bg-green-50">
                Créditos
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Sobre o Projeto
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-700 text-[15px] leading-relaxed">
                  Desenvolvido de forma independente por <strong>Lucas Alejandro Terres</strong>, este projeto foi criado para aproximar a tecnologia de quem mais precisa dela.
                </p>
                <p className="text-gray-700 text-[15px] leading-relaxed">
                  Foi utilizada a base de dados oficial do Ministério da Saúde para repensar toda a experiência do usuário. Como resultado, a inteligência de localização foi aplicada para facilitar o acesso à saúde pública, ajudando as pessoas a encontrarem farmácias credenciadas e medicamentos gratuitos com menos complicação e de maneira mais intuitiva.
                </p>
                <div className="flex gap-3 pt-4">
                  <a href="https://github.com/LucasAlejandroTerres?tab=repositories" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2 font-bold border-2 text-gray-800 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all py-6 rounded-2xl">
                      <Github className="w-5 h-5" />
                      GitHub
                    </Button>
                  </a>
                  <a href="https://www.linkedin.com/in/lucasalejandroterres/" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full flex items-center justify-center gap-2 font-bold bg-[#0A66C2] hover:bg-[#004182] text-white transition-all py-6 rounded-2xl shadow-md">
                      <Linkedin className="w-5 h-5" />
                      LinkedIn
                    </Button>
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </nav>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-2 shadow-lg absolute w-full pb-6">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => {
                setMenuOpen(false);
                setActiveSection(l.id);
              }}
              className={`font-semibold text-lg py-3 px-3 rounded-xl transition-colors ${
                activeSection === l.id
                  ? "bg-green-100 text-green-800"
                  : "text-gray-600 hover:text-green-700 hover:bg-green-50"
              }`}
            >
              {l.label}
            </a>
          ))}
          <Dialog>
            <DialogTrigger asChild>
              <button className="font-semibold text-lg py-3 px-3 rounded-xl transition-colors text-gray-600 hover:text-green-700 hover:bg-green-50 text-left">
                Créditos
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg rounded-3xl mx-4">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Sobre o Projeto
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-700 text-[15px] leading-relaxed">
                  Desenvolvido de forma independente por <strong>Lucas Alejandro Terres</strong>, este projeto foi criado para aproximar a tecnologia de quem mais precisa dela.
                </p>
                <p className="text-gray-700 text-[15px] leading-relaxed">
                  Foi utilizada a base de dados oficial do Ministério da Saúde para repensar toda a experiência do usuário. Como resultado, a inteligência de localização foi aplicada para facilitar o acesso à saúde pública, ajudando as pessoas a encontrarem farmácias credenciadas e medicamentos gratuitos com menos complicação e de maneira mais intuitiva.
                </p>
                <div className="flex gap-3 pt-4">
                  <a href="https://github.com/LucasAlejandroTerres?tab=repositories" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full flex items-center justify-center gap-2 font-bold border-2 text-gray-800 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all py-6 rounded-2xl">
                      <Github className="w-5 h-5" />
                      GitHub
                    </Button>
                  </a>
                  <a href="https://www.linkedin.com/in/lucasalejandroterres/" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full flex items-center justify-center gap-2 font-bold bg-[#0A66C2] hover:bg-[#004182] text-white transition-all py-6 rounded-2xl shadow-md">
                      <Linkedin className="w-5 h-5" />
                      LinkedIn
                    </Button>
                  </a>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </header>
  );
}
