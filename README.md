# Tempo (TEMP_MAIL)

> A small React + Vite + TypeScript starter used inside the TEMP_MAIL workspace.

## What this is

This folder (`tempo`) contains a Vite + React + TypeScript frontend with TailwindCSS. It includes UI components, stories, and a small app entry at `src/main.tsx`.

## Prerequisites

- Node.js 18+ (recommended)
- npm (or pnpm/yarn) available in PATH

## Quick start (PowerShell)

Open PowerShell and run:

```powershell
Set-Location -Path "D:\TEMP_MAIL\tempo"

# install dependencies
npm install

# start the dev server (Vite)
npm run dev
```

The dev server will print a local URL (usually http://localhost:5173) — open that in your browser.

## Build & Preview (production)

```powershell
Set-Location -Path "D:\TEMP_MAIL\tempo"

# build (TypeScript check + Vite build)
npm run build

# preview the production build locally
npm run preview
```

## Supabase types helper

There is a helper script to generate Supabase types. It uses an environment variable `SUPABASE_PROJECT_ID`.

```powershell
# $env:SUPABASE_PROJECT_ID = "your-project-id"
npm run types:supabase
```

## Environment & Notes

- The project ships TypeScript and runs `tsc` as part of the `build` pipeline. Fix any TS errors shown by `tsc` before building.
- If you prefer `pnpm` or `yarn`, you can replace `npm install` with `pnpm install` or `yarn`.

## Git: commit & push to GitHub (PowerShell)

If you want to push this folder to a new GitHub repository, here's a minimal set of commands. Replace `<your-username>` and `<your-repo>` with the target repository name.

```powershell
Set-Location -Path "D:\TEMP_MAIL\tempo"

# initialize (if not already a git repo)
git init

# create .gitignore if missing (node default)
if (-not (Test-Path -Path .gitignore)) {
  @"node_modules/
dist/
.env
"@ | Out-File -FilePath .gitignore -Encoding utf8
}

# add files, commit
git add .
git commit -m "chore: add tempo project files and README"

# add remote (create repo on GitHub first), then push
# Example remote URL (HTTPS):
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

If the remote already exists, either use `git remote set-url origin <url>` to update it or skip the `remote add` step.

Tip: you can create the remote repo quickly with the GitHub CLI:

```powershell
gh repo create <your-username>/<your-repo> --public --source=. --remote=origin --push
```

## Troubleshooting

- If `npm run dev` fails, paste the terminal errors here. Common fixes: update Node version, run `npm install` again, or resolve TypeScript errors.
- If ports conflict, Vite will suggest alternative ports in its output.

## License & Contact

This README was generated to help you run and push the `tempo` project. For changes, update this file.

---

Hindi short note: Agar aap chaho to main aapko git remote set karne aur push karne mein live madad kar sakta hoon — remote URL aur username bata dijiye.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
