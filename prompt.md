# Plataforma de Gestão de Abate de Gado

Desenvolva o frontend de uma plataforma de **Gestão de Abate de Gado**, utilizando **Next.js com App Router e TypeScript**.

A aplicação deve ser construída utilizando **Feature-Based Architecture**, com organização por domínio/funcionalidade e foco prioritário em **mobile-first**, mas mantendo boa experiência também em tablet e desktop.

## Objetivo

A plataforma será utilizada para gerenciar:

* Proprietários
* Fazendas
* Abates
* Agenda de abates

O sistema deve possuir uma interface simples, moderna, responsiva e adequada para uso frequente em dispositivos móveis.

---

# Arquitetura

Utilize obrigatoriamente **Feature-Based Architecture**.

A estrutura deve seguir aproximadamente este padrão:

```text
src/
├── app/
├── features/
│   ├── auth/
│   ├── proprietarios/
│   ├── fazendas/
│   ├── abates/
│   └── agenda/
├── components/
│   └── ui/
├── lib/
├── hooks/
└── types/
```

Cada feature deve concentrar seus próprios:

```text
components/
hooks/
services/
schemas/
types/
```

Evite colocar regras específicas de uma feature em pastas globais.

Componentes realmente reutilizáveis entre várias features podem ficar em:

```text
src/components/
```

---

# Tecnologias obrigatórias

Utilize obrigatoriamente:

* Next.js
* TypeScript
* App Router
* Tailwind CSS
* shadcn/ui para componentes de interface
* Lucide React para ícones
* Zod para validação
* Fetch API para comunicação HTTP
* Next.js Rewrite para comunicação com o backend

Não utilizar Axios.

---

# Comunicação com backend

As chamadas devem utilizar `fetch`.

Não utilizar diretamente a URL real do backend dentro dos componentes.

Configurar um rewrite do Next.js, por exemplo:

```text
/api/backend/:path*
```

redirecionando internamente para a URL do backend.

As features devem possuir uma camada de `services` responsável pelas chamadas HTTP.

Exemplo:

```text
features/
└── proprietarios/
    └── services/
        └── proprietario-service.ts
```

Evite realizar chamadas `fetch` diretamente dentro de componentes visuais quando puderem ser isoladas em services/hooks.

---

# Rotas da aplicação

Criar as seguintes páginas:

```text
/
├── login

/proprietarios
├── listagem de proprietários

/proprietarios/[id]
├── detalhes do proprietário

/fazendas
├── listagem de fazendas

/fazendas/[id]
├── detalhes da fazenda

/abates
├── listagem de abates

/agenda
├── agenda de abates
```

A rota `/` deve ser exclusivamente a página de login.

Após autenticação, o usuário será direcionado para uma página interna da aplicação.

---

# Layout da aplicação

A página de login deve possuir layout independente.

As páginas autenticadas devem compartilhar um layout comum contendo navegação para:

* Proprietários
* Fazendas
* Abates
* Agenda

No mobile, utilizar uma navegação adequada para telas pequenas.

No desktop, pode ser utilizada sidebar ou outra navegação que aproveite melhor o espaço disponível.

A navegação deve indicar visualmente a página atual.

---

# Página de Login

Rota:

```text
/
```

Criar um card centralizado contendo:

* Input de e-mail ou usuário
* Input de senha
* Botão "Entrar"

Utilizar:

* React Hook Form, caso necessário
* Zod para validação
* componentes shadcn/ui

Validações mínimas:

* usuário/e-mail obrigatório
* senha obrigatória

O botão deve possuir estado de loading durante a autenticação.

Também deve existir tratamento visual para erros de autenticação.

---

# Página de Proprietários

Rota:

```text
/proprietarios
```

A página deve possuir:

## Cabeçalho

* Título "Proprietários"
* Botão "Novo proprietário"

## Filtros

Permitir filtrar por:

* Nome
* CPF

Inicialmente, os filtros deverão ser realizados diretamente no frontend sobre os dados já carregados.

Não realizar uma nova requisição ao backend a cada alteração do filtro.

O filtro deve funcionar de forma instantânea.

## Listagem

Exibir cada proprietário utilizando cards responsivos.

Cada card deve apresentar as principais informações do proprietário, como:

* Nome
* CPF
* quantidade de fazendas, caso disponível

O card inteiro deve ser clicável.

Ao clicar, navegar para:

```text
/proprietarios/[id]
```

---

# Página de Detalhes do Proprietário

Rota:

```text
/proprietarios/[id]
```

Exibir todas as informações relevantes do proprietário.

Também exibir as fazendas vinculadas ao proprietário.

A tela deverá possuir ações para:

* Editar proprietário
* Adicionar nova fazenda para esse proprietário
* Visualizar uma fazenda existente

Ao clicar em uma fazenda, navegar para:

```text
/fazendas/[id]
```

---

# Página de Fazendas

Rota:

```text
/fazendas
```

## Cabeçalho

* Título "Fazendas"
* Botão "Nova fazenda"

## Filtros

Permitir filtrar por:

* Proprietário
* Nome da fazenda

