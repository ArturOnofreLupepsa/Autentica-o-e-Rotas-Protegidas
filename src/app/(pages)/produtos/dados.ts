export type Produto = {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
};

export const produtos: Produto[] = [
  { id: 1, nome: "Processador Ryzen 5 5600", categoria: "Processadores", preco: 899.9, estoque: 14 },
  { id: 2, nome: "Placa de Vídeo RTX 4060 8GB", categoria: "Placas de Vídeo", preco: 2299.0, estoque: 6 },
  { id: 3, nome: "Memória DDR4 16GB 3200MHz", categoria: "Memórias", preco: 219.9, estoque: 32 },
  { id: 4, nome: "SSD NVMe 1TB", categoria: "Armazenamento", preco: 429.9, estoque: 4 },
  { id: 5, nome: "Placa-Mãe B550M", categoria: "Placas-Mãe", preco: 749.0, estoque: 9 },
  { id: 6, nome: "Fonte 650W 80 Plus Bronze", categoria: "Fontes", preco: 379.9, estoque: 0 },
  { id: 7, nome: "Gabinete Gamer Mid Tower", categoria: "Gabinetes", preco: 289.9, estoque: 11 },
  { id: 8, nome: "Monitor 24\" 144Hz", categoria: "Monitores", preco: 899.0, estoque: 3 },
];

export type StatusEstoque = "Disponível" | "Estoque baixo" | "Esgotado";

export function statusDoEstoque(estoque: number): StatusEstoque {
  if (estoque === 0) return "Esgotado";
  if (estoque <= 5) return "Estoque baixo";
  return "Disponível";
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
