import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Lista espelhada da validação do backend (profanity_filter.py).
// Atualizar nos dois lugares quando necessário.
const TERMOS_PROIBIDOS: string[] = [
  // Xingamentos gerais
  'puta', 'puto', 'vadia', 'vagabunda', 'vagabundo', 'safada', 'safado',
  'piranha', 'prostituta', 'canalha', 'corno', 'corna', 'cornao',
  'fdp', 'filhadaputa', 'filhodaputa', 'desgraçado',
  'idiota', 'imbecil', 'babaca', 'otario', 'cretino', 'retardado',
  'anta', 'besta', 'trouxa', 'vtnc', 'vaitomanocu', 'porra', 'merda',
  // Termos sexuais explícitos
  'buceta', 'xota', 'xoxota', 'ppk', 'xereca', 'boceta', 'perereca', 'piriquita', 'vagina', 'xana', 'xaninha',
  'caralho', 'pinto', 'rola', 'pau', 'penis', 'pênis',
  'cuzao', 'cuzão', 'cu', 'bunda', 'anus', 'ânus', 'furico', 'cuzinho',
  'foder', 'fuder', 'foda', 'fudeu', 'fodasse', 'fodase',
  'porno', 'pornô', 'putaria',
  'tesao', 'tesão',
  'punheta',
  // Variações com números
  'put4', 'fud3', 'c4ralho', 'buc3ta', 'p1nto',
  // Termos discriminatórios
  'viado', 'viadao', 'viadão', 'bicha', 'traveco',
  'sapatao', 'sapatão',
  // Inglês comum
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'cock',
  'whore', 'slut',
  // Compostos ofensivos
  'vaitomar', 'vtmnc', 'vsf',
];

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[._\-\s0-9]/g, '');    // remove separadores e números
}

export function profanityValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = String(control.value ?? '');
    if (!valor.trim()) {
      return null;
    }
    const normalizado = normalizar(valor);
    const encontrou = TERMOS_PROIBIDOS.some(termo => normalizado.includes(normalizar(termo)));
    return encontrou ? { palavrao: true } : null;
  };
}