Inicialmente, os filtros poderão ser realizados no frontend.

## Listagem

Exibir as fazendas utilizando cards.

Cada card deve apresentar informações relevantes como:

* Nome da fazenda
* Proprietário
* Cidade
* distância até o frigorífico, quando disponível

O card inteiro deve ser clicável.

Ao clicar, navegar para:

```text
/fazendas/[id]
```

---

# Página de Detalhes da Fazenda

Rota:

```text
/fazendas/[id]
```

Exibir as informações completas da fazenda.

Também apresentar informações relacionadas, quando disponíveis:

* Proprietário
* Abates realizados
* Próximos agendamentos

A tela deverá permitir:

* Editar a fazenda
* Visualizar o proprietário
* Registrar um novo abate
* Criar um novo agendamento

---

# Página de Abates

Rota:

```text
/abates
```

Criar uma página para consulta dos abates registrados.

## Filtros

Disponibilizar:

* Proprietário
* Fazenda
* Número do lote
* Data inicial
* Data final

Os filtros devem poder ser combinados.

Exemplo:

```text
Proprietário + Fazenda + período
```

ou:

```text
Número do lote
```

A listagem deve ser responsiva.

No mobile, priorizar cards.

No desktop, poderá utilizar tabela caso seja mais adequado para visualização das informações.

Cada abate deve apresentar pelo menos:

* Número do lote
* Data
* Proprietário
* Fazenda
* Quantidade de animais, quando disponível

---

# Página de Agenda

Rota:

```text
/agenda
```

Exibir os abates agendados.

A agenda deve permitir visualizar:

* Data
* Horário
* Fazenda
* Proprietário

Deve existir uma ação para criar um novo agendamento.

A experiência deve ser simples principalmente em dispositivos móveis.

Pode utilizar visualização em calendário ou lista cronológica, escolhendo a alternativa com melhor experiência mobile.

---

# Formulários

Todos os formulários devem:

* usar Zod para validação
* apresentar mensagens de erro abaixo dos campos
* possuir estado de loading
* impedir múltiplos submits
* possuir feedback de sucesso ou erro
* utilizar componentes do shadcn/ui

Schemas Zod devem ficar dentro da feature correspondente.

Exemplo:

```text
features/
└── proprietarios/
    └── schemas/
        └── proprietario-schema.ts
```

---

# Componentização

Evite componentes muito grandes.

Separar responsabilidades sempre que fizer sentido.

Exemplo para proprietários:

```text
features/proprietarios/
├── components/
│   ├── proprietario-card.tsx
│   ├── proprietario-filter.tsx
│   ├── proprietario-form.tsx
│   └── proprietario-list.tsx
├── hooks/
├── schemas/
├── services/
└── types/
```

Faça o mesmo para:

* fazendas
* abates
* agenda
* autenticação

---

# UI/UX

A interface deve seguir os seguintes princípios:

* Mobile-first
* Design limpo
* Boa hierarquia visual
* Espaçamento consistente
* Cards com informações objetivas
* Inputs confortáveis para uso no celular
* Botões com área de toque adequada
* Estados de loading
* Skeletons quando necessário
* Empty states para listas vazias
* Feedback visual para erros
* Feedback visual para operações concluídas

Utilizar ícones exclusivamente através de `lucide-react`.

Priorizar componentes existentes do `shadcn/ui` antes de criar componentes visuais do zero.

---

# Responsividade

Desenvolver primeiro considerando dispositivos móveis.

Depois adaptar para:

```text
mobile
tablet
desktop
```

Evitar layouts que dependam exclusivamente de tabelas, pois a aplicação será utilizada frequentemente pelo celular.

No mobile:

* filtros podem ficar dentro de Drawer/Sheet
* ações podem utilizar DropdownMenu
* formulários podem ocupar praticamente toda a largura
* cards devem ser priorizados para listagens

---

# Código

O código deve seguir:

* TypeScript tipado
* evitar uso de `any`
* componentes pequenos
* separação entre UI e regras de negócio
* services responsáveis pela comunicação HTTP
* schemas responsáveis pelas validações
* types/interfaces centralizados dentro de cada feature
* nomenclatura clara
* evitar duplicação de código

Não colocar toda a lógica dentro dos arquivos `page.tsx`.

Os arquivos `page.tsx` devem funcionar principalmente como composição das features.

---

# Primeira implementação

Na primeira implementação:

1. Crie a estrutura base do projeto.
2. Configure Feature-Based Architecture.
3. Configure shadcn/ui.
4. Configure o rewrite para o backend.
5. Crie o layout autenticado.
6. Crie todas as rotas.
7. Crie os componentes principais.
8. Crie os schemas Zod.
9. Crie os services utilizando `fetch`.
10. Crie dados mockados quando algum endpoint ainda não estiver disponível.
11. Implemente a responsividade mobile-first.
12. Garanta que o projeto compile sem erros.

Antes de finalizar, revise:

* erros de TypeScript
* imports quebrados
* componentes não utilizados
* responsividade
* organização da Feature-Based Architecture
* duplicação de código

Não alterar as tecnologias definidas neste documento sem necessidade.
