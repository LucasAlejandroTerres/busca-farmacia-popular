export interface Farmacia {
  id: number;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  lat: number;
  lng: number;
  telefone: string;
  distancia?: number;
}

export type CategoriaRemedio =
  | "Asma"
  | "Diabetes"
  | "Hipertensão"
  | "Anticoncepção"
  | "Osteoporose"
  | "Dislipidemia"
  | "Doença de Parkinson"
  | "Glaucoma"
  | "Rinite"
  | "Diabetes Mellitus + Doença Cardiovascular"
  | "Dignidade e Bem-Estar";

export interface Medicamento {
  id: number;
  principioAtivo: string;
  categoria: CategoriaRemedio;
}

export const FARMACIAS_MOCK: Farmacia[] = [
  {
    id: 1,
    nome: "Farmácia São João",
    endereco: "Rua XV de Novembro, 1020",
    bairro: "Centro",
    cidade: "Curitiba",
    uf: "PR",
    lat: -25.4284,
    lng: -49.2733,
    telefone: "(41) 3321-5678",
  },
  {
    id: 2,
    nome: "Drogasil - Farmácia Popular",
    endereco: "Av. Batel, 530",
    bairro: "Batel",
    cidade: "Curitiba",
    uf: "PR",
    lat: -25.4375,
    lng: -49.2864,
    telefone: "(41) 3322-4400",
  },
  {
    id: 3,
    nome: "Droga Raia",
    endereco: "Rua Comendador Araújo, 255",
    bairro: "Bigorrilho",
    cidade: "Curitiba",
    uf: "PR",
    lat: -25.4412,
    lng: -49.2901,
    telefone: "(41) 3344-9900",
  },
  {
    id: 4,
    nome: "Ultrafarma Credenciada",
    endereco: "Av. República Argentina, 3112",
    bairro: "Água Verde",
    cidade: "Curitiba",
    uf: "PR",
    lat: -25.4518,
    lng: -49.2856,
    telefone: "(41) 3366-1122",
  },
  {
    id: 5,
    nome: "Farmácia Moderna",
    endereco: "Rua Marechal Deodoro, 890",
    bairro: "Centro",
    cidade: "Curitiba",
    uf: "PR",
    lat: -25.4221,
    lng: -49.2681,
    telefone: "(41) 3288-7755",
  },
  {
    id: 6,
    nome: "Pague Menos - FP",
    endereco: "Av. Iguaçu, 1502",
    bairro: "Rebouças",
    cidade: "Curitiba",
    uf: "PR",
    lat: -25.4467,
    lng: -49.2763,
    telefone: "(41) 3244-8899",
  },
];

export const FARMACIAS_GEOLOCALIZADAS: Farmacia[] = FARMACIAS_MOCK.map((f, i) => ({
  ...f,
  distancia: parseFloat((0.8 + i * 0.7).toFixed(1)),
}));

