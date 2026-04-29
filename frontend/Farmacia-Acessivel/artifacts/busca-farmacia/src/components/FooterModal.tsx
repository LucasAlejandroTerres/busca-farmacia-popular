import { Github, Linkedin, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function FooterModal() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="text-center md:text-left space-y-1">
          <p className="text-base font-medium text-gray-200">Busca Farmácia Popular</p>
          <p className="text-sm text-gray-500">
            Programa Farmácia Popular do Brasil — Governo Federal
          </p>
          <a
            href="https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Fonte: Dados Oficiais do Ministério da Saúde
          </a>
        </div>

        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-green-400 hover:text-green-300 text-sm font-medium underline underline-offset-4 transition-colors">
                Sobre o Projeto
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
                  <a
                    href="https://github.com/LucasAlejandroTerres?tab=repositories"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 font-bold border-2 text-gray-800 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all py-6 rounded-2xl"
                    >
                      <Github className="w-5 h-5" />
                      GitHub
                    </Button>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/lucasalejandroterres/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
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
      </div>
    </footer>
  );
}
