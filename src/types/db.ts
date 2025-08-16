export type Member = {
  id: string;
  nome: string;
  contato?: string | null;
  created_at?: string;
};

export type Plan = {
  id: string;
  nome: string;
  valor_mensal: number;
  periodicidade?: string | null;
  ativo: boolean;
  created_at?: string;
};
