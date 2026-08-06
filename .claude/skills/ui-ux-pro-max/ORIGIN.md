# Origem desta skill

Código de terceiro, copiado para dentro do repositório (vendored).

| | |
|---|---|
| Projeto | [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Versão | 2.13.0 |
| Commit | `abb7f2fd5a083fa1ff55c326a963ff0d95c33f99` (2026-08-06) |
| Licença | MIT — ver `LICENSE` |

## Por que copiada em vez de instalada

Instalada como plugin, a skill só existe na máquina de quem instalou. Aqui ela
entra no repositório para que qualquer sessão do Claude Code aberta neste
projeto — incluindo as remotas, que sobem em containers descartáveis — enxergue
as mesmas regras de design. Não é conveniência: sem isso, cada ambiente daria
uma recomendação diferente.

## O que mudou em relação ao upstream

Uma coisa só, em `SKILL.md`: as 11 chamadas do script apontavam para
`${CLAUDE_PLUGIN_ROOT}/...`, variável que o Claude Code só preenche em
instalação por plugin. Como skill de projeto ela vem vazia, e todo comando
documentado quebraria. Os caminhos agora são relativos à raiz do repositório:

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system
```

Nada mais foi tocado — `data/`, `references/` e `scripts/` estão idênticos ao
upstream, então comparar com uma versão nova é um diff limpo.

## Atualizar

```bash
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git /tmp/uupm
rsync -a --delete --exclude __pycache__ \
  /tmp/uupm/.claude/skills/ui-ux-pro-max/ .claude/skills/ui-ux-pro-max/
# reaplicar a troca de caminho acima, depois:
python .claude/skills/ui-ux-pro-max/scripts/validate_data.py
python .claude/skills/ui-ux-pro-max/scripts/tests/test_core.py
python .claude/skills/ui-ux-pro-max/scripts/tests/test_design_system_mode.py
```

O `rsync` apaga o `LICENSE` e este arquivo, que ficam fora do diretório do
upstream — restaure os dois depois de sincronizar.

## O que não veio junto

O repositório de origem traz outras seis skills (`design`, `design-system`,
`brand`, `slides`, `banner-design`, `ui-styling`). Ficaram de fora porque
nenhuma é usada aqui, e `ui-styling` sozinha pesa 5,8 MB — 5,5 MB deles em 54
arquivos TTF para renderização em canvas, coisa que um projeto Next.js não
tem por que carregar no histórico do git.
