import { Store, FileText, CheckSquare, Pill } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const STEPS = [
  {
    icon: Store,
    title: "Vá numa farmácia credenciada",
    desc: "Procure pelo adesivo \"Aqui Tem Farmácia Popular\" ou use nosso mapa acima para encontrar o local mais próximo.",
  },
  {
    icon: FileText,
    title: "Apresente sua Receita",
    desc: "A receita deve estar dentro da validade (180 dias para medicamentos em geral, ou 1 ano para anticoncepcionais e fraldas).",
  },
  {
    icon: CheckSquare,
    title: "Apresente seus Documentos",
    desc: "Basta mostrar um documento oficial com foto e o seu CPF. Não é necessário ter cadastro prévio no SUS.",
  },
];

import React from "react";

const FAQ_ITEMS: { id: string; pergunta: string; resposta: React.ReactNode }[] = [
  {
    id: "q4",
    pergunta: "Os medicamentos são realmente de graça?",
    resposta: (
      <>
        Sim! Desde fevereiro de 2025, o programa foi expandido para garantir <strong>gratuidade total (100%)</strong> em todos os 41 itens da lista. Isso inclui medicamentos para tratar colesterol, glaucoma e rinite, além de fraldas geriátricas. Não existe mais qualquer cobrança (copagamento) para o cidadão.
      </>
    ),
  },
  {
    id: "q_menstrual",
    pergunta: "Como retirar absorventes (Dignidade Menstrual)?",
    resposta: (
      <div className="space-y-3">
        <p>Destinado a pessoas de 10 a 49 anos inscritas no Cadastro Único (CadÚnico). O benefício é voltado para famílias com renda mensal de até meio salário-mínimo por pessoa, além de estudantes da rede pública e pessoas em situação de rua.</p>
        <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-[15px]">
          <strong className="block text-green-800 mb-2 font-bold uppercase tracking-wide text-xs">O que você precisa fazer:</strong>
          <ul className="space-y-2 text-gray-700">
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">1.</span>
              <span>Acesse o app ou site <strong>Meu SUS Digital</strong>.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">2.</span>
              <span>Gere sua <strong>"Autorização do Programa Dignidade Menstrual"</strong> (válida por 180 dias).</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">3.</span>
              <span>Leve a autorização (celular ou impressa) e seu documento com foto à farmácia credenciada.</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-gray-500 font-medium">* Cada pessoa tem direito a 40 absorventes a cada 56 dias.</p>
      </div>
    ),
  },
  {
    id: "q_fraldas",
    pergunta: "Quem pode pegar Fraldas Geriátricas?",
    resposta: (
      <>
        O beneficiário deve ter <strong>idade igual ou superior a 60 anos</strong> ou ser pessoa com deficiência. É obrigatório apresentar uma prescrição médica que contenha o <strong>CID (Classificação Internacional de Doenças)</strong> e a justificativa para o uso.
      </>
    ),
  },
  {
    id: "q5",
    pergunta: "Outra pessoa pode retirar para mim?",
    resposta: (
      <>
        Sim. O representante deve levar o <strong>documento oficial com foto e CPF do paciente</strong>, além do seu próprio documento e uma procuração ou documento legal que comprove a representação (necessário para casos de pacientes acamados ou impossibilitados).
      </>
    ),
  },
  {
    id: "q6",
    pergunta: "Posso usar receita de médico particular?",
    resposta:
      "Sim. O Farmácia Popular aceita receitas tanto do SUS quanto de médicos e clínicas particulares (convênios), desde que a receita esteja assinada, carimbada e dentro do prazo de validade.",
  }
];

export function FAQSection() {
  return (
    <section id="duvidas" className="py-20 px-4 bg-white border-t border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Como retirar seus medicamentos?
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            É muito simples. Você só precisa de uma receita válida e seus documentos básicos.
          </p>
        </div>

        {/* 3 Passos Visuais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 relative">
          {/* Linha conectando os passos (apenas desktop) */}
          <div className="hidden md:block absolute top-[3.5rem] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-gray-200 -z-10"></div>

          {STEPS.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-[0_0_0_4px_rgba(22,163,74,0.1)] flex items-center justify-center mb-6 relative group-hover:shadow-[0_0_0_4px_rgba(22,163,74,0.3)] transition-all">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <step.icon className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-green-600 text-white font-bold flex items-center justify-center border-2 border-white shadow-sm">
                  {idx + 1}
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 text-base leading-relaxed px-4">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ Reduzido para Exceções */}
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ainda tem dúvidas?</h3>
          <Accordion type="single" collapsible className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="bg-gray-50 rounded-2xl border border-gray-100 px-6 shadow-sm data-[state=open]:border-green-200 data-[state=open]:bg-white transition-colors"
              >
                <AccordionTrigger className="text-left text-[17px] font-bold text-gray-800 py-5 hover:text-green-700 hover:no-underline">
                  {item.pergunta}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base leading-relaxed pb-6">
                  {item.resposta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
