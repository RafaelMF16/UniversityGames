# UniversityGames Frontend

Frontend do sistema **Jogos Internos**, responsável pela interface web de gestão do evento, autenticação, navegação entre módulos, visualização das inscrições, confrontos, dashboard e telas de detalhe.

## Visão Geral

O frontend foi construído em Angular e consome a API Python do projeto para oferecer uma experiência administrativa responsiva para desktop, tablet e celular.

Hoje ele cobre:

- login por usuário e senha
- cadastro público de visitante autenticado
- acesso anônimo para consulta
- dashboard com métricas e próximos jogos
- gestão de esportes coletivos e individuais
- tela de detalhe de esporte
- gestão de confrontos
- tela de detalhe de confronto
- gestão de usuários para administrador
- paginação nas listagens
- exibição da previsão de confronto gerada por IA

## Tecnologias

- Angular 19
- TypeScript
- Angular Router
- Reactive Forms
- Angular Material
- Angular CDK
- RxJS
- CSS customizado

## Estrutura Principal

As áreas mais importantes do frontend ficam em [src/app](C:\Users\Rafae\Documents\Projetos\controle-de-jogos-internos-com-ia\UniversityGames\src\app):

- `pages`
  - `login`
  - `dashboard`
  - `esportes`
  - `esporte-detalhe`
  - `confrontos`
  - `confronto-detalhe`
  - `usuarios`
  - `pagina-principal`
- `components`
  - componentes reutilizáveis de cards, formulários, paginação, loading, sidebar e header
- `services`
  - estado e comunicação com a API
- `models`
  - contratos de dados usados pela aplicação
- `guards`
  - controle de acesso por perfil

## Rotas da Aplicação

As rotas estão definidas em [app.routes.ts](C:\Users\Rafae\Documents\Projetos\controle-de-jogos-internos-com-ia\UniversityGames\src\app\app.routes.ts).

Principais rotas:

- `/login`
- `/dashboard`
- `/esportes`
- `/esportes/:id`
- `/confrontos`
- `/confrontos/:id`
- `/usuarios`

## Perfis de Usuário no Frontend

O frontend trabalha com quatro perfis:

- `admin`
  - acesso total
  - gestão de usuários
  - gestão de esportes
  - gestão de confrontos
- `juiz`
  - gestão de confrontos e resultados
- `capitao`
  - gestão da própria equipe coletiva
  - pode se inscrever em esporte individual
- `visitante`
  - acesso de consulta
  - pode criar conta e se inscrever em modalidade individual

## Funcionalidades da Interface

### Login e sessão

- login com `username + senha`
- cadastro de visitante
- sessão baseada em autenticação da API
- guards para impedir acesso indevido às rotas

### Dashboard

- exibe total de inscrições
- exibe total de confrontos
- mostra próximos jogos
- usa cards minimalistas
- possui paginação na listagem de próximos jogos

### Esportes

- separação entre:
  - esportes coletivos
  - esportes individuais
- listagem em cards
- contador de itens
- paginação
- detalhe próprio por esporte

#### Coletivos

- nome da equipe
- modalidade
- curso
- período
- capitão
- membros
- habilidades por membro

#### Individuais

- inscrição vinculada ao usuário autenticado
- sem tela complexa de equipe
- sem composição de membros

### Confrontos

- listagem com filtros
- cards compactos
- detalhe completo do confronto
- acesso à previsão gerada por IA
- ações administrativas conforme permissão

### Usuários

- tela exclusiva para admin
- criação e edição de usuários
- listagem em cards
- paginação

## Padrões de Interface

O frontend foi reorganizado para usar um padrão visual mais consistente:

- menu lateral com navegação principal
- header fixo no topo
- listagens com cards simples e minimalistas
- detalhes em telas dedicadas
- paginação padronizada
- contadores em pill no topo das seções

## Como Executar

Na pasta [UniversityGames](C:\Users\Rafae\Documents\Projetos\controle-de-jogos-internos-com-ia\UniversityGames):

```powershell
npm install
npm start
```

Aplicação local:

[http://localhost:4200](http://localhost:4200)

## Build

Para gerar build:

```powershell
npm run build
```

Saída:

- `dist/university-games`

## Integração com a API

O frontend consome a API do backend para:

- autenticação
- usuários
- esportes
- confrontos
- dashboard
- previsão

As services principais de integração estão em:

- [auth-state.service.ts](C:\Users\Rafae\Documents\Projetos\controle-de-jogos-internos-com-ia\UniversityGames\src\app\services\auth-state.service.ts)
- [dashboard-state.service.ts](C:\Users\Rafae\Documents\Projetos\controle-de-jogos-internos-com-ia\UniversityGames\src\app\services\dashboard-state.service.ts)
- [equipes-state.service.ts](C:\Users\Rafae\Documents\Projetos\controle-de-jogos-internos-com-ia\UniversityGames\src\app\services\equipes-state.service.ts)
- [confrontos-state.service.ts](C:\Users\Rafae\Documents\Projetos\controle-de-jogos-internos-com-ia\UniversityGames\src\app\services\confrontos-state.service.ts)
- [usuarios-state.service.ts](C:\Users\Rafae\Documents\Projetos\controle-de-jogos-internos-com-ia\UniversityGames\src\app\services\usuarios-state.service.ts)

## Observações Importantes

- a aplicação usa componentes standalone
- as telas estão responsivas para mobile e tablet
- a dashboard pagina localmente os confrontos já carregados no resumo
- as demais listagens usam paginação com contrato paginado da API
- ainda existe um warning de budget do Angular na build

## Uso Recomendado

Fluxo comum:

1. subir a API
2. rodar o frontend
3. fazer login com admin, juiz, capitão ou visitante
4. usar o dashboard para visão geral
5. cadastrar esportes
6. cadastrar confrontos
7. acompanhar detalhes, resultados e previsões