export const MEDICAMENTOS_MOCK: Medicamento[] = [
  { id: 1,  categoria: "Asma",                                    principioAtivo: "brometo de ipratrópio 0,02mg", nomesComerciais: ["Atrovent"] },
  { id: 2,  categoria: "Asma",                                    principioAtivo: "brometo de ipratrópio 0,25mg", nomesComerciais: ["Atrovent"] },
  { id: 3,  categoria: "Asma",                                    principioAtivo: "dipropionato de beclometasona 200mcg", nomesComerciais: ["Clenil", "Beclosol"] },
  { id: 4,  categoria: "Asma",                                    principioAtivo: "dipropionato de beclometasona 250mcg", nomesComerciais: ["Clenil", "Beclosol"] },
  { id: 5,  categoria: "Asma",                                    principioAtivo: "dipropionato de beclometasona 50mcg", nomesComerciais: ["Clenil", "Beclosol"] },
  { id: 6,  categoria: "Asma",                                    principioAtivo: "sulfato de salbutamol 100mcg", nomesComerciais: ["Aerolin"] },
  { id: 7,  categoria: "Asma",                                    principioAtivo: "sulfato de salbutamol 5mg", nomesComerciais: ["Aerolin"] },
  { id: 8,  categoria: "Diabetes",                                principioAtivo: "cloridrato de metformina 500mg", nomesComerciais: ["Glifage", "Dimefor"] },
  { id: 9,  categoria: "Diabetes",                                principioAtivo: "cloridrato de metformina 500mg - ação prolongada", nomesComerciais: ["Glifage XR"] },
  { id: 10, categoria: "Diabetes",                                principioAtivo: "cloridrato de metformina 850mg", nomesComerciais: ["Glifage", "Dimefor"] },
  { id: 11, categoria: "Diabetes",                                principioAtivo: "glibenclamida 5mg", nomesComerciais: ["Daonil"] },
  { id: 12, categoria: "Diabetes",                                principioAtivo: "insulina humana regular 100ui/ml", nomesComerciais: ["Novolin R", "Humulin R"] },
  { id: 13, categoria: "Diabetes",                                principioAtivo: "insulina humana 100ui/ml", nomesComerciais: ["Novolin N", "Humulin N"] },
  { id: 14, categoria: "Hipertensão",                             principioAtivo: "atenolol 25mg", nomesComerciais: ["Atenol", "Angipress"] },
  { id: 15, categoria: "Hipertensão",                             principioAtivo: "besilato de anlodipino 5mg", nomesComerciais: ["Pressat", "Cordil"] },
  { id: 16, categoria: "Hipertensão",                             principioAtivo: "captopril 25mg", nomesComerciais: ["Capoten"] },
  { id: 17, categoria: "Hipertensão",                             principioAtivo: "cloridrato de propranolol 40mg", nomesComerciais: ["Inderal"] },
  { id: 18, categoria: "Hipertensão",                             principioAtivo: "hidroclorotiazida 25mg", nomesComerciais: ["Diurix", "Clorana"] },
  { id: 19, categoria: "Hipertensão",                             principioAtivo: "losartana potássica 50mg", nomesComerciais: ["Aradois", "Cozaar", "Corus"] },
  { id: 20, categoria: "Hipertensão",                             principioAtivo: "maleato de enalapril 10mg", nomesComerciais: ["Renitec", "Enalal"] },
  { id: 21, categoria: "Hipertensão",                             principioAtivo: "espironolactona 25mg", nomesComerciais: ["Aldactone"] },
  { id: 22, categoria: "Hipertensão",                             principioAtivo: "furosemida 40mg", nomesComerciais: ["Lasix"] },
  { id: 23, categoria: "Hipertensão",                             principioAtivo: "succinato de metoprolol 25mg", nomesComerciais: ["Selozok"] },
  { id: 24, categoria: "Anticoncepção",                           principioAtivo: "acetato de medroxiprogesterona 150mg", nomesComerciais: ["Depo-Provera"] },
  { id: 25, categoria: "Anticoncepção",                           principioAtivo: "etinilestradiol 0,03mg + levonorgestrel 0,15mg", nomesComerciais: ["Microvlar", "Ciclo 21"] },
  { id: 26, categoria: "Anticoncepção",                           principioAtivo: "noretisterona 0,35mg", nomesComerciais: ["Micronor"] },
  { id: 27, categoria: "Anticoncepção",                           principioAtivo: "valerato de estradiol 5mg + enantato de noretisterona 50mg", nomesComerciais: ["Mesigyna"] },
  { id: 28, categoria: "Osteoporose",                             principioAtivo: "alendronato de sódio 70mg", nomesComerciais: ["Fosamax", "Osteoform"] },
  { id: 29, categoria: "Dislipidemia",                            principioAtivo: "sinvastatina 10mg", nomesComerciais: ["Zocor", "Sinvascor"] },
  { id: 30, categoria: "Dislipidemia",                            principioAtivo: "sinvastatina 20mg", nomesComerciais: ["Zocor", "Sinvascor"] },
  { id: 31, categoria: "Dislipidemia",                            principioAtivo: "sinvastatina 40mg", nomesComerciais: ["Zocor", "Sinvascor"] },
  { id: 32, categoria: "Doença de Parkinson",                     principioAtivo: "carbidopa 25mg + levodopa 250mg", nomesComerciais: ["Parkidopa"] },
  { id: 33, categoria: "Doença de Parkinson",                     principioAtivo: "cloridrato de benserazida 25mg + levodopa 100mg", nomesComerciais: ["Prolopa"] },
  { id: 34, categoria: "Glaucoma",                                principioAtivo: "maleato de timolol 2,5mg", nomesComerciais: ["Timoptol"] },
  { id: 35, categoria: "Glaucoma",                                principioAtivo: "maleato de timolol 5mg", nomesComerciais: ["Timoptol"] },
  { id: 36, categoria: "Rinite",                                  principioAtivo: "budesonida 32mcg", nomesComerciais: ["Busonid", "Noex"] },
  { id: 37, categoria: "Rinite",                                  principioAtivo: "budesonida 50mcg", nomesComerciais: ["Busonid", "Noex"] },
  { id: 38, categoria: "Rinite",                                  principioAtivo: "dipropionato de beclometasona 50mcg/dose", nomesComerciais: ["Clenil", "Beclosol"] },
  { id: 39, categoria: "Diabetes Mellitus + Doença Cardiovascular", principioAtivo: "dapagliflozina 10mg", nomesComerciais: ["Forxiga"] },
  { id: 40, categoria: "Dignidade e Bem-Estar",                   principioAtivo: "absorvente higiênico", nomesComerciais: ["Sempre Livre", "Intimus"] },
  { id: 41, categoria: "Dignidade e Bem-Estar",                   principioAtivo: "fralda geriátrica", nomesComerciais: ["BigFral", "Plenitud"] },
];

export const ESTADOS_BRASIL = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];
