## PCG - Conversor de Imagens para Escala de Cinza (Frontend)

Aplicação web em Next.js para converter imagens coloridas em escala de cinza utilizando uma API externa. O usuário pode enviar uma imagem, escolher a técnica de conversão e baixar o resultado.

### Demo local
- URL local: `http://localhost:3000`

### Tecnologias
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS

## Funcionalidades
- Upload por clique ou arrastar/soltar
- Pré-visualização da imagem original
- Seleção da técnica de conversão
- Parâmetros condicionais para técnicas específicas
- Exibição e download da imagem convertida
- Tratamento de erro e estado de carregamento

## Como rodar
Requisitos: Node.js 18+ e pnpm (ou npm/yarn).

```bash
# instalar deps
pnpm install

# rodar em desenvolvimento
pnpm dev

# build de produção
pnpm build

# iniciar produção (após build)
pnpm start
```

Acesse `http://localhost:3000` no navegador.

## Integração com a API de Grayscale
Este frontend consome a API pública:
`https://apigrayfy.onrender.com/grayscale`

Envio:
- Método: POST
- Body: `multipart/form-data` com o campo `image` (arquivo da imagem)
- Query params: `technique` e parâmetros opcionais conforme a técnica

Resposta:
- A API pode retornar JSON (com Base64/URL) ou binário. O app lida com ambos.

### Técnicas suportadas e parâmetros
- `average` (alias: `avg`)
  - Fórmula: (R + G + B) / 3
  - Ex: `?technique=average`

- `luminosity` (alias: `luma`, `bt709`)
  - Fórmula: 0.2126 R + 0.7152 G + 0.0722 B
  - Ex: `?technique=luminosity`

- `lightness`
  - Fórmula: (max(R,G,B) + min(R,G,B)) / 2
  - Ex: `?technique=lightness`

- `desaturation`
  - Igual ao `lightness`
  - Ex: `?technique=desaturation`

- `single_channel`
  - Mantém apenas um canal: `r`, `g` ou `b`
  - Params: `channel=r|g|b`
  - Ex: `?technique=single_channel&channel=r`

- `weighted`
  - Define pesos manualmente (R, G, B) via `weights=wr,wg,wb`
  - Ex: `?technique=weighted&weights=0.3,0.5,0.2`
  - Sugestão BT.709: `0.2126,0.7152,0.0722`

## Onde editar
- Componente principal: `src/components/ImageUploader.tsx`
- Página inicial: `src/app/page.tsx`

## Deploy
Qualquer provider compatível com Next.js (Vercel recomendado).

Passos gerais:
```bash
pnpm build
# subir a pasta .next/. Ver documentação do provedor escolhido
```

## Licença
Este projeto é acadêmico/educacional. 
